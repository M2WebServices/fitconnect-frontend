import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Card from '../components/Card.jsx';
import { fetchRankingData } from '../services/rankingService.js';

function scoreLabel(value) {
  return new Intl.NumberFormat('fr-FR').format(value || 0);
}

function medalIcon(rank) {
  if (rank === 1) return { name: 'lucide:trophy', color: '#f59e0b' };
  if (rank === 2) return { name: 'lucide:medal', color: '#94a3b8' };
  if (rank === 3) return { name: 'lucide:award', color: '#d97706' };
  return { name: 'lucide:target', color: '#64748b' };
}

function RankingPage() {
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ leaderboard: [], myRanking: null, me: null });

  const loadRanking = async (nextLimit) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = await fetchRankingData(nextLimit);
      setData(payload);
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger le classement.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking(limit);
  }, [limit]);

  const rows = useMemo(
    () =>
      data.leaderboard.map((entry) => ({
        ...entry,
        isMe: entry.userId === data.myRanking?.userId,
      })),
    [data]
  );

  return (
    <div className="ranking-page">
      <header className="ev-page-header">
        <h1 className="ev-page-title">Classement</h1>
        <div className="ranking-controls">
          <label className="ranking-label" htmlFor="ranking-limit">Top</label>
          <select
            id="ranking-limit"
            className="field-input-text ranking-select"
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </header>

      {error && <p className="dashboard-status dashboard-status-error">{error}</p>}
      {isLoading && <p className="dashboard-status">Chargement du classement...</p>}

      <Card title="Mon rang" icon="lucide:medal">
        <div className="ranking-summary-grid">
          <div className="ranking-summary-item">
            <span className="ranking-summary-label">Pseudo</span>
            <span className="ranking-summary-value">{data.me?.username || data.me?.email || '-'}</span>
          </div>
          <div className="ranking-summary-item">
            <span className="ranking-summary-label">Position</span>
            <span className="ranking-summary-value">
              {data.myRanking?.rank ? `#${data.myRanking.rank}` : 'Non classé'}
            </span>
          </div>
          <div className="ranking-summary-item">
            <span className="ranking-summary-label">Score</span>
            <span className="ranking-summary-value">{scoreLabel(data.myRanking?.score)} pts</span>
          </div>
        </div>
      </Card>

      <Card title="Leaderboard global" icon="lucide:bar-chart-3">
        <div className="ranking-table-wrap">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Utilisateur</th>
                <th>Score</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => {
                const badge = medalIcon(entry.rank);
                return (
                  <tr key={entry.userId} className={entry.isMe ? 'ranking-row-me' : ''}>
                    <td>#{entry.rank}</td>
                    <td>{entry.user?.username || entry.user?.email || entry.userId}</td>
                    <td>{scoreLabel(entry.score)} pts</td>
                    <td>
                      <span className="ranking-badge">
                        <Icon name={badge.name} size={16} style={{ color: badge.color }} />
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan="4" className="table-empty">Aucune donnée de classement disponible.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default RankingPage;
