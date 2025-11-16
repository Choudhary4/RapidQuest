import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { updatesAPI } from '@/services/api';
import { getCategoryColor, getSentimentColor, formatDateTime, truncate } from '@/utils/helpers';

export function Updates() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['updates', page, category, search],
    queryFn: () =>
      updatesAPI
        .getAll({ page, limit: 20, category, search })
        .then((res) => res.data),
  });

  const categories = [
    'all',
    'pricing',
    'campaign',
    'product_launch',
    'feature_update',
    'press',
    'negative_news',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Updates</h1>
          <p className="text-muted-foreground">
            All competitive intelligence updates
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search updates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat || (cat === 'all' && !category) ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat === 'all' ? '' : cat)}
                >
                  {cat.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="large" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data?.map((update) => (
              <Card key={update._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold">{update.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {update.companyId?.name} • {formatDateTime(update.detectedAt)}
                          </p>
                        </div>
                        <a
                          href={update.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>

                      {/* Summary */}
                      {update.summary && (
                        <p className="text-sm text-muted-foreground">
                          {truncate(update.summary, 200)}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getCategoryColor(update.category)}>
                          {update.category.replace('_', ' ')}
                        </Badge>
                        <span className={`text-sm font-medium ${getSentimentColor(update.sentiment)}`}>
                          {update.sentiment}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Impact: {update.impactScore}/10
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Confidence: {(update.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Keywords */}
                      {update.entities?.keywords && update.entities.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {update.entities.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * data.pagination.limit + 1} to{' '}
                {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} updates
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!data.pagination.hasPrevPage}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!data.pagination.hasNextPage}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
