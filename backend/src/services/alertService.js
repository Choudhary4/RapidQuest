const Alert = require('../models/Alert');
const Update = require('../models/Update');
const Competitor = require('../models/Competitor');
const logger = require('../utils/logger');
const emailService = require('./emailService');
const { calculatePercentageChange } = require('../utils/helpers');

class AlertService {
  /**
   * Check if update should trigger alerts
   */
  async processUpdate(update) {
    try {
      const alerts = [];

      // Price drop alert
      if (update.category === 'pricing' && update.entities.price) {
        const priceAlert = await this.checkPriceChange(update);
        if (priceAlert) alerts.push(priceAlert);
      }

      // New product alert
      if (update.category === 'product_launch') {
        alerts.push(await this.createProductLaunchAlert(update));
      }

      // Campaign alert
      if (update.category === 'campaign') {
        alerts.push(await this.createCampaignAlert(update));
      }

      // Negative news alert
      if (update.category === 'negative_news' || update.sentimentScore < -0.5) {
        alerts.push(await this.createNegativeNewsAlert(update));
      }

      // High impact alert
      if (update.impactScore >= 8) {
        alerts.push(await this.createHighImpactAlert(update));
      }

      // Save alerts and send notifications
      for (const alert of alerts.filter(a => a)) {
        await this.saveAndNotifyAlert(alert);
      }

      return alerts;
    } catch (error) {
      logger.error(`Alert processing failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Check for significant price changes
   */
  async checkPriceChange(update) {
    try {
      // Find previous pricing updates for same competitor
      const previousUpdate = await Update.findOne({
        companyId: update.companyId,
        category: 'pricing',
        'entities.price': { $exists: true, $ne: null },
        _id: { $ne: update._id },
        detectedAt: { $lt: update.detectedAt }
      }).sort({ detectedAt: -1 });

      if (!previousUpdate) return null;

      // Extract numeric price values
      const currentPrice = this.extractPrice(update.entities.price);
      const previousPrice = this.extractPrice(previousUpdate.entities.price);

      if (!currentPrice || !previousPrice) return null;

      const percentageChange = calculatePercentageChange(previousPrice, currentPrice);

      // Alert if price dropped by 10% or more
      if (percentageChange <= -10) {
        return {
          updateId: update._id,
          companyId: update.companyId,
          rule: 'price_drop',
          severity: Math.abs(percentageChange) >= 20 ? 'high' : 'medium',
          title: `Price Drop Alert: ${percentageChange.toFixed(1)}%`,
          message: `Price dropped from ${previousUpdate.entities.price} to ${update.entities.price}`,
          metadata: {
            previousValue: previousPrice,
            newValue: currentPrice,
            changePercentage: percentageChange,
            triggerThreshold: -10
          },
          notificationChannels: ['email', 'in_app']
        };
      }

      // Alert if price increased significantly
      if (percentageChange >= 15) {
        return {
          updateId: update._id,
          companyId: update.companyId,
          rule: 'price_increase',
          severity: 'medium',
          title: `Price Increase Alert: +${percentageChange.toFixed(1)}%`,
          message: `Price increased from ${previousUpdate.entities.price} to ${update.entities.price}`,
          metadata: {
            previousValue: previousPrice,
            newValue: currentPrice,
            changePercentage: percentageChange
          },
          notificationChannels: ['in_app']
        };
      }

      return null;
    } catch (error) {
      logger.error(`Price change check failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract numeric price from text
   */
  extractPrice(priceText) {
    if (!priceText) return null;

    // Remove currency symbols and extract numbers
    const match = priceText.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }

    return null;
  }

  /**
   * Create product launch alert
   */
  async createProductLaunchAlert(update) {
    return {
      updateId: update._id,
      companyId: update.companyId,
      rule: 'new_product',
      severity: 'high',
      title: 'New Product Launch Detected',
      message: `${update.title}`,
      notificationChannels: ['email', 'in_app']
    };
  }

  /**
   * Create campaign alert
   */
  async createCampaignAlert(update) {
    return {
      updateId: update._id,
      companyId: update.companyId,
      rule: 'campaign_detected',
      severity: 'medium',
      title: 'New Marketing Campaign Detected',
      message: update.title,
      notificationChannels: ['in_app']
    };
  }

  /**
   * Create negative news alert
   */
  async createNegativeNewsAlert(update) {
    return {
      updateId: update._id,
      companyId: update.companyId,
      rule: 'negative_news',
      severity: 'high',
      title: 'Negative News Alert',
      message: update.title,
      notificationChannels: ['email', 'in_app']
    };
  }

  /**
   * Create high impact alert
   */
  async createHighImpactAlert(update) {
    return {
      updateId: update._id,
      companyId: update.companyId,
      rule: 'high_impact',
      severity: 'critical',
      title: 'High Impact Update',
      message: `${update.category}: ${update.title}`,
      notificationChannels: ['email', 'in_app']
    };
  }

  /**
   * Check for update spikes
   */
  async checkUpdateSpike(companyId) {
    try {
      // Get updates count for last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentCount = await Update.countDocuments({
        companyId,
        detectedAt: { $gte: oneHourAgo }
      });

      // Get average updates per hour for last week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekCount = await Update.countDocuments({
        companyId,
        detectedAt: { $gte: oneWeekAgo }
      });

      const avgPerHour = weekCount / (7 * 24);

      // Alert if recent count is 3x the average
      if (recentCount > avgPerHour * 3 && recentCount >= 5) {
        const competitor = await Competitor.findById(companyId);

        const alert = {
          updateId: null,
          companyId,
          rule: 'update_spike',
          severity: 'medium',
          title: 'Unusual Activity Detected',
          message: `${competitor.name} has ${recentCount} updates in the last hour (avg: ${avgPerHour.toFixed(1)})`,
          notificationChannels: ['in_app']
        };

        await this.saveAndNotifyAlert(alert);
      }
    } catch (error) {
      logger.error(`Update spike check failed: ${error.message}`);
    }
  }

  /**
   * Save alert and send notifications
   */
  async saveAndNotifyAlert(alertData) {
    try {
      const alert = await Alert.create(alertData);

      // Send notifications based on channels
      if (alertData.notificationChannels?.includes('email')) {
        await this.sendEmailNotification(alert);
      }

      logger.info(`Alert created: ${alert.title}`);

      return alert;
    } catch (error) {
      logger.error(`Failed to save/notify alert: ${error.message}`);
      return null;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(alert) {
    try {
      const competitor = await Competitor.findById(alert.companyId);
      const update = alert.updateId ? await Update.findById(alert.updateId) : null;

      await emailService.sendAlertEmail({
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        competitor: competitor.name,
        message: alert.message,
        updateUrl: update?.url,
        severity: alert.severity
      });
    } catch (error) {
      logger.error(`Failed to send alert email: ${error.message}`);
    }
  }

  /**
   * Get unread alerts
   */
  async getUnreadAlerts(limit = 10) {
    return await Alert.find({ read: false })
      .populate('companyId', 'name')
      .populate('updateId', 'title url')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId) {
    return await Alert.findByIdAndUpdate(
      alertId,
      { read: true, readAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new AlertService();
