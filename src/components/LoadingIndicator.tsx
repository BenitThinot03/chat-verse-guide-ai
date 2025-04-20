
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = ({ message = "Thinking..." }: LoadingIndicatorProps) => {
  return (
    <div className="flex items-center space-x-2 text-gray-500 animate-pulse">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
};

export default LoadingIndicator;
