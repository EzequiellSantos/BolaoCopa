import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useIsAdmin } from '../hooks/useAuth';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-600/20 text-brand-400'
      : 'text-gray-400 hover:text-white hover:bg-gray-800'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">⚽</span>
          <span className="font-black text-white tracking-tight">
            Bolão <span className="text-brand-500">Copa</span>
          </span>
        </NavLink>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/dashboard" className={navLinkClass}>
            🏠 Início
          </NavLink>
          <NavLink to="/apostas" className={navLinkClass}>
            🎯 Apostas
          </NavLink>
          <NavLink to="/ranking" className={navLinkClass}>
            🏆 Ranking
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin/partidas" className={navLinkClass}>
                ⚽ Partidas
              </NavLink>
              <NavLink to="/admin/usuarios" className={navLinkClass}>
                👥 Usuários
              </NavLink>
            </>
          )}
        </nav>

        {/* User menu — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white leading-none">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {user?.role === 'ADMIN' ? '👑 Admin' : '🎮 Jogador'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            Sair
          </button>
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-3 flex flex-col gap-1">
          <NavLink to="/dashboard"     className={navLinkClass} onClick={() => setMenuOpen(false)}>🏠 Início</NavLink>
          <NavLink to="/apostas"       className={navLinkClass} onClick={() => setMenuOpen(false)}>🎯 Apostas</NavLink>
          <NavLink to="/ranking"       className={navLinkClass} onClick={() => setMenuOpen(false)}>🏆 Ranking</NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin/partidas" className={navLinkClass} onClick={() => setMenuOpen(false)}>⚽ Partidas</NavLink>
              <NavLink to="/admin/usuarios" className={navLinkClass} onClick={() => setMenuOpen(false)}>👥 Usuários</NavLink>
            </>
          )}
          <div className="border-t border-gray-800 mt-2 pt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role === 'ADMIN' ? '👑 Admin' : '🎮 Jogador'}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1.5">Sair</button>
          </div>
        </div>
      )}
    </header>
  );
}