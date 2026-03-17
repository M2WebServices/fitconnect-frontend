function ToastViewport({ toasts }) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type || 'info'}`}>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
