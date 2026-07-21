import { useAuth } from '../contexts/AuthContext';
import { useIsAdmin } from '../hooks/useAuth';
import { NavLink } from 'react-router-dom';

interface QuickLinkProps {
  to: string;
  emoji: string;
  label: string;
  description: string;
}

function QuickLink({ to, emoji, label, description }: QuickLinkProps) {
  return (
    <NavLink
      to={to}
      className="card hover:border-brand-700 hover:bg-gray-800/60 transition-all group flex flex-col gap-2"
    >
      <span className="text-3xl">{emoji}</span>
      <p className="font-bold text-white group-hover:text-brand-400 transition-colors">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </NavLink>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin  = useIsAdmin();

  return (
    <div className="space-y-8">
      {/* Saudação */}
      <div>
        <h1 className="text-3xl font-black text-white">
          Olá, <span className="text-brand-500">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao Bolão Copa do Mundo.</p>
      </div>

      {/* Cards de ação rápida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLink
          to="/palpites"
          emoji="🎯"
          label="Fazer Palpites"
          description="Palpite nos jogos abertos."
        />
        <QuickLink
          to="/ranking"
          emoji="🏆"
          label="Ranking"
          description="Veja a classificação geral."
        />
        <QuickLink
          to="/ganhos"
          emoji="💰"
          label="Meus Ganhos"
          description="Simule quanto você ganharia apostando nas odds reais."
        />
        {isAdmin && (
          <>
            <QuickLink
              to="/admin/partidas"
              emoji="⚽"
              label="Gerenciar Partidas"
              description="Crie e finalize partidas."
            />
            <QuickLink
              to="/admin/usuarios"
              emoji="👥"
              label="Gerenciar Usuários"
              description="Adicione ou edite participantes."
            />
          </>
        )}
      </div>

      {/* Badge de role */}
      <div className="card flex items-center gap-4 max-w-sm">
        <div className="w-12 h-12 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-2xl">
          {isAdmin ? '👑' : '🎮'}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Seu perfil</p>
          <p className="font-bold text-white">{user?.name}</p>
          <p className="text-xs text-brand-400">{user?.role}</p>
        </div>
      </div>
    </div>
  );
}