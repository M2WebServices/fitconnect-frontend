import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import { emitToast } from '../services/appEvents.js';
import { completeWorkoutSession, fetchPlanningData } from '../services/planningService.js';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('recent');
  const [form, setForm] = useState({
    workoutSessionId: '',
    durationMinutes: '',
    caloriesBurned: '',
    eventId: '',
    groupId: '',
  });

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const loadPlanning = async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = await fetchPlanningData();
      setWorkouts(payload.workouts || []);
      setEvents(payload.events || []);
      setGroups(payload.groups || []);
      setForm((prev) => ({
        ...prev,
        eventId: prev.eventId || payload.events?.[0]?.id || '',
        groupId: prev.groupId || payload.groups?.[0]?.id || '',
      }));
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger le planning.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlanning();
  }, []);

  const filteredWorkouts = useMemo(() => {
    const now = new Date();
    if (activeFilter === 'today') {
      return workouts.filter((workout) => {
        const d = new Date(workout.completedAt || 0);
        return d.toDateString() === now.toDateString();
      });
    }
    if (activeFilter === 'high-calories') {
      return [...workouts].sort((a, b) => (b.caloriesBurned || 0) - (a.caloriesBurned || 0));
    }
    return workouts;
  }, [workouts, activeFilter]);

  const handleCompleteWorkout = async () => {
    if (!form.workoutSessionId.trim()) {
      setError('Le workoutSessionId est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await completeWorkoutSession({
        workoutSessionId: form.workoutSessionId.trim(),
        completedAt: new Date().toISOString(),
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        caloriesBurned: form.caloriesBurned ? Number(form.caloriesBurned) : null,
        eventId: form.eventId || null,
        groupId: form.groupId || null,
      });
      emitToast('Séance enregistrée avec succès.', 'success');
      setShowModal(false);
      setForm((prev) => ({
        ...prev,
        workoutSessionId: '',
        durationMinutes: '',
        caloriesBurned: '',
      }));
      await loadPlanning();
    } catch (submitError) {
      setError(submitError.message || 'Impossible d enregistrer la séance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="planning-page">
      <header className="ev-page-header">
        <h1 className="ev-page-title">Planning</h1>
        <button className="ev-btn-add" onClick={() => setShowModal(true)}>
          <Icon name="lucide:plus" size={16} />
          Ajouter une séance
        </button>
        <div className="planning-filters">
          <button
            className={`ev-filter-tab${activeFilter === 'recent' ? ' active' : ''}`}
            onClick={() => setActiveFilter('recent')}
          >
            Récentes
          </button>
          <button
            className={`ev-filter-tab${activeFilter === 'today' ? ' active' : ''}`}
            onClick={() => setActiveFilter('today')}
          >
            Aujourd'hui
          </button>
          <button
            className={`ev-filter-tab${activeFilter === 'high-calories' ? ' active' : ''}`}
            onClick={() => setActiveFilter('high-calories')}
          >
            Top calories
          </button>
        </div>
      </header>

      {error && <p className="dashboard-status dashboard-status-error">{error}</p>}
      {isLoading && <p className="dashboard-status">Chargement du planning...</p>}

      <Card title="Mes séances complétées" icon="lucide:calendar-clock">
        <div className="planning-list">
          {filteredWorkouts.map((workout) => (
            <div className="planning-row" key={`${workout.workoutSessionId}-${workout.completedAt}`}>
              <div className="planning-row-time">
                <span className="planning-row-date">{formatDate(workout.completedAt)}</span>
                <span className="planning-row-hour">{formatTime(workout.completedAt)}</span>
              </div>
              <div className="planning-row-content">
                <p className="planning-row-title">{workout.eventTitle}</p>
                <p className="planning-row-subtitle">
                  {workout.groupName} • {workout.durationMinutes || 0} min • {workout.caloriesBurned || 0} kcal
                </p>
              </div>
              <span className="pill pill-muted">{workout.workoutSessionId}</span>
            </div>
          ))}
          {!filteredWorkouts.length && (
            <p className="dashboard-empty">Aucune séance pour ce filtre.</p>
          )}
        </div>
      </Card>

      <Card title="Rappel" icon="lucide:bell-ring">
        <p className="planning-note">
          Cette page est alimentée par `myWorkoutSessions(limit)` et la mutation
          `completeWorkoutSession(...)`.
        </p>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Enregistrer une séance">
        <div className="ev-form-group">
          <label className="field-label">Workout Session ID</label>
          <input
            className="field-input-text"
            placeholder="Ex: ws-102"
            value={form.workoutSessionId}
            onChange={(e) => setField('workoutSessionId', e.target.value)}
          />
        </div>
        <div className="ev-form-row">
          <div className="ev-form-group">
            <label className="field-label">Durée (minutes)</label>
            <input
              type="number"
              className="field-input-text"
              placeholder="45"
              value={form.durationMinutes}
              onChange={(e) => setField('durationMinutes', e.target.value)}
            />
          </div>
          <div className="ev-form-group">
            <label className="field-label">Calories</label>
            <input
              type="number"
              className="field-input-text"
              placeholder="420"
              value={form.caloriesBurned}
              onChange={(e) => setField('caloriesBurned', e.target.value)}
            />
          </div>
        </div>
        <div className="ev-form-row">
          <div className="ev-form-group">
            <label className="field-label">Événement lié</label>
            <select
              className="field-input-text"
              value={form.eventId}
              onChange={(e) => setField('eventId', e.target.value)}
            >
              <option value="">Aucun événement</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>
          <div className="ev-form-group">
            <label className="field-label">Groupe lié</label>
            <select
              className="field-input-text"
              value={form.groupId}
              onChange={(e) => setField('groupId', e.target.value)}
            >
              <option value="">Aucun groupe</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-primary-full" onClick={handleCompleteWorkout} disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button className="btn-secondary-text" onClick={() => setShowModal(false)}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

export default PlanningPage;
