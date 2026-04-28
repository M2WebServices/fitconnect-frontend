import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ListRow from '../components/ListRow.jsx';
import Icon from '../components/Icon.jsx';
import { fetchDashboardData } from '../services/dashboardService.js';

function getInitials(name) {
  return (name || '??').trim().slice(0, 2).toUpperCase();
}

function formatEventDate(dateValue) {
  if (!dateValue) return 'Date a confirmer';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getProgressFromRanking(score) {
  if (!score) return 0;
  return Math.min(100, Math.round((score % 1000) / 10));
}

function getProfileTitle(rank) {
  if (!rank) return 'Sportif connecte';
  if (rank <= 3) return 'Podium';
  if (rank <= 10) return 'Top 10';
  if (rank <= 25) return 'Competiteur';
  return 'Challenger';
}

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await fetchDashboardData();
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Impossible de charger le dashboard.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const me = dashboardData?.me;
  const ranking = dashboardData?.myRanking;
  const groups = dashboardData?.myGroups || [];
  const events = dashboardData?.myEvents || [];

  const profile = useMemo(
    () => ({
      name: me?.username || me?.email || 'Utilisateur',
      title: getProfileTitle(ranking?.rank),
      points: new Intl.NumberFormat('fr-FR').format(ranking?.score || 0),
      progress: getProgressFromRanking(ranking?.score),
    }),
    [me, ranking]
  );

  const activity = useMemo(() => {
    const entries = [];

    if (ranking?.rank) {
      entries.push({
        icon: 'lucide:medal',
        color: '#f97316',
        text: `Tu es actuellement classe #${ranking.rank} avec ${ranking.score || 0} points.`,
      });
    }

    if (groups.length) {
      entries.push({
        icon: 'lucide:users',
        color: '#1e3a5f',
        text: `Tu participes a ${groups.length} groupe${groups.length > 1 ? 's' : ''}.`,
      });
    }

    if (events.length) {
      entries.push({
        icon: 'lucide:calendar-check',
        color: '#10b981',
        text: `${events.length} evenement${events.length > 1 ? 's' : ''} est/sont associe(s) a ton compte.`,
      });
    }

    if (!entries.length) {
      entries.push({
        icon: 'lucide:info',
        color: '#64748b',
        text: 'Aucune activite exploitable n est encore disponible pour ton compte.',
      });
    }

    return entries;
  }, [events, groups, ranking]);

  return (
    <div className="page-content">
      <header className="dashboard-header">
        <h1>Bonjour, {profile.name} 👋</h1>
        <p className="dashboard-date">{today}</p>
      </header>

      {error && <p className="dashboard-status dashboard-status-error">{error}</p>}

      {isLoading && <p className="dashboard-status">Chargement des donnees...</p>}

      <div className="dashboard-grid">
        <Card title="Mon profil rapide" icon="lucide:user-circle">
          <div className="profile-card">
            <div className="profile-avatar profile-avatar-initials">{getInitials(profile.name)}</div>
            <div className="profile-details">
              <p className="profile-name">{profile.name}</p>
              <span className="badge badge-accent">{profile.title}</span>
              <div className="profile-points">
                <span className="points-value">{profile.points}</span>
                <span className="points-label">points</span>
              </div>
              <ProgressBar value={profile.progress} />
            </div>
          </div>
        </Card>

        <Card title="Mes groupes" icon="lucide:users">
          <div className="community-card">
            <div>
              <p className="community-name">{groups[0]?.name || 'Aucun groupe pour le moment'}</p>
              <p className="community-meta">
                {groups.length
                  ? `${groups.length} groupe${groups.length > 1 ? 's' : ''} rejoint(s)`
                  : 'Rejoins une communaute pour commencer a interagir'}
              </p>
            </div>
            <span className="dashboard-stat-badge">{groups.length}</span>
          </div>
        </Card>

        <Card
          title="Mon classement"
          icon="lucide:activity"
          action={<button className="link-button">Vue en direct</button>}
        >
          <div className="stack">
            <ListRow
              leading={
                <span className="list-icon">
                  <Icon name="lucide:medal" size={24} style={{ color: '#f97316' }} />
                </span>
              }
              title={ranking?.rank ? `Position #${ranking.rank}` : 'Classement indisponible'}
              subtitle="Classement global"
              meta={<span className="pill">{ranking?.score || 0} pts</span>}
            />
            <ListRow
              leading={
                <span className="list-icon">
                  <Icon name="lucide:user-round-check" size={24} style={{ color: '#1e3a5f' }} />
                </span>
              }
              title={me?.email || 'Email indisponible'}
              subtitle="Compte authentifie"
            />
          </div>
        </Card>

        <Card title="Evenements a venir" icon="lucide:calendar-check">
          <div className="stack">
            {events.length ? (
              events.slice(0, 4).map((event) => (
              <ListRow
                key={event.id}
                leading={
                  <span className="list-icon">
                    <Icon name="lucide:calendar-check" size={24} />
                  </span>
                }
                title={event.title}
                subtitle={event.description || 'Aucune description'}
                meta={<span className="pill pill-muted">{formatEventDate(event.date)}</span>}
              />
              ))
            ) : (
              <p className="dashboard-empty">Aucun evenement remonte depuis la gateway.</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Resume de mon activite" icon="lucide:users">
        <div className="stack">
          {activity.map((entry) => (
            <div className="activity-row" key={entry.text}>
              <span className="activity-icon-wrap">
                <Icon name={entry.icon} size={18} style={{ color: entry.color }} />
              </span>
              <p className="activity-text">
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;
