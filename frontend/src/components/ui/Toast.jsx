import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useNotificationStore } from '@/store';

export function Toast({ id, title, description, type = 'info' }) {
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, removeNotification]);

  const types = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${types[type]}`}>
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={() => removeNotification(id)}
        className="rounded-md p-1 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96">
      {notifications.map((notification) => (
        <Toast key={notification.id} {...notification} />
      ))}
    </div>
  );
}
