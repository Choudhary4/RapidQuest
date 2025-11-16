import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comparisonAPI } from '../../services/api';
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Megaphone,
  Award,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Clock
} from 'lucide-react';

export function ComparisonMatrix() {
  const [selectedMetric, setSelectedMetric] = useState('features');
  const queryClient = useQueryClient();

  // Fetch latest comparison matrix
  const { data: matrix, isLoading } = useQuery({
    queryKey: ['comparison', 'latest'],
    queryFn: () => comparisonAPI.getLatest().then((res) => res.data.data)
  });

  // Generate comparison matrix mutation
  const generateMutation = useMutation({
    mutationFn: comparisonAPI.generate,
    onSuccess: () => {
      queryClient.invalidateQueries(['comparison']);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    if (score >= 25) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBarColor = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const metrics = [
    { id: 'features', label: 'Features & Innovation', icon: Lightbulb },
    { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
    { id: 'campaigns', label: 'Marketing Campaigns', icon: Megaphone },
    { id: 'activity', label: 'Overall Activity', icon: TrendingUp },
    { id: 'sentiment', label: 'Market Sentiment', icon: Award }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitor Comparison Matrix</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-powered competitive analysis across features, pricing, and marketing
          </p>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          {generateMutation.isPending ? 'Generating...' : 'Generate Matrix'}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : !matrix ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No comparison matrix available yet
          </h3>
          <p className="text-gray-500 mb-4">
            Click "Generate Matrix" to create your first comparison analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Meta Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Generated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(matrix.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Competitors</p>
                  <p className="text-sm font-medium text-gray-900">
                    {matrix.competitors?.length || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Analysis Period</p>
                  <p className="text-sm font-medium text-gray-900">
                    Last 30 days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Summary */}
          {matrix.aiInsights?.summary && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
                AI Analysis Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {matrix.aiInsights.summary}
              </p>
            </div>
          )}

          {/* Rankings Overview */}
          {matrix.aiInsights?.rankings && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Innovation Leader */}
              {matrix.aiInsights.rankings.innovation && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">🏆 Innovation Leader</h3>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(matrix.aiInsights.rankings.innovation.score)}`}>
                      {matrix.aiInsights.rankings.innovation.score}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {matrix.aiInsights.rankings.innovation.leader}
                  </p>
                  <p className="text-sm text-gray-600">
                    {matrix.aiInsights.rankings.innovation.reason}
                  </p>
                </div>
              )}

              {/* Pricing Leader */}
              {matrix.aiInsights.rankings.pricing && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">💰 Pricing Strategy</h3>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(matrix.aiInsights.rankings.pricing.score)}`}>
                      {matrix.aiInsights.rankings.pricing.score}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {matrix.aiInsights.rankings.pricing.leader}
                  </p>
                  <p className="text-sm text-gray-600">
                    {matrix.aiInsights.rankings.pricing.reason}
                  </p>
                </div>
              )}

              {/* Marketing Leader */}
              {matrix.aiInsights.rankings.marketing && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">📢 Marketing Leader</h3>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(matrix.aiInsights.rankings.marketing.score)}`}>
                      {matrix.aiInsights.rankings.marketing.score}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {matrix.aiInsights.rankings.marketing.leader}
                  </p>
                  <p className="text-sm text-gray-600">
                    {matrix.aiInsights.rankings.marketing.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Metric Selector */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                      selectedMetric === metric.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {metric.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {matrix.comparisonData && matrix.comparisonData[selectedMetric] && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competitor
                      </th>
                      {selectedMetric === 'features' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Features
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Innovation Score
                          </th>
                        </>
                      )}
                      {selectedMetric === 'pricing' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pricing Updates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aggressiveness
                          </th>
                        </>
                      )}
                      {selectedMetric === 'campaigns' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaigns
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaign Strength
                          </th>
                        </>
                      )}
                      {selectedMetric === 'activity' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Updates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity Score
                          </th>
                        </>
                      )}
                      {selectedMetric === 'sentiment' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sentiment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Overall Score
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(matrix.comparisonData[selectedMetric])
                      .sort((a, b) => {
                        const scoreKey = selectedMetric === 'features' ? 'innovationScore'
                          : selectedMetric === 'pricing' ? 'pricingAggressiveness'
                          : selectedMetric === 'campaigns' ? 'campaignStrength'
                          : selectedMetric === 'activity' ? 'activityScore'
                          : 'overallScore';
                        return (b[1][scoreKey] || 0) - (a[1][scoreKey] || 0);
                      })
                      .map(([name, data]) => {
                        const scoreKey = selectedMetric === 'features' ? 'innovationScore'
                          : selectedMetric === 'pricing' ? 'pricingAggressiveness'
                          : selectedMetric === 'campaigns' ? 'campaignStrength'
                          : selectedMetric === 'activity' ? 'activityScore'
                          : 'overallScore';
                        const score = data[scoreKey] || 0;

                        return (
                          <tr key={name} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{name}</div>
                            </td>
                            {selectedMetric === 'features' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {data.totalFeatures} features
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                      <div
                                        className={`h-2 rounded-full ${getScoreBarColor(score)}`}
                                        style={{ width: `${score}%` }}
                                      />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(score)}`}>
                                      {score}
                                    </span>
                                  </div>
                                </td>
                              </>
                            )}
                            {selectedMetric === 'pricing' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {data.totalPricingUpdates} updates
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                      <div
                                        className={`h-2 rounded-full ${getScoreBarColor(score)}`}
                                        style={{ width: `${score}%` }}
                                      />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(score)}`}>
                                      {score}
                                    </span>
                                  </div>
                                </td>
                              </>
                            )}
                            {selectedMetric === 'campaigns' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {data.totalCampaigns} campaigns
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                      <div
                                        className={`h-2 rounded-full ${getScoreBarColor(score)}`}
                                        style={{ width: `${score}%` }}
                                      />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(score)}`}>
                                      {score}
                                    </span>
                                  </div>
                                </td>
                              </>
                            )}
                            {selectedMetric === 'activity' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {data.totalUpdates} updates
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                      <div
                                        className={`h-2 rounded-full ${getScoreBarColor(Math.min(100, score * 5))}`}
                                        style={{ width: `${Math.min(100, score * 5)}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {score}
                                    </span>
                                  </div>
                                </td>
                              </>
                            )}
                            {selectedMetric === 'sentiment' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {data.averageSentiment > 0 ? 'Positive' : data.averageSentiment < 0 ? 'Negative' : 'Neutral'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      score > 0 ? 'text-green-600 bg-green-100' :
                                      score < 0 ? 'text-red-600 bg-red-100' :
                                      'text-gray-600 bg-gray-100'
                                    }`}>
                                      {score.toFixed(2)}
                                    </span>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          {matrix.aiInsights?.strengths && matrix.aiInsights?.weaknesses && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ThumbsUp className="w-5 h-5 text-green-500 mr-2" />
                  Competitive Strengths
                </h3>
                <div className="space-y-4">
                  {Object.entries(matrix.aiInsights.strengths).map(([name, strengths]) => (
                    <div key={name}>
                      <h4 className="font-medium text-gray-900 mb-2">{name}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-600">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ThumbsDown className="w-5 h-5 text-red-500 mr-2" />
                  Areas for Improvement
                </h3>
                <div className="space-y-4">
                  {Object.entries(matrix.aiInsights.weaknesses).map(([name, weaknesses]) => (
                    <div key={name}>
                      <h4 className="font-medium text-gray-900 mb-2">{name}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-gray-600">{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Key Findings & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Findings */}
            {matrix.aiInsights?.keyFindings && matrix.aiInsights.keyFindings.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Key Findings</h3>
                <ul className="space-y-2">
                  {matrix.aiInsights.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {matrix.aiInsights?.recommendations && matrix.aiInsights.recommendations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommendations</h3>
                <ul className="space-y-2">
                  {matrix.aiInsights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
