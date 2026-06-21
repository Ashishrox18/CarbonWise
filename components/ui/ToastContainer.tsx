'use client';

import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Toast } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts:   Toast[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  error:   <XCircle    className="w-4 h-4 text-red-500"   />,
  info:    <Info       className="w-4 h-4 text-blue-500"  />,
};

/** Renders all active toast notifications in the bottom-right corner. */
const ToastContainer = memo(({ toasts, onDismiss }: ToastContainerProps) => (
  <div
    className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80"
    aria-live="polite"
    aria-label="Notifications"
  >
    <AnimatePresence>
      {toasts.map(toast => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
          role="alert"
        >
          {icons[toast.variant]}
          <p className="flex-1 text-sm text-gray-800 dark:text-gray-100">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
));
ToastContainer.displayName = 'ToastContainer';

export default ToastContainer;
