import Icon from './Icon.jsx';

const TOAST_ICONS = {
  success: 'lucide:check-circle',
  error: 'lucide:x-circle',
  info: 'lucide:info',
  warning: 'lucide:alert-triangle',
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type || 'info'}`}>
          <div className="toast-body">
            <span className="toast-icon">
              <Icon name={TOAST_ICONS[toast.type] || TOAST_ICONS.info} size={16} />
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
          {onDismiss && (
            <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Fermer">
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
