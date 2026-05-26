import { useEffect, useState } from 'react';
import { matchesApi, betsApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import type { Match, Bet } from '../types';
import { BetResult, MatchStatus } from '../types';
import StatusBadge from '../components/StatusBadge';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(date: string) {
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function resultLabel(result: BetResult) {
  const map: Record<BetResult, { label: string; cls: string }> = {
    [BetResult.EXACT]:   { label: '🎯 Placar exato · +3pts', cls: 'text-brand-400' },
    [BetResult.WINNER]:  { label: '✅ Vencedor certo · +1pt', cls: 'text-blue-400' },
    [BetResult.MISS]:    { label: '❌ Errou · 0pts',          cls: 'text-red-400' },
    [BetResult.PENDING]: { label: '⏳ Aguardando resultado',  cls: 'text-gray-500' },
  };
  return map[result];
}

// ─── Componente de aposta individual ─────────────────────────────────────────
interface BetCardProps {
  match: Match;
  existingBet?: Bet;
  onBetSaved: () => void;
}

function BetCard({ match, existingBet, onBetSaved }: BetCardProps) {
  const [homeScore, setHomeScore] = useState(String(existingBet?.homeScore ?? ''));
  const [awayScore, setAwayScore] = useState(String(existingBet?.awayScore ?? ''));
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const isOpen    = match.status === MatchStatus.OPEN;
  const hasBet    = !!existingBet;
  const isEditing = hasBet && isOpen;

  const isDirty =
    String(existingBet?.homeScore ?? '') !== homeScore ||
    String(existingBet?.awayScore ?? '') !== awayScore;

  const handleSave = async () => {
    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError('Preencha os placares corretamente.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isEditing && existingBet) {
        await betsApi.update(existingBet._id, { homeScore: h, awayScore: a });
        setSuccess('Aposta atualizada!');
      } else {
        await betsApi.create({ matchId: match._id, homeScore: h, awayScore: a });
        setSuccess('Aposta registrada!');
      }
      onBetSaved();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`card flex flex-col gap-4 transition-all ${hasBet ? 'border-brand-800/60' : 'border-gray-800'}`}>
      {/* Match header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={match.status} />
            {match.description && <span className="text-xs text-gray-500">{match.description}</span>}
          </div>
          <p className="font-black text-white text-xl tracking-tight">
            {match.homeTeam} <span className="text-gray-600 font-light">×</span> {match.awayTeam}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            📅 {fmt(match.matchDate)}{match.stadium ? ` · 🏟️ ${match.stadium}` : ''}
          </p>
        </div>

        {/* Resultado real (FINISHED) */}
        {match.status === MatchStatus.FINISHED && match.homeScore !== null && (
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Resultado</p>
            <p className="text-2xl font-black text-brand-400">
              {match.homeScore} × {match.awayScore}
            </p>
          </div>
        )}
      </div>

      {/* Resultado da aposta (se finalizado) */}
      {existingBet && match.status === MatchStatus.FINISHED && (
        <div className={`text-sm font-semibold ${resultLabel(existingBet.result).cls}`}>
          {resultLabel(existingBet.result).label}
        </div>
      )}

      {/* Input de aposta */}
      <div className="border-t border-gray-800 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          {hasBet ? 'Seu palpite' : 'Seu palpite'}
        </p>

        <div className="flex items-center gap-3">
          {/* Home score */}
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 mb-1 truncate">{match.homeTeam}</p>
            <input
              type="number"
              min={0}
              value={homeScore}
              onChange={e => setHomeScore(e.target.value)}
              disabled={!isOpen}
              className="input text-center text-2xl font-black py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>

          <span className="text-gray-600 font-light text-2xl mt-4">×</span>

          {/* Away score */}
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 mb-1 truncate">{match.awayTeam}</p>
            <input
              type="number"
              min={0}
              value={awayScore}
              onChange={e => setAwayScore(e.target.value)}
              disabled={!isOpen}
              className="input text-center text-2xl font-black py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>
        </div>

        {/* Feedback */}
        {error   && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {success && <p className="text-brand-400 text-sm mt-2">{success}</p>}
        {!isOpen && !existingBet && (
          <p className="text-gray-600 text-xs mt-2">Esta partida não aceita mais apostas.</p>
        )}

        {/* Botão */}
        {isOpen && (
          <button
            onClick={handleSave}
            disabled={saving || (hasBet && !isDirty)}
            className="btn-primary w-full mt-3 text-sm"
          >
            {saving
              ? 'Salvando...'
              : hasBet
                ? isDirty ? 'Atualizar aposta' : 'Aposta salva ✓'
                : 'Registrar aposta'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
type Tab = 'open' | 'all';

export default function BetsPage() {
  const [matches, setMatches]   = useState<Match[]>([]);
  const [myBets, setMyBets]     = useState<Bet[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState<Tab>('open');

  const load = async () => {
    try {
      setLoading(true);
      const [allMatches, bets] = await Promise.all([
        matchesApi.list(),
        betsApi.myBets(),
      ]);
      setMatches(allMatches);
      setMyBets(bets);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const betByMatch = (matchId: string) =>
    myBets.find(b => {
      const m = b.match as Match | string;
      return typeof m === 'string' ? m === matchId : m._id === matchId;
    });

  const openMatches     = matches.filter(m => m.status === MatchStatus.OPEN);
  const nonOpenMatches  = matches.filter(m => m.status !== MatchStatus.OPEN);
  const displayed       = tab === 'open' ? openMatches : nonOpenMatches;

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      tab === t
        ? 'bg-brand-600/20 text-brand-400'
        : 'text-gray-500 hover:text-white'
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">🎯 Apostas</h1>
        <p className="text-gray-500 text-sm mt-1">
          {openMatches.length} jogo(s) aberto(s) · {myBets.length} aposta(s) registrada(s)
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        <button className={tabCls('open')} onClick={() => setTab('open')}>
          🟢 Abertos ({openMatches.length})
        </button>
        <button className={tabCls('all')} onClick={() => setTab('all')}>
          📋 Encerrados ({nonOpenMatches.length})
        </button>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">{tab === 'open' ? '🎉' : '📭'}</p>
          <p className="text-gray-500">
            {tab === 'open'
              ? 'Nenhum jogo aberto no momento.'
              : 'Nenhum jogo encerrado ainda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayed.map(m => (
            <BetCard
              key={m._id}
              match={m}
              existingBet={betByMatch(m._id)}
              onBetSaved={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}