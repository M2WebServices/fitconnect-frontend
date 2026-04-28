import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import { fetchProfileData, updateMyProfile } from '../services/profileService.js';

function getInitials(name) {
  return (name || '??').trim().slice(0, 2).toUpperCase();
}

function scoreLabel(value) {
  return new Intl.NumberFormat('fr-FR').format(value || 0);
}

function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    me: null,
    myRanking: null,
    myGroups: [],
    myEvents: [],
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', pseudo: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const payload = await fetchProfileData();
        if (isMounted) {
          setProfileData(payload);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Impossible de charger le profil.');
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

  const pseudo = profileData.me?.username || profileData.me?.email || 'Utilisateur';

  const recentEvents = useMemo(
    () =>
      [...profileData.myEvents]
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 4),
    [profileData.myEvents]
  );

  const openEditModal = () => {
    setEditForm({
      email: profileData.me?.email || '',
      pseudo: profileData.me?.username || '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setEditError('');
    try {
      const updated = await updateMyProfile({ email: editForm.email, pseudo: editForm.pseudo });
      setProfileData((prev) => ({ ...prev, me: updated }));
      setShowEditModal(false);
    } catch (saveError) {
      setEditError(saveError.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      {error && <p className="dashboard-status dashboard-status-error">{error}</p>}
      {isLoading && <p className="dashboard-status">Chargement du profil...</p>}

      <Card title="Mon profil" icon="lucide:user-circle">
        <div className="profile-main-row">
          <div className="profile-main-avatar profile-main-avatar-initials">{getInitials(pseudo)}</div>
          <div className="profile-main-content">
            <h2 className="profile-main-name">{pseudo}</h2>
            <p className="profile-main-email">{profileData.me?.email || '-'}</p>
            <div className="profile-tags-row">
              <span className="badge badge-accent">
                Rang {profileData.myRanking?.rank ? `#${profileData.myRanking.rank}` : 'N/A'}
              </span>
              <span className="badge badge-member">{scoreLabel(profileData.myRanking?.score)} pts</span>
            </div>
          </div>
          <button className="btn-secondary-text" onClick={openEditModal}>
            <Icon name="lucide:pencil" size={16} />
            Modifier
          </button>
        </div>
      </Card>

      <div className="profile-stats-grid">
        <Card title="Mes stats" icon="lucide:bar-chart-3">
          <div className="profile-mini-stats">
            <div className="profile-mini-item">
              <span className="profile-mini-label">Groupes</span>
              <span className="profile-mini-value">{profileData.myGroups.length}</span>
            </div>
            <div className="profile-mini-item">
              <span className="profile-mini-label">Evénements</span>
              <span className="profile-mini-value">{profileData.myEvents.length}</span>
            </div>
            <div className="profile-mini-item">
              <span className="profile-mini-label">Score</span>
              <span className="profile-mini-value">{scoreLabel(profileData.myRanking?.score)}</span>
            </div>
          </div>
        </Card>

        <Card title="Mes groupes" icon="lucide:users">
          <div className="stack">
            {profileData.myGroups.slice(0, 4).map((group) => (
              <div className="profile-list-row" key={group.id}>
                <Icon name="lucide:users" size={16} />
                <span>{group.name}</span>
              </div>
            ))}
            {!profileData.myGroups.length && <p className="dashboard-empty">Aucun groupe rejoint.</p>}
          </div>
        </Card>
      </div>

      <Card title="Événements récents" icon="lucide:calendar-days">
        <div className="stack">
          {recentEvents.map((event) => (
            <div className="profile-list-row" key={event.id}>
              <Icon name="lucide:calendar-check" size={16} />
              <span>{event.title}</span>
            </div>
          ))}
          {!recentEvents.length && <p className="dashboard-empty">Aucun événement récent.</p>}
        </div>
      </Card>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier mon profil">
        {editError && <p className="dashboard-status dashboard-status-error">{editError}</p>}
        <div className="ev-form-group">
          <label className="field-label">Email</label>
          <input
            className="field-input-text"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
          />
        </div>
        <div className="ev-form-group">
          <label className="field-label">Pseudo</label>
          <input
            className="field-input-text"
            value={editForm.pseudo}
            onChange={(e) => setEditForm((p) => ({ ...p, pseudo: e.target.value }))}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-primary-full" onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
          <button className="btn-secondary-text" onClick={() => setShowEditModal(false)}>Annuler</button>
        </div>
      </Modal>
    </div>
  );
}

export default ProfilePage;
