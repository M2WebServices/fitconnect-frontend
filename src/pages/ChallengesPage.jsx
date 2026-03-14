import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';

const challengesData = [
  {
    id: 1,
    status: 'en-cours',
    title: '100 pompes par jour',
    description:
      'Réalisez 100 pompes quotidiennement pendant 30 jours. Progressez à votre rythme et relevez le défi collectif.',
    points: 500,
    participants: 42,
    progress: 65,
    progressColor: 'fill-orange',
    action: 'Continuer',
    actionClass: 'btn-ev-primary',
  },
  {
    id: 2,
    status: 'a-venir',
    title: 'Marathon de Mai',
    description:
      'Préparez-vous pour le marathon annuel de la communauté. 42km de dépassement de soi.',
    points: 1200,
    participants: 15,
    progress: null,
    action: "S'inscrire",
    actionClass: 'btn-ev-secondary',
  },
  {
    id: 3,
    status: 'termine',
    title: 'Défi Cardio Février',
    description:
      'Challenge de cardio intensif sur tout le mois de février. Bravo à tous les participants !',
    points: 300,
    participants: 38,
    progress: 100,
    progressColor: 'fill-green',
    action: 'Voir les résultats',
    actionClass: 'btn-ev-muted',
  },
];

const activeChallengesData = [
  { id: 1, title: '100 pompes par jour', points: 500, progress: 65 },
  { id: 2, title: 'Planche quotidienne', points: 200, progress: 40 },
  { id: 3, title: '5km en moins de 30min', points: 350, progress: 80 },
];

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
  const [form, setForm] = useState({ title: '', description: '', points: '', duration: '' });

  const filteredChallenges = challengesData.filter(
    (c) => c.status === CHALLENGE_STATUS_MAP[challengeFilter]
  );

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="events-page">
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
            {activeChallengesData.map((c) => (
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
          </div>
        </div>
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
