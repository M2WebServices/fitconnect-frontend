import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import ChallengesPage from './pages/ChallengesPage.jsx';
import ChatPage from './pages/ChatPage.jsx';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
  { key: 'planning', label: 'Planning', icon: 'lucide:calendar' },
  { key: 'events', label: 'Evenements', icon: 'lucide:calendar-days' },
  { key: 'challenges', label: 'Challenges', icon: 'lucide:trophy' },
  { key: 'ranking', label: 'Classement', icon: 'lucide:medal' },
  { key: 'community', label: 'Communaute', icon: 'lucide:users' },
  { key: 'chat', label: 'Chat', icon: 'lucide:message-circle' },
  { key: 'profile', label: 'Profil', icon: 'lucide:user' },
];

const user = {
  name: 'Alexandre Martin',
  avatar:
    'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F2',
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'community':
        return <CommunityPage />;
      case 'events':
        return <EventsPage />;
      case 'challenges':
        return <ChallengesPage />;
      case 'chat':
        return <ChatPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        items={navItems}
        activeKey={activePage}
        user={user}
        onNavigate={setActivePage}
      />

      <main className={activePage === 'chat' ? 'dashboard-full' : 'dashboard-main'}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
