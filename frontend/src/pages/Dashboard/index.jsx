import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Bell,
  Users,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { analyticsAPI, updatesAPI, alertsAPI } from '@/services/api';
import { CategoryChart } from './CategoryChart';
import { TimelineChart } from './TimelineChart';
import { RecentUpdates } from './RecentUpdates';
import { TopCompetitors } from './TopCompetitors';

export function Dashboard() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsAPI.getOverview().then((res) => res.data.data),
  });

  const { data: recentUpdates } = useQuery({
    queryKey: ['updates', 'recent'],
    queryFn: () => updatesAPI.getAll({ limit: 5 }).then((res) => res.data.data),
  });

  const { data: unreadAlerts } = useQuery({
    queryKey: ['alerts', 'unread'],
    queryFn: () => alertsAPI.getAll({ read: false, limit: 5 }).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Updates',
      value: overview?.totalUpdates || 0,
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Alerts',
      value: overview?.unreadAlerts || 0,
      icon: Bell,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Competitors',
      value: overview?.activeCompetitors || 0,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Avg Impact',
      value: overview?.averageImpact?.toFixed(1) || '0',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your competitive intelligence dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryChart data={overview?.categoryBreakdown} />
        <TimelineChart />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopCompetitors data={overview?.topCompetitors} />
        <RecentUpdates data={recentUpdates} />
      </div>

      {/* Alerts Section */}
      {unreadAlerts && unreadAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
