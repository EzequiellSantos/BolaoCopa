import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-700">
        Ezequiel Santos / Kevin Lima Bolao Copa © {new Date().getFullYear()}
      </footer>
    </div>
  );
}