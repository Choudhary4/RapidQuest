import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { competitorsAPI, updatesAPI } from '@/services/api';
import { useNotificationStore } from '@/store';
import { formatDateTime } from '@/utils/helpers';
import { AddCompetitorModal } from './AddCompetitorModal';

export function Competitors() {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const { data: competitors, isLoading } = useQuery({
    queryKey: ['competitors'],
    queryFn: () => competitorsAPI.getAll().then((res) => res.data.data),
  });

  const refreshMutation = useMutation({
    mutationFn: (competitorId) => updatesAPI.refresh(competitorId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['updates']);
      queryClient.invalidateQueries(['competitors']);
      addNotification({
        type: 'success',
        title: 'Refresh Complete',
        description: data.data.message,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        description: error.response?.data?.error || 'Failed to refresh competitor',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => competitorsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['competitors']);
      addNotification({
        type: 'success',
        title: 'Success',
        description: 'Competitor deleted successfully',
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitors</h1>
          <p className="text-muted-foreground">
            Manage and monitor your competitors
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      {/* Competitors Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="large" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitors?.map((competitor) => (
            <Card key={competitor._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{competitor.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {competitor.baseUrl}
                    </p>
                  </div>
                  <Badge variant={competitor.active ? 'default' : 'secondary'}>
                    {competitor.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scrape Targets</span>
                    <span className="font-medium">{competitor.scrapeTargets?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Scraped</span>
                    <span className="font-medium">
                      {competitor.lastScrapedAt
                        ? formatDateTime(competitor.lastScrapedAt)
                        : 'Never'}
                    </span>
                  </div>
                  {competitor.industry && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="font-medium">{competitor.industry}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => refreshMutation.mutate(competitor._id)}
                    disabled={refreshMutation.isPending}
                  >
                    {refreshMutation.isPending ? (
                      <Spinner size="small" />
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(competitor._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddCompetitorModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
