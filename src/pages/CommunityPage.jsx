import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import {
  createGroup,
  fetchGroupById,
  fetchMyGroups,
  joinGroup,
  searchGroups,
} from '../services/communityService.js';

const FALLBACK_MEMBER_AVATAR =
  'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F2';

function memberTitleFromIndex(index) {
  if (index === 0) return 'Leader';
  if (index < 3) return 'Actif';
  return 'Membre';
}

function pseudoPoints(seedText) {
  const seed = (seedText || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return 1000 + ((seed * 37) % 9000);
}

function CommunityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [discoverResults, setDiscoverResults] = useState([]);
  const [joiningGroupId, setJoiningGroupId] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });

  const loadMyGroups = async () => {
    setIsLoading(true);
    setError('');

    try {
      const myGroups = await fetchMyGroups();
      setGroups(myGroups);
      setSelectedGroupId((prev) => prev || myGroups[0]?.id || '');
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger vos groupes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setSelectedGroup(null);
      return;
    }

    let isMounted = true;

    const loadGroup = async () => {
      setError('');
      try {
        const group = await fetchGroupById(selectedGroupId);
        if (isMounted) {
          setSelectedGroup(group);
        }
      } catch (groupError) {
        if (isMounted) {
          setError(groupError.message || 'Impossible de charger le détail du groupe.');
        }
      }
    };

    loadGroup();

    return () => {
      isMounted = false;
    };
  }, [selectedGroupId]);

  const members = selectedGroup?.members || [];

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        (member.username || member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [members, searchTerm]
  );

  const runDiscoverSearch = async () => {
    setError('');
    try {
      const results = await searchGroups(discoverQuery);
      setDiscoverResults(results);
    } catch (searchError) {
      setError(searchError.message || 'Recherche impossible.');
    }
  };

  const handleCreateGroup = async () => {
    if (!form.name.trim()) {
      setError('Le nom du groupe est obligatoire.');
      return;
    }

    setIsModalLoading(true);
    setError('');
    try {
      const created = await createGroup(form.name, form.description);
      setShowCreateGroupModal(false);
      setForm({ name: '', description: '' });
      await loadMyGroups();
      setSelectedGroupId(created.id);
    } catch (createError) {
      setError(createError.message || 'Creation de groupe impossible.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    setJoiningGroupId(groupId);
    setError('');
    try {
      await joinGroup(groupId);
      await loadMyGroups();
      setSelectedGroupId(groupId);
    } catch (joinError) {
      setError(joinError.message || 'Impossible de rejoindre ce groupe.');
    } finally {
      setJoiningGroupId('');
    }
  };

  return (
    <div className="community-page">
      {error && <p className="dashboard-status dashboard-status-error">{error}</p>}
      {isLoading && <p className="dashboard-status">Chargement des groupes...</p>}

      {/* Hero Header */}
      <header className="community-hero">
        <div className="community-hero-content">
          <h1 className="community-name">{selectedGroup?.name || 'Mes communautés'}</h1>
          <p className="community-description">
            {selectedGroup?.description ||
              'Sélectionnez un groupe existant ou créez-en un nouveau pour commencer.'}
          </p>
        </div>
        <div className="community-hero-actions">
          <button
            className="btn btn-outline-light"
            onClick={() => setShowCreateGroupModal(true)}
          >
            <Icon name="lucide:user-plus" size={16} />
            Créer un groupe
          </button>
          <button className="btn btn-outline-light" disabled={!selectedGroupId}>
            <Icon name="lucide:settings-2" size={16} />
            Groupe sélectionné
          </button>
        </div>
      </header>

      <div className="section-header">
        <h2 className="section-title">Choisir un groupe</h2>
        <div className="search-input group-select-wrap">
          <Icon name="lucide:layers" size={16} />
          <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
            {!groups.length && <option value="">Aucun groupe</option>}
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="community-stats">
        <div className="stat-card">
          <div className="stat-label">Membres</div>
          <div className="stat-value">{members.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Mes groupes</div>
          <div className="stat-value">{groups.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Résultats recherche</div>
          <div className="stat-value">{discoverResults.length}</div>
        </div>
      </div>

      {/* Members Section */}
      <section className="community-members">
        <div className="section-header">
          <h2 className="section-title">Membres du groupe</h2>
          <div className="search-input">
            <Icon name="lucide:search" size={16} />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="members-table-card">
          <table className="members-table">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Rôle</th>
                <th>Points totaux</th>
                <th>Titre actuel</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-cell">
                      <img
                        src={FALLBACK_MEMBER_AVATAR}
                        alt={member.username || member.email}
                        className="member-avatar"
                      />
                      <span className="member-name">{member.username || member.email}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        index === 0 ? 'badge-admin' : 'badge-member'
                      }`}
                    >
                      {index === 0 ? 'Admin' : 'Membre'}
                    </span>
                  </td>
                  <td>{pseudoPoints(member.id).toLocaleString('fr-FR')}</td>
                  <td>
                    <span className="badge badge-title">{memberTitleFromIndex(index)}</span>
                  </td>
                  <td className="text-right">
                    <button className="link-button">Voir le profil</button>
                  </td>
                </tr>
              ))}
              {!filteredMembers.length && (
                <tr>
                  <td colSpan="5" className="table-empty">Aucun membre trouvé pour ce filtre.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="community-members">
        <div className="section-header">
          <h2 className="section-title">Découvrir des groupes</h2>
          <div className="search-input">
            <Icon name="lucide:search" size={16} />
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={discoverQuery}
              onChange={(e) => setDiscoverQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  runDiscoverSearch();
                }
              }}
            />
          </div>
        </div>

        <div className="discover-groups-list">
          {discoverResults.map((group) => {
            const alreadyMember = groups.some((myGroup) => myGroup.id === group.id);
            return (
              <div className="discover-group-row" key={group.id}>
                <div>
                  <p className="discover-group-name">{group.name}</p>
                  <p className="discover-group-description">{group.description || 'Sans description'}</p>
                </div>
                <button
                  className={`btn ${alreadyMember ? 'btn-disabled' : 'btn-primary-inline'}`}
                  disabled={alreadyMember || joiningGroupId === group.id}
                  onClick={() => handleJoinGroup(group.id)}
                >
                  {alreadyMember
                    ? 'Déjà membre'
                    : joiningGroupId === group.id
                      ? 'Connexion...'
                      : 'Rejoindre'}
                </button>
              </div>
            );
          })}

          {!discoverResults.length && (
            <p className="dashboard-empty">Lancez une recherche pour découvrir des groupes.</p>
          )}
        </div>
      </section>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        title="Créer un groupe"
        description="Créez un nouveau groupe pour organiser votre communauté sportive."
      >
        <div className="modal-field">
          <label className="field-label">Nom du groupe</label>
          <input
            className="field-input-text"
            placeholder="Ex: Team Running Paris"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="modal-field">
          <label className="field-label">Description</label>
          <textarea
            className="field-input-text ev-textarea"
            placeholder="Décrivez l'objectif du groupe"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-primary-full" onClick={handleCreateGroup} disabled={isModalLoading}>
            {isModalLoading ? 'Creation...' : 'Créer le groupe'}
          </button>
          <button
            className="btn-secondary-text"
            onClick={() => setShowCreateGroupModal(false)}
          >
            Annuler
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CommunityPage;
