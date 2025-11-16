import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date) {
  if (!date) return 'N/A';

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return Math.floor(seconds) + ' seconds ago';
}

export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getCategoryColor(category) {
  const colors = {
    pricing: 'bg-blue-100 text-blue-800',
    campaign: 'bg-purple-100 text-purple-800',
    product_launch: 'bg-green-100 text-green-800',
    feature_update: 'bg-cyan-100 text-cyan-800',
    press: 'bg-gray-100 text-gray-800',
    negative_news: 'bg-red-100 text-red-800',
    other: 'bg-yellow-100 text-yellow-800',
  };
  return colors[category] || colors.other;
}

export function getSentimentColor(sentiment) {
  const colors = {
    positive: 'text-green-600',
    neutral: 'text-gray-600',
    negative: 'text-red-600',
  };
  return colors[sentiment] || colors.neutral;
}

export function getSeverityColor(severity) {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[severity] || colors.low;
}
