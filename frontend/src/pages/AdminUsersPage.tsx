import { useEffect, useState } from 'react';
import { usersApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import type { User } from '../types';
import { UserRole } from '../types';
import Modal from '../components/Modal';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const emptyForm: UserFormData = { name: '', email: '', password: '', role: UserRole.USER };

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modal, setModal]       = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm]         = useState<UserFormData>(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setUsers(await usersApi.list());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setSelected(null);
    setModal('create');
  };

  const openEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setFormError('');
    setSelected(user);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (modal === 'create') {
        await usersApi.create(form);
      } else if (selected) {
        const payload: Partial<UserFormData> = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await usersApi.update(selected._id, payload);
      }
      await load();
      closeModal();
    } catch (e) {
      setFormError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersApi.update(user._id, { isActive: !user.isActive });
      await load();
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  const field = (key: keyof UserFormData, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">👥 Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} participante(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">+ Novo usuário</button>
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-widest">
                  <th className="px-5 py-3">Nome</th>
                  <th className="px-5 py-3">E-mail</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{u.name}</td>
                    <td className="px-5 py-3 text-gray-400">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === UserRole.ADMIN ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-800 text-gray-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-400'}`}>
                        {u.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 flex items-center gap-2">
                      <button onClick={() => openEdit(u)} className="text-xs btn-secondary px-2 py-1">
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${u.isActive ? 'bg-red-900/50 text-red-400 hover:bg-red-900' : 'bg-green-900/50 text-green-400 hover:bg-green-900'}`}
                      >
                        {u.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-600">Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <Modal title={modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'} onClose={closeModal}>
          <div className="space-y-4">
            {formError && <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">{formError}</p>}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Nome</label>
              <input className="input" value={form.name} onChange={e => field('name', e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">E-mail</label>
              <input className="input" type="email" value={form.email} onChange={e => field('email', e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Senha {modal === 'edit' && <span className="text-gray-600 normal-case">(deixe em branco para manter)</span>}
              </label>
              <input className="input" type="password" value={form.password} onChange={e => field('password', e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Role</label>
              <select className="input" value={form.role} onChange={e => field('role', e.target.value as UserRole)}>
                <option value={UserRole.USER}>USER</option>
                <option value={UserRole.ADMIN}>ADMIN</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button onClick={closeModal} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}