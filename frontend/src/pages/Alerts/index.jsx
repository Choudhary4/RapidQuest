import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { alertsAPI } from '@/services/api';
import { getSeverityColor, formatDateTime } from '@/utils/helpers';

export function Alerts() {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsAPI.getAll({ limit: 50 }).then((res) => res.data.data),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => alertsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
      queryClient.invalidateQueries(['analytics']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => alertsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
      queryClient.invalidateQueries(['analytics']);
    },
  });

  const unreadCount = alerts?.filter((a) => !a.read).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsReadMutation.mutate()}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="large" />
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert._id}
              className={`hover:shadow-md transition-shadow ${
                !alert.read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">{alert.rule.replace('_', ' ')}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{alert.title}</h3>
                      </div>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(alert._id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-muted-foreground">{alert.message}</p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{alert.companyId?.name}</span>
                      <span>•</span>
                      <span>{formatDateTime(alert.createdAt)}</span>
                      {alert.updateId?.url && (
                        <>
                          <span>•</span>
                          <a
                            href={alert.updateId.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            View Update
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </>
                      )}
                    </div>

                    {/* Additional Metadata */}
                    {alert.metadata && (
                      <div className="mt-2 rounded-lg bg-muted p-3 text-sm">
                        {alert.metadata.previousValue && alert.metadata.newValue && (
                          <div>
                            <span className="font-medium">Change: </span>
                            <span className="line-through">{alert.metadata.previousValue}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium text-primary">
                              {alert.metadata.newValue}
                            </span>
                            {alert.metadata.changePercentage && (
                              <span className="ml-2">
                                ({alert.metadata.changePercentage.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No alerts yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
