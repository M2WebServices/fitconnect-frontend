import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';

const communityData = {
  name: 'Paris Fitness Squad',
  description:
    'Le groupe officiel pour les passionnés de fitness de la région parisienne. Entraînements en plein air, séances en salle et motivation quotidienne entre membres GymCrew.',
  stats: {
    members: 128,
    activeChallenges: 4,
    eventsThisMonth: 9,
  },
  members: [
    {
      id: 1,
      name: 'Camille D.',
      avatar:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FEuropean%2F1',
      role: 'admin',
      points: 14250,
      title: 'Championne',
    },
    {
      id: 2,
      name: 'Julien M.',
      avatar:
        'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FNorth%20American%2F2',
      role: 'member',
      points: 10980,
      title: 'Athlète',
    },
    {
      id: 3,
      name: 'Sarah L.',
      avatar:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FAfrican%2F3',
      role: 'member',
      points: 9340,
      title: 'Régulière',
    },
    {
      id: 4,
      name: 'Lucas P.',
      avatar:
        'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F35-50%2FHispanic%2F4',
      role: 'member',
      points: 7820,
      title: 'Motivé',
    },
    {
      id: 5,
      name: 'Vous',
      avatar:
        'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FEast%20Asian%2F5',
      role: 'member',
      points: 6450,
      title: 'Athlète',
    },
  ],
};

function CommunityPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const filteredMembers = communityData.members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = () => {
    console.log('Inviting:', inviteEmail);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="community-page">
      {/* Hero Header */}
      <header className="community-hero">
        <div className="community-hero-content">
          <h1 className="community-name">{communityData.name}</h1>
          <p className="community-description">{communityData.description}</p>
        </div>
        <div className="community-hero-actions">
          <button
            className="btn btn-outline-light"
            onClick={() => setShowInviteModal(true)}
          >
            <Icon name="lucide:user-plus" size={16} />
            Inviter un membre
          </button>
          <button className="btn btn-outline-light">
            <Icon name="lucide:settings-2" size={16} />
            Paramètres du groupe
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="community-stats">
        <div className="stat-card">
          <div className="stat-label">Membres</div>
          <div className="stat-value">{communityData.stats.members}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Challenges actifs</div>
          <div className="stat-value">{communityData.stats.activeChallenges}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Événements ce mois</div>
          <div className="stat-value">{communityData.stats.eventsThisMonth}</div>
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
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-cell">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="member-avatar"
                      />
                      <span className="member-name">{member.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        member.role === 'admin' ? 'badge-admin' : 'badge-member'
                      }`}
                    >
                      {member.role === 'admin' ? 'Admin' : 'Membre'}
                    </span>
                  </td>
                  <td>{member.points.toLocaleString('fr-FR')}</td>
                  <td>
                    <span className="badge badge-title">{member.title}</span>
                  </td>
                  <td className="text-right">
                    <button className="link-button">Voir le profil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Inviter un membre"
        description='Envoyez une invitation par email pour rejoindre le groupe "Paris Fitness Squad".'
      >
        <div className="modal-field">
          <label className="field-label">Email du membre</label>
          <input
            type="email"
            className="field-input-text"
            placeholder="prenom.nom@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-primary-full" onClick={handleInvite}>
            Envoyer l'invitation
          </button>
          <button
            className="btn-secondary-text"
            onClick={() => setShowInviteModal(false)}
          >
            Annuler
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CommunityPage;
