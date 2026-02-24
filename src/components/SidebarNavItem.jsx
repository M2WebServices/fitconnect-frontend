import Icon from './Icon.jsx';

function SidebarNavItem({ icon, label, active }) {
  return (
    <button className={`sidebar-nav-item${active ? ' is-active' : ''}`}>
      <span className="nav-icon" aria-hidden="true">
        {typeof icon === 'string' && icon.startsWith('lucide:') ? (
          <Icon name={icon} size={20} />
        ) : (
          icon
        )}
      </span>
      <span className="nav-label">{label}</span>
      {active && <span className="nav-active-bar" aria-hidden="true" />}
    </button>
  );
}

export default SidebarNavItem;
