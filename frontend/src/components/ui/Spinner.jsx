import { Loader2 } from 'lucide-react';

export function Spinner({ size = 'default', className = '' }) {
  const sizes = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizes[size]}`} />
    </div>
  );
}
