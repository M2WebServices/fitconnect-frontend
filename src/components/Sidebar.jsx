import SidebarNavItem from './SidebarNavItem.jsx';
import Icon from './Icon.jsx';

function Sidebar({ items, activeKey, user }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Icon name="lucide:dumbbell" size={32} style={{ color: '#f97316' }} />
        <span className="logo-text">GymCrew</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <SidebarNavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={item.key === activeKey}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        <img className="sidebar-avatar" src={user.avatar} alt={user.name} />
        <div className="sidebar-user">
          <span className="sidebar-user-name">{user.name}</span>
          <button className="sidebar-logout">Deconnexion</button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
