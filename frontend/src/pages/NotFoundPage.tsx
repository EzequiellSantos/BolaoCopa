import { NavLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-center px-4">
      <p className="text-7xl mb-4">🔍</p>
      <h1 className="text-4xl font-black text-white mb-2">404</h1>
      <p className="text-gray-500 mb-6">Página não encontrada.</p>
      <NavLink to="/dashboard" className="btn-primary">
        Voltar ao início
      </NavLink>
    </div>
  );
}