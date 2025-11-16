import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { digestAPI } from '../../services/api';
import {
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  Briefcase,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export function Insights() {
  const [selectedTab, setSelectedTab] = useState('daily');
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    highlights: true,
    details: false
  });

  const queryClient = useQueryClient();

  // Fetch latest daily digest
  const { data: dailyDigest, isLoading: loadingDaily } = useQuery({
    queryKey: ['digest', 'daily'],
    queryFn: () => digestAPI.getLatestDaily().then((res) => res.data.data),
    enabled: selectedTab === 'daily'
  });

  // Fetch latest weekly digest
  const { data: weeklyDigest, isLoading: loadingWeekly } = useQuery({
    queryKey: ['digest', 'weekly'],
    queryFn: () => digestAPI.getLatestWeekly().then((res) => res.data.data),
    enabled: selectedTab === 'weekly'
  });

  // Generate daily digest mutation
  const generateDailyMutation = useMutation({
    mutationFn: digestAPI.generateDaily,
    onSuccess: () => {
      queryClient.invalidateQueries(['digest', 'daily']);
    }
  });

  // Generate weekly digest mutation
  const generateWeeklyMutation = useMutation({
    mutationFn: digestAPI.generateWeekly,
    onSuccess: () => {
      queryClient.invalidateQueries(['digest', 'weekly']);
    }
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleGenerateDigest = () => {
    if (selectedTab === 'daily') {
      generateDailyMutation.mutate();
    } else {
      generateWeeklyMutation.mutate();
    }
  };

  const currentDigest = selectedTab === 'daily' ? dailyDigest : weeklyDigest;
  const isLoading = selectedTab === 'daily' ? loadingDaily : loadingWeekly;
  const isGenerating = selectedTab === 'daily'
    ? generateDailyMutation.isPending
    : generateWeeklyMutation.isPending;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            AI-powered competitive intelligence summaries and strategic insights
          </p>
        </div>
        <Button
          onClick={handleGenerateDigest}
          disabled={isGenerating}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : `Generate ${selectedTab === 'daily' ? 'Daily' : 'Weekly'}`}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('daily')}
            className={`${
              selectedTab === 'daily'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Daily Summary
          </button>
          <button
            onClick={() => setSelectedTab('weekly')}
            className={`${
              selectedTab === 'weekly'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Weekly Strategy Insights
          </button>
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="large" />
        </div>
      ) : !currentDigest ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              No {selectedTab} digest available yet
            </h3>
            <p className="text-muted-foreground">
              Click "Generate {selectedTab === 'daily' ? 'Daily' : 'Weekly'}" to create your first digest.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Meta Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Generated</p>
                    <p className="text-sm font-medium">
                      {formatDate(currentDigest.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Updates</p>
                    <p className="text-sm font-medium">
                      {currentDigest.metadata?.totalUpdates || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Competitors Active</p>
                    <p className="text-sm font-medium">
                      {currentDigest.metadata?.competitorsActive || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Period</p>
                    <p className="text-sm font-medium">
                      {formatDate(currentDigest.period?.start)} - {formatDate(currentDigest.period?.end)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Summary Content */}
          {selectedTab === 'daily' && currentDigest.summary && (
            <div className="space-y-4">
              {/* Headline */}
              {currentDigest.summary.headline && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold">
                      {currentDigest.summary.headline}
                    </h2>
                  </CardContent>
                </Card>
              )}

              {/* Executive Summary */}
              <Card>
                <button
                  onClick={() => toggleSection('summary')}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent"
                >
                  <h3 className="text-lg font-semibold">Executive Summary</h3>
                  {expandedSections.summary ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.summary && (
                  <CardContent className="p-4 pt-0">
                    <p className="whitespace-pre-line text-muted-foreground">
                      {currentDigest.summary.summary}
                    </p>
                  </CardContent>
                )}
              </Card>

              {/* Highlights */}
              {currentDigest.summary.highlights && currentDigest.summary.highlights.length > 0 && (
                <Card>
                  <button
                    onClick={() => toggleSection('highlights')}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent"
                  >
                    <h3 className="text-lg font-semibold">Key Highlights</h3>
                    {expandedSections.highlights ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections.highlights && (
                    <CardContent className="p-4 pt-0">
                      <ul className="space-y-2">
                        {currentDigest.summary.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                            <span className="text-muted-foreground">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Detailed Sections */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('details')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Detailed Breakdown</h3>
                  {expandedSections.details ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.details && (
                  <div className="p-4 pt-0 space-y-4">
                    {currentDigest.summary.majorPricingMoves && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">💰 Major Pricing Moves</h4>
                        <p className="text-gray-700">{currentDigest.summary.majorPricingMoves}</p>
                      </div>
                    )}
                    {currentDigest.summary.productAnnouncements && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">🚀 Product Announcements</h4>
                        <p className="text-gray-700">{currentDigest.summary.productAnnouncements}</p>
                      </div>
                    )}
                    {currentDigest.summary.campaignChanges && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">📢 Campaign Changes</h4>
                        <p className="text-gray-700">{currentDigest.summary.campaignChanges}</p>
                      </div>
                    )}
                    {currentDigest.summary.negativePress && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">⚠️ Negative Press</h4>
                        <p className="text-gray-700">{currentDigest.summary.negativePress}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Weekly Summary Content */}
          {selectedTab === 'weekly' && currentDigest.summary && (
            <div className="space-y-4">
              {/* Headline */}
              {currentDigest.summary.headline && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentDigest.summary.headline}
                  </h2>
                </div>
              )}

              {/* Executive Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {currentDigest.summary.executiveSummary}
                </p>
              </div>

              {/* Strategic Insights */}
              {currentDigest.summary.strategicInsights && currentDigest.summary.strategicInsights.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Insights</h3>
                  <div className="space-y-3">
                    {currentDigest.summary.strategicInsights.map((insight, index) => (
                      <div key={index} className="flex items-start">
                        <TrendingUp className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitor Rankings */}
              {currentDigest.summary.competitorRankings && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Rankings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">🏆 Innovation Leader</h4>
                      <p className="text-gray-700">{currentDigest.summary.competitorRankings.innovation}</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">💰 Pricing Strategy</h4>
                      <p className="text-gray-700">{currentDigest.summary.competitorRankings.pricing}</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">📢 Marketing Leader</h4>
                      <p className="text-gray-700">{currentDigest.summary.competitorRankings.marketing}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {currentDigest.summary.recommendations && currentDigest.summary.recommendations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
                  <ul className="space-y-3">
                    {currentDigest.summary.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <Briefcase className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
