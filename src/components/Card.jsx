import Icon from './Icon.jsx';

function Card({ title, icon, action, children }) {
  return (
    <section className="card">
      {(title || action) && (
        <header className="card-header">
          <div className="card-title-group">
            {icon && (
              <span className="card-icon" aria-hidden="true">
                {typeof icon === 'string' && icon.startsWith('lucide:') ? (
                  <Icon name={icon} size={24} />
                ) : (
                  icon
                )}
              </span>
            )}
            {title && <h2 className="card-title">{title}</h2>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}

export default Card;
