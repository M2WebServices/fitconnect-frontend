import './App.css';
import Sidebar from './components/Sidebar.jsx';
import Card from './components/Card.jsx';
import AvatarStack from './components/AvatarStack.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import ListRow from './components/ListRow.jsx';
import Icon from './components/Icon.jsx';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
  { key: 'planning', label: 'Planning', icon: 'lucide:calendar' },
  { key: 'events', label: 'Evenements', icon: 'lucide:calendar-days' },
  { key: 'challenges', label: 'Challenges', icon: 'lucide:trophy' },
  { key: 'ranking', label: 'Classement', icon: 'lucide:medal' },
  { key: 'chat', label: 'Chat', icon: 'lucide:message-circle' },
  { key: 'profile', label: 'Profil', icon: 'lucide:user' },
];

const user = {
  name: 'Alexandre Martin',
  avatar:
    'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F2',
  title: 'Challenger',
  points: '1,450',
  progress: 68,
};

const community = {
  name: 'Crew Paris Centre',
  members: 128,
  avatars: [
    {
      src: 'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FEuropean%2F3',
      alt: 'Lucas',
    },
    {
      src: 'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FEuropean%2F5',
      alt: 'Sophie',
    },
    {
      src: 'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F35-50%2FAfrican%2F1',
      alt: 'Marc',
    },
    {
      src: 'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FEuropean%2F1',
      alt: 'Emma',
    },
  ],
};

const sessions = [
  {
    title: 'Seance Musculation Dos/Biceps',
    date: "Aujourd'hui, 18:00",
    duration: '1h 15m',
    icon: 'lucide:flame',
    iconColor: '#ef4444',
  },
  {
    title: 'Cardio HIIT - Exterieur',
    date: 'Demain, 07:00',
    duration: '45m',
    icon: 'lucide:footprints',
    iconColor: '#3b82f6',
  },
  {
    title: 'Yoga & Mobilite',
    date: 'Samedi, 09:30',
    duration: '1h 00m',
    icon: 'lucide:heart',
    iconColor: '#8b5cf6',
  },
];

const events = [
  {
    title: 'Course 10km du dimanche',
    date: 'Dimanche 15 Octobre 2023',
    attendees: '82 participants',
  },
  {
    title: 'Atelier Nutrition & Recuperation',
    date: 'Jeudi 19 Octobre 2023',
    attendees: '36 participants',
  },
];

const activity = [
  {
    name: 'Lucas',
    action: 'a complete une seance de running',
    time: 'il y a 2h',
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FEuropean%2F3',
  },
  {
    name: 'Sophie',
    action: 'a battu son record au souleve de terre',
    time: 'il y a 4h',
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FEuropean%2F5',
  },
  {
    name: 'Marc',
    action: 'a rejoint le challenge 100 pompes par jour',
    time: 'il y a 1j',
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F35-50%2FAfrican%2F1',
  },
  {
    name: 'Emma',
    action: 'a planifie une seance cardio',
    time: 'il y a 2j',
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FEuropean%2F1',
  },
  {
    name: 'Nicolas',
    action: 'a partage une recette proteinee',
    time: 'il y a 3j',
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F6',
  },
];

function App() {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="dashboard">
      <Sidebar items={navItems} activeKey="dashboard" user={user} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Bonjour, Alexandre 👋</h1>
          <p className="dashboard-date">{today}</p>
        </header>

        <div className="dashboard-grid">
          <Card title="Mon profil rapide" icon="lucide:user-circle">
            <div className="profile-card">
              <img className="profile-avatar" src={user.avatar} alt={user.name} />
              <div className="profile-details">
                <p className="profile-name">{user.name}</p>
                <span className="badge badge-accent">{user.title}</span>
                <div className="profile-points">
                  <span className="points-value">{user.points}</span>
                  <span className="points-label">points</span>
                </div>
                <ProgressBar value={user.progress} />
              </div>
            </div>
          </Card>

          <Card title="Ma communaute" icon="lucide:users">
            <div className="community-card">
              <div>
                <p className="community-name">{community.name}</p>
                <p className="community-meta">{community.members} membres actifs</p>
              </div>
              <AvatarStack avatars={community.avatars} />
            </div>
          </Card>

          <Card
            title="Mes prochaines seances"
            icon="lucide:activity"
            action={<button className="link-button">Voir le planning</button>}
          >
            <div className="stack">
              {sessions.map((session) => (
                <ListRow
                  key={session.title}
                  leading={
                    <span className="list-icon">
                      <Icon name={session.icon} size={24} style={{ color: session.iconColor }} />
                    </span>
                  }
                  title={session.title}
                  subtitle={session.date}
                  meta={<span className="pill">{session.duration}</span>}
                />
              ))}
            </div>
          </Card>

          <Card title="Evenements a venir" icon="lucide:calendar-check">
            <div className="stack">
              {events.map((event) => (
                <ListRow
                  key={event.title}
                  leading={
                    <span className="list-icon">
                      <Icon name="lucide:calendar-check" size={24} />
                    </span>
                  }
                  title={event.title}
                  subtitle={event.attendees}
                  meta={<span className="pill pill-muted">{event.date}</span>}
                />
              ))}
            </div>
          </Card>
        </div>

        <Card title="Activite recente de la communaute" icon="lucide:users">
          <div className="stack">
            {activity.map((entry) => (
              <div className="activity-row" key={`${entry.name}-${entry.time}`}>
                <img className="activity-avatar" src={entry.avatar} alt={entry.name} />
                <p className="activity-text">
                  <span className="activity-name">{entry.name}</span> {entry.action}{' '}
                  <span className="activity-time">· {entry.time}</span>
                </p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

export default App;
