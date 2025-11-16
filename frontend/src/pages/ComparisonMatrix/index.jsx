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
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

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
    if (score >= 75) return 'text-green-400 bg-green-500/10';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/10';
    if (score >= 25) return 'text-orange-400 bg-orange-500/10';
    return 'text-red-400 bg-red-500/10';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitor Comparison Matrix</h1>
          <p className="text-muted-foreground">
            AI-powered competitive analysis across features, pricing, and marketing
          </p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          {generateMutation.isPending ? 'Generating...' : 'Generate Matrix'}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="large" />
        </div>
      ) : !matrix ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              No comparison matrix available yet
            </h3>
            <p className="text-muted-foreground">
              Click "Generate Matrix" to create your first comparison analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Meta Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Generated</p>
                    <p className="text-sm font-medium">
                      {formatDate(matrix.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Competitors</p>
                    <p className="text-sm font-medium">
                      {matrix.competitors?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Analysis Period</p>
                    <p className="text-sm font-medium">
                      Last 30 days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Summary */}
          {matrix.aiInsights?.summary && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6">
                <h2 className="mb-3 flex items-center text-xl font-bold">
                  <Lightbulb className="mr-2 h-6 w-6 text-yellow-400" />
                  AI Analysis Summary
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {matrix.aiInsights.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Rankings Overview */}
          {matrix.aiInsights?.rankings && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Innovation Leader */}
              {matrix.aiInsights.rankings.innovation && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">🏆 Innovation Leader</h3>
                      <Badge className={getScoreColor(matrix.aiInsights.rankings.innovation.score)}>
                        {matrix.aiInsights.rankings.innovation.score}
                      </Badge>
                    </div>
                    <p className="mb-2 text-lg font-bold">
                      {matrix.aiInsights.rankings.innovation.leader}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {matrix.aiInsights.rankings.innovation.reason}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pricing Leader */}
              {matrix.aiInsights.rankings.pricing && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">💰 Pricing Strategy</h3>
                      <Badge className={getScoreColor(matrix.aiInsights.rankings.pricing.score)}>
                        {matrix.aiInsights.rankings.pricing.score}
                      </Badge>
                    </div>
                    <p className="mb-2 text-lg font-bold">
                      {matrix.aiInsights.rankings.pricing.leader}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {matrix.aiInsights.rankings.pricing.reason}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Marketing Leader */}
              {matrix.aiInsights.rankings.marketing && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">📢 Marketing Leader</h3>
                      <Badge className={getScoreColor(matrix.aiInsights.rankings.marketing.score)}>
                        {matrix.aiInsights.rankings.marketing.score}
                      </Badge>
                    </div>
                    <p className="mb-2 text-lg font-bold">
                      {matrix.aiInsights.rankings.marketing.leader}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {matrix.aiInsights.rankings.marketing.reason}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Metric Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <Button
                      key={metric.id}
                      onClick={() => setSelectedMetric(metric.id)}
                      variant={selectedMetric === metric.id ? 'default' : 'outline'}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {metric.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          {matrix.comparisonData && matrix.comparisonData[selectedMetric] && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Competitor
                        </th>
                      {selectedMetric === 'features' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Features
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Innovation Score
                          </th>
                        </>
                      )}
                      {selectedMetric === 'pricing' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Pricing Updates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Aggressiveness
                          </th>
                        </>
                      )}
                      {selectedMetric === 'campaigns' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Campaigns
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Campaign Strength
                          </th>
                        </>
                      )}
                      {selectedMetric === 'activity' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Updates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Activity Score
                          </th>
                        </>
                      )}
                      {selectedMetric === 'sentiment' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Sentiment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Overall Score
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
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
                          <tr key={name} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium">{name}</div>
                            </td>
                            {selectedMetric === 'features' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  {data.totalFeatures} features
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 h-2 bg-muted rounded-full mr-2">
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  {data.totalPricingUpdates} updates
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 h-2 bg-muted rounded-full mr-2">
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  {data.totalCampaigns} campaigns
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 h-2 bg-muted rounded-full mr-2">
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  {data.totalUpdates} updates
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 h-2 bg-muted rounded-full mr-2">
                                      <div
                                        className={`h-2 rounded-full ${getScoreBarColor(Math.min(100, score * 5))}`}
                                        style={{ width: `${Math.min(100, score * 5)}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium">
                                      {score}
                                    </span>
                                  </div>
                                </td>
                              </>
                            )}
                            {selectedMetric === 'sentiment' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  {data.averageSentiment > 0 ? 'Positive' : data.averageSentiment < 0 ? 'Negative' : 'Neutral'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      score > 0 ? 'text-green-400 bg-green-500/10' :
                                      score < 0 ? 'text-red-400 bg-red-500/10' :
                                      'text-muted-foreground bg-muted'
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
            </CardContent>
          </Card>
          )}

          {/* Strengths & Weaknesses */}
          {matrix.aiInsights?.strengths && matrix.aiInsights?.weaknesses && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ThumbsUp className="w-5 h-5 text-green-400 mr-2" />
                    Competitive Strengths
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(matrix.aiInsights.strengths).map(([name, strengths]) => (
                      <div key={name}>
                        <h4 className="font-medium mb-2">{name}</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ThumbsDown className="w-5 h-5 text-red-400 mr-2" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(matrix.aiInsights.weaknesses).map(([name, weaknesses]) => (
                      <div key={name}>
                        <h4 className="font-medium mb-2">{name}</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {weaknesses.map((weakness, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Key Findings & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Findings */}
            {matrix.aiInsights?.keyFindings && matrix.aiInsights.keyFindings.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">🔍 Key Findings</h3>
                  <ul className="space-y-2">
                    {matrix.aiInsights.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span className="text-muted-foreground">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {matrix.aiInsights?.recommendations && matrix.aiInsights.recommendations.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">💡 Recommendations</h3>
                  <ul className="space-y-2">
                    {matrix.aiInsights.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        <span className="text-muted-foreground">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
