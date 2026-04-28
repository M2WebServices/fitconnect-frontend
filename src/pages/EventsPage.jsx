import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import {
  createEvent,
  deleteEvent,
  fetchEventParticipants,
  fetchEventsPageData,
  joinEvent,
} from '../services/eventsService.js';

const EVENT_TABS = ['Tous', 'Mes inscriptions', 'À venir', 'Passés'];

function FilterTabs({ tabs, active, onChange }) {
  return (
    <div className="ev-filter-bar">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`ev-filter-tab${active === tab ? ' active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function formatBannerDate(dateValue) {
  if (!dateValue) return { dateLabel: 'Date', timeLabel: '--:--' };

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: dateValue, timeLabel: '--:--' };
  }

  return {
    dateLabel: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    timeLabel: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

function formatLongDate(dateValue) {
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

function EventCard({ event, onJoin, isJoining, onViewParticipants, onDelete }) {
  const { dateLabel, timeLabel } = formatBannerDate(event.date);
  return (
    <div className="ev-card">
      <div className={`ev-banner${event.status === 'past' ? ' ev-banner-muted' : ''}`}>
        <div className="ev-date">{dateLabel}</div>
        <div className="ev-time">{timeLabel}</div>
      </div>
      <div className="ev-body">
        <h3 className="ev-title">{event.title}</h3>
        <div className="ev-info-row">
          <Icon name="lucide:map-pin" size={16} />
          {event.groupName}
        </div>
        <div className="ev-info-row">
          <Icon name="lucide:calendar-days" size={16} />
          {formatLongDate(event.date)}
        </div>
        {event.status === 'past' && (
          <button className="btn-full btn-ev-disabled" disabled>Terminé</button>
        )}
        {event.status === 'registered' && (
          <button className="btn-full btn-ev-disabled" disabled>Inscrit</button>
        )}
        {event.status === 'open' && (
          <button className="btn-full btn-ev-primary" onClick={() => onJoin(event.id)} disabled={isJoining}>
            {isJoining ? 'Inscription...' : 'Participer'}
          </button>
        )}
        <div className="ev-card-footer-actions">
          <button className="ev-action-link" onClick={() => onViewParticipants(event)}>
            <Icon name="lucide:users" size={14} />
            Participants
          </button>
          <button className="ev-action-link ev-action-link-danger" onClick={() => onDelete(event.id)}>
            <Icon name="lucide:trash-2" size={14} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joiningEventId, setJoiningEventId] = useState('');
  const [error, setError] = useState('');
  const [eventFilter, setEventFilter] = useState('Tous');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    groupId: '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
  });

  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  const loadEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchEventsPageData();
      setEvents(data.events || []);
      setGroups(data.groups || []);
      setForm((prev) => ({
        ...prev,
        groupId: prev.groupId || data.groups?.[0]?.id || '',
      }));
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger les evenements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'Mes inscriptions') return events.filter((e) => e.status === 'registered');
    if (eventFilter === 'À venir') return events.filter((e) => e.status !== 'past');
    if (eventFilter === 'Passés') return events.filter((e) => e.status === 'past');
    return events;
  }, [eventFilter, events]);

  const handleCreateEvent = async () => {
    if (!form.groupId || !form.title.trim() || !form.date || !form.time) {
      setError('Merci de renseigner groupe, titre, date et heure.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const dateIso = new Date(`${form.date}T${form.time}`).toISOString();
      const extra = [];
      if (form.location.trim()) extra.push(`Lieu: ${form.location.trim()}`);
      if (form.capacity.trim()) extra.push(`Capacite max: ${form.capacity.trim()}`);

      const description = [form.description.trim(), extra.join(' | ')].filter(Boolean).join(' | ');

      await createEvent({
        groupId: form.groupId,
        title: form.title.trim(),
        description,
        dateIso,
      });

      setShowModal(false);
      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
      }));
      await loadEvents();
    } catch (submitError) {
      setError(submitError.message || 'Creation de l evenement impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    setJoiningEventId(eventId);
    setError('');

    try {
      await joinEvent(eventId);
      await loadEvents();
    } catch (joinError) {
      setError(joinError.message || 'Inscription impossible pour cet evenement.');
    } finally {
      setJoiningEventId('');
    }
  };

  const handleViewParticipants = async (event) => {
    setSelectedEvent(event);
    setParticipants([]);
    setShowParticipantsModal(true);
    setIsLoadingParticipants(true);
    try {
      const list = await fetchEventParticipants(event.id);
      setParticipants(list);
    } catch {
      setParticipants([]);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    setError('');
    try {
      await deleteEvent(eventId);
      await loadEvents();
    } catch (deleteError) {
      setError(deleteError.message || 'Suppression impossible.');
    }
  };

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="events-page">
      {error && <p className="dashboard-status dashboard-status-error">{error}</p>}
      {isLoading && <p className="dashboard-status">Chargement des evenements...</p>}

      {/* ---- ÉVÉNEMENTS ---- */}
      <section className="ev-section">
        <div className="ev-page-header">
          <h1 className="ev-page-title">Événements</h1>
          <button className="ev-btn-add" onClick={() => setShowModal(true)}>
            <Icon name="lucide:plus" size={18} />
            Créer un événement
          </button>
        </div>
        <FilterTabs tabs={EVENT_TABS} active={eventFilter} onChange={setEventFilter} />
        <div className="ev-grid-2">
          {filteredEvents.length ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onJoin={handleJoinEvent}
                isJoining={joiningEventId === event.id}
                onViewParticipants={handleViewParticipants}
                onDelete={handleDeleteEvent}
              />
            ))
          ) : (
            <p className="dashboard-empty">Aucun evenement pour ce filtre.</p>
          )}
        </div>
      </section>

      {/* Modale création événement */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Créer un événement">
        <div className="ev-form-group">
          <label className="field-label">Groupe</label>
          <select
            className="field-input-text"
            value={form.groupId}
            onChange={(e) => setField('groupId', e.target.value)}
          >
            {!groups.length && <option value="">Aucun groupe disponible</option>}
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div className="ev-form-group">
          <label className="field-label">Titre</label>
          <input className="field-input-text" placeholder="Ex: Course au parc" value={form.title} onChange={(e) => setField('title', e.target.value)} />
        </div>
        <div className="ev-form-group">
          <label className="field-label">Description</label>
          <textarea className="field-input-text ev-textarea" placeholder="Détails de l'événement..." value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        <div className="ev-form-row">
          <div className="ev-form-group">
            <label className="field-label">Date</label>
            <input type="date" className="field-input-text" value={form.date} onChange={(e) => setField('date', e.target.value)} />
          </div>
          <div className="ev-form-group">
            <label className="field-label">Heure</label>
            <input type="time" className="field-input-text" value={form.time} onChange={(e) => setField('time', e.target.value)} />
          </div>
        </div>
        <div className="ev-form-row">
          <div className="ev-form-group">
            <label className="field-label">Lieu</label>
            <input className="field-input-text" placeholder="Adresse ou lieu" value={form.location} onChange={(e) => setField('location', e.target.value)} />
          </div>
          <div className="ev-form-group">
            <label className="field-label">Capacité max</label>
            <input type="number" className="field-input-text" placeholder="20" value={form.capacity} onChange={(e) => setField('capacity', e.target.value)} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-primary-full" onClick={handleCreateEvent} disabled={isSubmitting}>
            {isSubmitting ? 'Creation...' : "Créer l'événement"}
          </button>
          <button className="btn-secondary-text" onClick={() => setShowModal(false)}>Annuler</button>
        </div>
      </Modal>

      {/* Modale participants */}
      <Modal
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
        title={`Participants — ${selectedEvent?.title || ''}`}
      >
        {isLoadingParticipants && <p className="dashboard-status">Chargement...</p>}
        {!isLoadingParticipants && !participants.length && (
          <p className="dashboard-empty">Aucun participant pour cet événement.</p>
        )}
        {!isLoadingParticipants && participants.length > 0 && (
          <div className="stack">
            {participants.map((p) => (
              <div className="profile-list-row" key={p.userId}>
                <Icon name="lucide:user" size={16} />
                <span>{p.user?.username || p.user?.email || p.userId}</span>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-secondary-text" onClick={() => setShowParticipantsModal(false)}>Fermer</button>
        </div>
      </Modal>
    </div>
  );
}

export default EventsPage;
