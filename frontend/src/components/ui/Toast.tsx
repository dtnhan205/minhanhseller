import { useEffect } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export default function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    // console.log('✅ ToastComponent mounted:', toast.id, 'duration:', toast.duration);
    const duration = toast.duration || 5000;
    
    if (duration <= 0) {
      // Nếu duration = 0 hoặc âm, không tự đóng
      // console.log('⚠️ Toast has no duration, will not auto-close');
      return;
    }
    
    // console.log('⏰ Setting timer for', duration, 'ms');
    const timer = setTimeout(() => {
      // console.log('⏰ Timer expired, closing toast:', toast.id);
      onClose(toast.id);
    }, duration);

    return () => {
      // console.log('🧹 Toast cleanup (should only happen on unmount):', toast.id);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]); // Chỉ phụ thuộc vào toast.id để tránh re-run

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const styles = {
    success: 'bg-green-500/20 border-green-500/70 text-green-300 shadow-medium',
    error: 'bg-red-500/20 border-red-500/70 text-red-300 shadow-medium',
    info: 'bg-blue-500/20 border-blue-500/70 text-blue-300 shadow-medium',
    warning: 'bg-yellow-500/20 border-yellow-500/70 text-yellow-300 shadow-medium',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border-2 backdrop-blur-sm min-w-[320px] max-w-md animate-slide-in ${styles[toast.type]}`}
      style={{ zIndex: 9999 }}
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <p className="flex-1 text-sm font-semibold leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

