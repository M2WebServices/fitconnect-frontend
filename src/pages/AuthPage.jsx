import { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { signIn, signUp } from '../services/authService.js';

function AuthPage({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const canSubmit = useMemo(() => {
    if (!form.email.trim() || !form.password.trim()) return false;
    if (activeTab === 'register') {
      if (!form.name.trim() || !form.confirmPassword.trim()) return false;
      return form.password === form.confirmPassword;
    }
    return true;
  }, [activeTab, form]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const email = form.email.trim();
      const password = form.password;
      const pseudo = form.name.trim();

      const authResult =
        activeTab === 'login'
          ? await signIn(email, password)
          : await signUp(email, pseudo, password);

      if (onAuthSuccess) {
        onAuthSuccess({
          token: authResult.token,
          user: authResult.user,
        });
      }
    } catch (error) {
      setSubmitError(error.message || 'Erreur lors de la connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <Icon name="lucide:dumbbell" size={30} style={{ color: '#1e3a5f' }} />
            <h1 className="auth-logo-text">GymCrew</h1>
          </div>
          <p className="auth-subtitle">Bienvenue dans votre espace sportif</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab${activeTab === 'login' ? ' is-active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setSubmitError('');
            }}
            type="button"
          >
            Connexion
          </button>
          <button
            className={`auth-tab${activeTab === 'register' ? ' is-active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setSubmitError('');
            }}
            type="button"
          >
            Inscription
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Nom complet</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Jean Dupont"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Adresse email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="jean.dupont@exemple.com"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Mot de passe</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
            />
          </div>

          {activeTab === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Confirmer le mot de passe</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
              />
            </div>
          )}

          {activeTab === 'login' && (
            <button className="auth-forgot-btn" type="button">
              Mot de passe oublie ?
            </button>
          )}

          {activeTab === 'register' &&
            form.confirmPassword &&
            form.password !== form.confirmPassword && (
              <p className="auth-error">Les mots de passe ne correspondent pas.</p>
            )}

          {submitError && <p className="auth-error">{submitError}</p>}

          <button className="auth-submit" type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting
              ? 'Chargement...'
              : activeTab === 'login'
                ? 'Se connecter'
                : 'Creer un compte'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
