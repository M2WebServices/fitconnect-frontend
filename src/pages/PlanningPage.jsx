import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';
import { fetchPlanningData } from '../services/planningService.js';

function formatDate(dateValue) {
  if (!dateValue) return 'Date à confirmer';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(dateValue) {
  if (!dateValue) return '--:--';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function PlanningPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('upcoming');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const payload = await fetchPlanningData();
        if (isMounted) setEvents(payload.events || []);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Impossible de charger le planning.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    if (activeFilter === 'past') {
      return events.filter((event) => new Date(event.date || 0) < now);
    }
    if (activeFilter === 'today') {
      return events.filter((event) => {
        const d = new Date(event.date || 0);
        return d.toDateString() === now.toDateString();
      });
    }
    return events.filter((event) => new Date(event.date || 0) >= now);
  }, [events, activeFilter]);

  return (
    <div className="planning-page">
      <header className="ev-page-header">
        <h1 className="ev-page-title">Planning</h1>
        <div className="planning-filters">
          <button
            className={`ev-filter-tab${activeFilter === 'upcoming' ? ' active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}
          >
            À venir
          </button>
          <button
            className={`ev-filter-tab${activeFilter === 'today' ? ' active' : ''}`}
            onClick={() => setActiveFilter('today')}
          >
            Aujourd'hui
          </button>
          <button
            className={`ev-filter-tab${activeFilter === 'past' ? ' active' : ''}`}
            onClick={() => setActiveFilter('past')}
          >
            Passés
          </button>
        </div>
      </header>

      {error && <p className="dashboard-status dashboard-status-error">{error}</p>}
      {isLoading && <p className="dashboard-status">Chargement du planning...</p>}

      <Card title="Mes séances planifiées" icon="lucide:calendar-clock">
        <div className="planning-list">
          {filteredEvents.map((event) => (
            <div className="planning-row" key={event.id}>
              <div className="planning-row-time">
                <span className="planning-row-date">{formatDate(event.date)}</span>
                <span className="planning-row-hour">{formatTime(event.date)}</span>
              </div>
              <div className="planning-row-content">
                <p className="planning-row-title">{event.title}</p>
                <p className="planning-row-subtitle">{event.groupName}</p>
              </div>
              <span className="pill pill-muted">{event.groupName}</span>
            </div>
          ))}
          {!filteredEvents.length && (
            <p className="dashboard-empty">Aucune séance pour ce filtre.</p>
          )}
        </div>
      </Card>

      <Card title="Rappel" icon="lucide:bell-ring">
        <p className="planning-note">
          Cette page utilise actuellement les événements utilisateur comme base planning tant qu'une API
          dédiée séances/workouts n'est pas exposée par le backend.
        </p>
      </Card>
    </div>
  );
}

export default PlanningPage;
