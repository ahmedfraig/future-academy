import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = "جاري التحميل..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4 w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin relative z-10" />
      </div>
      <p className="text-gray-500 font-medium text-base animate-pulse-soft">{message}</p>
    </div>
  );
}

export function LoadingSpinner({ size = "md", color = "text-violet-600" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };
  return <Loader2 className={`${sizeClasses[size] || sizeClasses.md} ${color} animate-spin`} />;
}
