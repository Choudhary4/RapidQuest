import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { competitorsAPI } from '@/services/api';
import { useNotificationStore } from '@/store';

export function AddCompetitorModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    industry: '',
    scrapeTargets: [
      { name: 'Pricing', url: '/pricing', type: 'pricing' },
    ],
  });

  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const createMutation = useMutation({
    mutationFn: (data) => competitorsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['competitors']);
      addNotification({
        type: 'success',
        title: 'Success',
        description: 'Competitor added successfully',
      });
      onClose();
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add competitor',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Competitor</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Competitor Name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Base URL *</label>
            <Input
              required
              type="url"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="https://competitor.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Industry</label>
            <Input
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="E.g., SaaS, E-commerce"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
