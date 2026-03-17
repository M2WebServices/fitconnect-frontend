import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import { fetchChallengesData } from '../services/challengesService.js';

const CHALLENGE_TABS = ['En cours', 'À venir', 'Terminés'];
const CHALLENGE_STATUS_MAP = { 'En cours': 'en-cours', 'À venir': 'a-venir', 'Terminés': 'termine' };

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

function ChallengeCard({ challenge }) {
  const statusLabels = { 'en-cours': 'En cours', 'a-venir': 'À venir', 'termine': 'Terminé' };
  return (
    <div className="ch-card">
      <div className={`ch-banner ch-banner-${challenge.status}`}>
        <span className="ch-badge">{statusLabels[challenge.status]}</span>
      </div>
      <div className="ch-body">
        <h3 className="ch-title">{challenge.title}</h3>
        <p className="ch-desc">{challenge.description}</p>
        <div className="ch-stats-row">
          <span className="ch-stat ch-stat-points">
            <Icon name="lucide:star" size={16} />
            {challenge.points} pts
          </span>
          <span className="ch-stat ch-stat-users">
            <Icon name="lucide:users" size={16} />
            {challenge.participants} participants
          </span>
        </div>
        {challenge.progress !== null && (
          <div className="ch-prog-box">
            <div className="ch-prog-header">
              <span>Ma progression</span>
              <span>{challenge.progress}%</span>
            </div>
            <div className="ch-prog-bar-track">
              <div
                className={`ch-prog-bar-fill ${challenge.progressColor}`}
                style={{ width: `${challenge.progress}%` }}
              />
            </div>
          </div>
        )}
        <button className={`btn-full ${challenge.actionClass}`}>{challenge.action}</button>
      </div>
    </div>
  );
}

function ChallengesPage() {
  const [challengeFilter, setChallengeFilter] = useState('En cours');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', points: '', duration: '' });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchChallengesData();
        if (isMounted) {
          setChallenges(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Impossible de charger les données challenges.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredChallenges = challenges.filter(
    (c) => c.status === CHALLENGE_STATUS_MAP[challengeFilter]
  );

  const activeChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.status === 'en-cours').slice(0, 5),
    [challenges]
  );

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="events-page">
      {error && <p className="dashboard-status dashboard-status-error">{error}</p>}
      {isLoading && <p className="dashboard-status">Chargement des challenges...</p>}

      <section className="ev-section">
        <div className="ev-page-header">
          <h1 className="ev-page-title">Challenges</h1>
          <button className="ev-btn-add" onClick={() => setShowModal(true)}>
            <Icon name="lucide:plus" size={18} />
            Créer un challenge
          </button>
        </div>
        <FilterTabs tabs={CHALLENGE_TABS} active={challengeFilter} onChange={setChallengeFilter} />
        <div className="ev-grid-2">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
        <div className="ev-active-section">
          <h2 className="ev-section-subtitle">Mes challenges actifs</h2>
          <div className="ev-active-scroll">
            {activeChallenges.map((c) => (
              <div key={c.id} className="ev-compact-card">
                <p className="ev-compact-title">{c.title}</p>
                <p className="ev-compact-points">
                  <Icon name="lucide:star" size={14} />
                  {c.points} pts à gagner
                </p>
                <div className="ch-prog-bar-track">
                  <div className="ch-prog-bar-fill fill-orange" style={{ width: `${c.progress}%` }} />
                </div>
                <span className="ev-compact-pct">{c.progress}% complété</span>
              </div>
            ))}
            {!activeChallenges.length && (
              <p className="dashboard-empty">Aucun challenge en cours pour le moment.</p>
            )}
          </div>
        </div>

        <p className="ch-fallback-note">Source actuelle: API challenges dédiée via gateway.</p>
      </section>

      {/* Modale création challenge */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Créer un challenge">
        <div className="ev-form-group">
          <label className="field-label">Titre</label>
          <input className="field-input-text" placeholder="Ex: 30 jours de running" value={form.title} onChange={(e) => setField('title', e.target.value)} />
        </div>
        <div className="ev-form-group">
          <label className="field-label">Description</label>
          <textarea className="field-input-text ev-textarea" placeholder="Décrivez le défi..." value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        <div className="ev-form-row">
          <div className="ev-form-group">
            <label className="field-label">Points à gagner</label>
            <input type="number" className="field-input-text" placeholder="500" value={form.points} onChange={(e) => setField('points', e.target.value)} />
          </div>
          <div className="ev-form-group">
            <label className="field-label">Durée (jours)</label>
            <input type="number" className="field-input-text" placeholder="30" value={form.duration} onChange={(e) => setField('duration', e.target.value)} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-primary-full" onClick={() => setShowModal(false)}>Créer le challenge</button>
          <button className="btn-secondary-text" onClick={() => setShowModal(false)}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

export default ChallengesPage;
