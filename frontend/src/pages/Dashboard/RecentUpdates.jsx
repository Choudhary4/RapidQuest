import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCategoryColor, timeAgo } from '@/utils/helpers';

export function RecentUpdates({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent updates</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Updates</CardTitle>
          <Link to="/updates" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((update) => (
            <div key={update._id} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium line-clamp-2">{update.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {update.companyId?.name}
                  </p>
                </div>
                <a
                  href={update.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(update.category)}>
                  {update.category.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(update.detectedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
