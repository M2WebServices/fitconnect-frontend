import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';

const eventsData = [
  {
    id: 1,
    date: '14 Mars',
    time: '18:00 - 20:00',
    title: 'Tournoi de Futsal',
    location: 'Stade Jean Bouin',
    participants: 24,
    maxParticipants: 30,
    status: 'open',
  },
  {
    id: 2,
    date: '22 Mars',
    time: '09:00 - 11:00',
    title: 'Course 10km du dimanche',
    location: 'Parc Montsouris',
    participants: 18,
    maxParticipants: 20,
    status: 'registered',
  },
  {
    id: 3,
    date: '5 Mars',
    time: '10:00 - 12:00',
    title: 'Atelier Crossfit Débutants',
    location: 'Salle Principale GymCrew',
    participants: 15,
    maxParticipants: 15,
    status: 'past',
  },
];

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

function EventCard({ event }) {
  const pct = Math.round((event.participants / event.maxParticipants) * 100);
  return (
    <div className="ev-card">
      <div className={`ev-banner${event.status === 'past' ? ' ev-banner-muted' : ''}`}>
        <div className="ev-date">{event.date}</div>
        <div className="ev-time">{event.time}</div>
      </div>
      <div className="ev-body">
        <h3 className="ev-title">{event.title}</h3>
        <div className="ev-info-row">
          <Icon name="lucide:map-pin" size={16} />
          {event.location}
        </div>
        <div className="ev-info-row">
          <Icon name="lucide:users" size={16} />
          {event.participants}/{event.maxParticipants} participants
        </div>
        <div className="ev-progress-wrap">
          <div className="ev-prog-bar">
            <div className="ev-prog-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="ev-prog-label">{pct}% des places occupées</span>
        </div>
        {event.status === 'past' && (
          <button className="btn-full btn-ev-disabled" disabled>Terminé</button>
        )}
        {event.status === 'registered' && (
          <button className="btn-full btn-ev-danger">Se désinscrire</button>
        )}
        {event.status === 'open' && (
          <button className="btn-full btn-ev-primary">Participer</button>
        )}
      </div>
    </div>
  );
}

function EventsPage() {
  const [eventFilter, setEventFilter] = useState('Tous');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', location: '', capacity: '' });

  const filteredEvents = () => {
    if (eventFilter === 'Mes inscriptions') return eventsData.filter((e) => e.status === 'registered');
    if (eventFilter === 'À venir') return eventsData.filter((e) => e.status !== 'past');
    if (eventFilter === 'Passés') return eventsData.filter((e) => e.status === 'past');
    return eventsData;
  };

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="events-page">
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
          {filteredEvents().map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Modale création événement */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Créer un événement">
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
          <button className="btn-primary-full" onClick={() => setShowModal(false)}>Créer l'événement</button>
          <button className="btn-secondary-text" onClick={() => setShowModal(false)}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

export default EventsPage;
