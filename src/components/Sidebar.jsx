import SidebarNavItem from './SidebarNavItem.jsx';
import Icon from './Icon.jsx';

function getInitials(name) {
  return (name || '??').trim().slice(0, 2).toUpperCase();
}

function Sidebar({ items, activeKey, user, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Icon name="lucide:dumbbell" size={32} style={{ color: '#f97316' }} />
        <span className="logo-text">GymCrew</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <div key={item.key} onClick={() => onNavigate && onNavigate(item.key)}>
            <SidebarNavItem
              icon={item.icon}
              label={item.label}
              active={item.key === activeKey}
            />
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar sidebar-avatar-initials">
          {getInitials(user.name)}
        </div>
        <div className="sidebar-user">
          <span className="sidebar-user-name">{user.name}</span>
          <button className="sidebar-logout" onClick={onLogout}>Deconnexion</button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
