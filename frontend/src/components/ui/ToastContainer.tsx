import { useToastStore } from '@/store/toastStore';
import ToastComponent from './Toast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  // Debug: log toasts để kiểm tra
  if (toasts.length > 0) {
    // console.log('ToastContainer: Rendering toasts', toasts);
  }

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 flex flex-col gap-3 pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}

