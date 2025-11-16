const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Try Gmail first, then fall back to SendGrid
    if (config.gmailUser && config.gmailAppPassword) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.gmailUser,
          pass: config.gmailAppPassword.replace(/\s/g, '') // Remove any spaces from app password
        }
      });
      this.enabled = true;
      this.provider = 'gmail';
      logger.info('Email service initialized with Gmail');
    } else if (config.sendgridApiKey) {
      // Keep SendGrid as fallback
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(config.sendgridApiKey);
      this.sgMail = sgMail;
      this.enabled = true;
      this.provider = 'sendgrid';
      logger.info('Email service initialized with SendGrid');
    } else {
      this.enabled = false;
      this.provider = null;
      logger.warn('Email service disabled - no credentials configured');
    }
  }

  /**
   * Send alert email
   */
  async sendAlertEmail({ subject, competitor, message, updateUrl, severity }) {
    if (!this.enabled) {
      logger.info('Email not sent - email service not configured');
      return;
    }

    try {
      if (this.provider === 'gmail') {
        await this.sendAlertWithGmail({ subject, competitor, message, updateUrl, severity });
      } else if (this.provider === 'sendgrid') {
        await this.sendAlertWithSendGrid({ subject, competitor, message, updateUrl, severity });
      }
      logger.info(`Alert email sent: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send alert email using Gmail
   */
  async sendAlertWithGmail({ subject, competitor, message, updateUrl, severity }) {
    const html = this.buildAlertHTML({ competitor, subject, message, updateUrl, severity });

    const mailOptions = {
      from: `CompMonitor <${config.fromEmail}>`,
      to: config.adminEmail,
      subject: `🚨 [${severity.toUpperCase()}] ${subject}`,
      html: html
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send alert email using SendGrid
   */
  async sendAlertWithSendGrid({ subject, competitor, message, updateUrl, severity }) {
    const html = this.buildAlertHTML({ competitor, subject, message, updateUrl, severity });

    const msg = {
      to: config.adminEmail,
      from: config.fromEmail,
      subject: `🚨 [${severity.toUpperCase()}] ${subject}`,
      html: html
    };

    await this.sgMail.send(msg);
  }

  /**
   * Build alert email HTML
   */
  buildAlertHTML({ competitor, subject, message, updateUrl, severity }) {
    const severityColors = {
      low: '#3B82F6',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${severityColors[severity] || '#3B82F6'}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .badge { display: inline-block; padding: 5px 10px; background: ${severityColors[severity]}; color: white; border-radius: 3px; font-size: 12px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🚨 Competitive Alert</h2>
          </div>
          <div class="content">
            <p><strong>Competitor:</strong> ${competitor}</p>
            <p><span class="badge">${severity}</span></p>
            <h3>${subject}</h3>
            <p>${message}</p>
            ${updateUrl ? `<a href="${updateUrl}" class="button">View Update</a>` : ''}
          </div>
          <div class="footer">
            <p>CompMonitor - Competitive Intelligence Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send digest email
   */
  async sendDigestEmail({ subject, digestData, type }) {
    if (!this.enabled) {
      logger.info('Digest email not sent - email service not configured');
      return;
    }

    try {
      const html = this.buildDigestHTML(digestData, type);

      if (this.provider === 'gmail') {
        const mailOptions = {
          from: `CompMonitor <${config.fromEmail}>`,
          to: config.adminEmail,
          subject: subject,
          html: html
        };
        await this.transporter.sendMail(mailOptions);
      } else if (this.provider === 'sendgrid') {
        const msg = {
          to: config.adminEmail,
          from: config.fromEmail,
          subject: subject,
          html: html
        };
        await this.sgMail.send(msg);
      }

      logger.info(`Digest email sent: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send digest email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build digest email HTML
   */
  buildDigestHTML(digestData, type) {
    const updates = digestData.updates || [];
    const summary = digestData.summary || {};

    const updateCards = updates.slice(0, 10).map(update => `
      <div class="update-card">
        <h3 style="margin: 0 0 10px 0;">${update.title}</h3>
        <p style="margin: 5px 0;"><strong>${update.companyName}</strong> - ${update.category}</p>
        <p style="margin: 10px 0;">${update.summary}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #666;">
          Impact: ${update.impactScore}/10 - Sentiment: ${update.sentiment}
        </p>
      </div>
    `).join('');

    const highlights = summary.highlights ? summary.highlights.map(h => `<p>• ${h}</p>`).join('') : '<p>No highlights available</p>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
          .update-card { background: #f9fafb; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📊 ${type === 'daily' ? 'Daily' : 'Weekly'} Digest</h1>
            <p style="margin: 10px 0 0 0;">${summary.period || ''}</p>
          </div>
          <div class="content">
            <h2>Key Highlights</h2>
            ${highlights}
            <h2>Recent Updates (${updates.length} total)</h2>
            ${updateCards}
            ${updates.length > 10 ? `<p style="text-align: center;"><em>+ ${updates.length - 10} more</em></p>` : ''}
          </div>
          <div class="footer">
            <p>CompMonitor - Competitive Intelligence Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
