import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../api/axios';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Redireciona se já autenticado
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950">

      {/* ── Background decorativo ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* grade hexagonal sutil */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hex" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
              <polygon
                points="28,2 54,16 54,44 28,58 2,44 2,16"
                fill="none" stroke="#22c55e" strokeWidth="1"
              />
              <polygon
                points="28,52 54,66 54,94 28,108 2,94 2,66"
                fill="none" stroke="#22c55e" strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>

        {/* brilho verde superior */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600 opacity-10 rounded-full blur-[120px]" />
        {/* brilho verde inferior */}
        <div className="absolute -bottom-40 right-0 w-[400px] h-[300px] bg-brand-700 opacity-10 rounded-full blur-[100px]" />
      </div>

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-600/30 mb-4">
            <span className="text-3xl">⚽</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Bolão <span className="text-brand-500">Copa</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Faça login e faça seu Palpite</p>
        </div>

        {/* Form card */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl px-4 py-3 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="input"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Acesso apenas por convite do administrador.
        </p>
      </div>
    </div>
  );
}