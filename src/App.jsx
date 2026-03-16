import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import PlanningPage from './pages/PlanningPage.jsx';
import ChallengesPage from './pages/ChallengesPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import RankingPage from './pages/RankingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from './services/authSession.js';

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

const FALLBACK_AVATAR =
  'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F2';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [session, setSession] = useState(() => readAuthSession());
  const isAuthenticated = Boolean(session?.token);

  const appUser = {
    name: session?.user?.pseudo || session?.user?.email || 'Utilisateur',
    avatar: FALLBACK_AVATAR,
  };

  const handleAuthSuccess = ({ token, user }) => {
    const nextSession = { token, user };
    saveAuthSession(nextSession);
    setSession(nextSession);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    setActivePage('dashboard');
  };

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'planning':
        return <PlanningPage />;
      case 'community':
        return <CommunityPage />;
      case 'events':
        return <EventsPage />;
      case 'challenges':
        return <ChallengesPage />;
      case 'ranking':
        return <RankingPage />;
      case 'chat':
        return <ChatPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        items={navItems}
        activeKey={activePage}
        user={appUser}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />

      <main className={activePage === 'chat' ? 'dashboard-full' : 'dashboard-main'}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
