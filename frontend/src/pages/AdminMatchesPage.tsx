import { useEffect, useState } from 'react';
import { matchesApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import type { Match } from '../types';
import { MatchStatus } from '../types';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

// ─── Formulário de criação ────────────────────────────────────────────────────
interface CreateForm {
  homeTeam: string; awayTeam: string;
  matchDate: string; description: string; stadium: string;
}
const emptyCreate: CreateForm = { homeTeam: '', awayTeam: '', matchDate: '', description: '', stadium: '' };

// ─── Formulário de resultado ──────────────────────────────────────────────────
interface ResultForm { homeScore: string; awayScore: string; }

function fmt(date: string) {
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminMatchesPage() {
  const [matches, setMatches]   = useState<Match[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modal, setModal]       = useState<'create' | 'result' | null>(null);
  const [selected, setSelected] = useState<Match | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreate);
  const [resultForm, setResultForm] = useState<ResultForm>({ homeScore: '', awayScore: '' });
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setMatches(await matchesApi.list());
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setCreateForm(emptyCreate); setFormError(''); setModal('create'); };
  const openResult = (m: Match) => { setSelected(m); setResultForm({ homeScore: '', awayScore: '' }); setFormError(''); setModal('result'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleCreate = async () => {
    setSaving(true); setFormError('');
    try {
      await matchesApi.create({ ...createForm, matchDate: new Date(createForm.matchDate).toISOString() });
      await load(); closeModal();
    } catch (e) { setFormError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const handleResult = async () => {
    if (!selected) return;
    setSaving(true); setFormError('');
    try {
      await matchesApi.update(selected._id, {
        status: MatchStatus.FINISHED,
        homeScore: Number(resultForm.homeScore),
        awayScore: Number(resultForm.awayScore),
      });
      await load(); closeModal();
    } catch (e) { setFormError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const handleStatus = async (m: Match, status: MatchStatus) => {
    try {
      await matchesApi.updateStatus(m._id, status);
      await load();
    } catch (e) { alert(getErrorMessage(e)); }
  };

  const handleDelete = async (m: Match) => {
    if (!confirm(`Remover "${m.homeTeam} x ${m.awayTeam}"?`)) return;
    try { await matchesApi.remove(m._id); await load(); }
    catch (e) { alert(getErrorMessage(e)); }
  };

  const cf = (key: keyof CreateForm, v: string) => setCreateForm(f => ({ ...f, [key]: v }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">⚽ Partidas</h1>
          <p className="text-gray-500 text-sm mt-1">{matches.length} partida(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">+ Nova partida</button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {matches.length === 0 && (
            <div className="card text-center text-gray-600 py-12">Nenhuma partida cadastrada.</div>
          )}
          {matches.map(m => (
            <div key={m._id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <StatusBadge status={m.status} />
                  {m.description && <span className="text-xs text-gray-500">{m.description}</span>}
                </div>
                <p className="font-bold text-white text-lg">
                  {m.homeTeam}
                  {m.status === MatchStatus.FINISHED
                    ? <span className="text-brand-400 mx-2">{m.homeScore} × {m.awayScore}</span>
                    : <span className="text-gray-600 mx-2">×</span>
                  }
                  {m.awayTeam}
                </p>
                <p className="text-xs text-gray-500 mt-1">📅 {fmt(m.matchDate)}{m.stadium ? ` · 🏟️ ${m.stadium}` : ''}</p>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2 shrink-0">
                {m.status === MatchStatus.OPEN && (
                  <button onClick={() => handleStatus(m, MatchStatus.CLOSED)} className="text-xs btn-secondary px-3 py-1.5">
                    Fechar
                  </button>
                )}
                {m.status === MatchStatus.CLOSED && (
                  <>
                    <button onClick={() => handleStatus(m, MatchStatus.OPEN)} className="text-xs btn-secondary px-3 py-1.5">
                      Reabrir
                    </button>
                    <button onClick={() => openResult(m)} className="text-xs btn-primary px-3 py-1.5">
                      Finalizar
                    </button>
                  </>
                )}
                {m.status === MatchStatus.OPEN && (
                  <button onClick={() => handleDelete(m)} className="text-xs btn-danger px-3 py-1.5">
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: criar partida */}
      {modal === 'create' && (
        <Modal title="Nova Partida" onClose={closeModal} size="lg">
          <div className="space-y-4">
            {formError && <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">{formError}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Time da Casa</label>
                <input className="input" value={createForm.homeTeam} onChange={e => cf('homeTeam', e.target.value)} placeholder="Brasil" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Time Visitante</label>
                <input className="input" value={createForm.awayTeam} onChange={e => cf('awayTeam', e.target.value)} placeholder="Argentina" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Data e Hora</label>
              <input className="input" type="datetime-local" value={createForm.matchDate} onChange={e => cf('matchDate', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Descrição</label>
                <input className="input" value={createForm.description} onChange={e => cf('description', e.target.value)} placeholder="Grupo A — Rodada 1" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Estádio</label>
                <input className="input" value={createForm.stadium} onChange={e => cf('stadium', e.target.value)} placeholder="Maracanã" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Salvando...' : 'Criar partida'}
              </button>
              <button onClick={closeModal} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: definir resultado */}
      {modal === 'result' && selected && (
        <Modal title="Definir Resultado" onClose={closeModal} size="sm">
          <div className="space-y-4">
            {formError && <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">{formError}</p>}

            <p className="text-center font-bold text-white text-lg">{selected.homeTeam} × {selected.awayTeam}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{selected.homeTeam}</label>
                <input className="input text-center text-2xl font-bold" type="number" min={0} value={resultForm.homeScore} onChange={e => setResultForm(f => ({ ...f, homeScore: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{selected.awayTeam}</label>
                <input className="input text-center text-2xl font-bold" type="number" min={0} value={resultForm.awayScore} onChange={e => setResultForm(f => ({ ...f, awayScore: e.target.value }))} placeholder="0" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleResult} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Finalizando...' : 'Confirmar'}
              </button>
              <button onClick={closeModal} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}