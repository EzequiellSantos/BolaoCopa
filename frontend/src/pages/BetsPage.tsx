import { useEffect, useState } from 'react';
import { matchesApi, betsApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import type { Match, Bet } from '../types';
import { BetResult, MatchStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../contexts/ToastContext';

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

function getEntityId(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const entity = value as { _id?: unknown; id?: unknown; $oid?: unknown };
    const id = entity._id ?? entity.id ?? entity.$oid;

    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id !== null && '$oid' in id) {
      const oid = (id as { $oid?: unknown }).$oid;
      return typeof oid === 'string' ? oid : undefined;
    }
    if (typeof id === 'object' && id !== null && typeof id.toString === 'function') {
      const idFromString = id.toString();
      return idFromString === '[object Object]' ? undefined : idFromString;
    }

    if (typeof value.toString === 'function') {
      const idFromString = value.toString();
      return idFromString === '[object Object]' ? undefined : idFromString;
    }
  }

  return undefined;
}

interface BetCardProps {
  match: Match;
  existingBet?: Bet;
  onBetSaved: () => void;
}

function BetCard({ match, existingBet, onBetSaved }: BetCardProps) {
  const toast = useToast();
  const [homeScore, setHomeScore] = useState(String(existingBet?.homeScore ?? ''));
  const [awayScore, setAwayScore] = useState(String(existingBet?.awayScore ?? ''));
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const isOpen    = match.status === MatchStatus.OPEN;
  const hasBet    = !!existingBet;
  const canEdit   = isOpen && !hasBet;

  useEffect(() => {
    if (!existingBet) return;
    setHomeScore(String(existingBet.homeScore));
    setAwayScore(String(existingBet.awayScore));
    setError('');
  }, [existingBet]);

  const handleSave = async () => {
    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { setError('Preencha os placares corretamente.'); return; }
    setSaving(true); setError('');
    try {
      await betsApi.create({ matchId: match._id, homeScore: h, awayScore: a });
      toast.success('Palpite registrado!');
      onBetSaved();
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className={`card flex flex-col gap-4 transition-all ${hasBet ? 'border-brand-800/60' : 'border-gray-800'}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={match.status} />
            {match.description && <span className="text-xs text-gray-500">{match.description}</span>}
          </div>
          <p className="font-black text-white text-xl tracking-tight">
            {match.homeTeam} <span className="text-gray-600 font-light">×</span> {match.awayTeam}
          </p>
          <p className="text-xs text-gray-500 mt-1">📅 {fmt(match.matchDate)}{match.stadium ? ` · 🏟️ ${match.stadium}` : ''}</p>
        </div>
        {match.status === MatchStatus.FINISHED && match.homeScore !== null && (
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Resultado</p>
            <p className="text-2xl font-black text-brand-400">{match.homeScore} × {match.awayScore}</p>
          </div>
        )}
      </div>

      {existingBet && match.status === MatchStatus.FINISHED && (
        <div className={`text-sm font-semibold ${resultLabel(existingBet.result).cls}`}>
          {resultLabel(existingBet.result).label}
        </div>
      )}

      <div className="border-t border-gray-800 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Seu palpite</p>
        <div className={hasBet ? 'rounded-lg border border-brand-800/60 bg-brand-950/20 px-4 py-3' : ''}>
          {hasBet && <p className="text-xs font-semibold text-brand-300 mb-2">Palpite registrado</p>}
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-1 truncate">{match.homeTeam}</p>
                  <input type="number" min={0} value={homeScore} onChange={e => setHomeScore(e.target.value)} disabled={!canEdit} className="input text-center text-2xl font-black py-3 disabled:opacity-80 disabled:cursor-not-allowed" placeholder="0" />
            </div>
            <span className="text-gray-600 font-light text-2xl mt-4">×</span>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-1 truncate">{match.awayTeam}</p>
                  <input type="number" min={0} value={awayScore} onChange={e => setAwayScore(e.target.value)} disabled={!canEdit} className="input text-center text-2xl font-black py-3 disabled:opacity-80 disabled:cursor-not-allowed" placeholder="0" />
            </div>
          </div>
          {hasBet && (
            <p className="text-brand-300 text-sm mt-3">Você já fez um palpite para este jogo. Não é possível alterar.</p>
          )}
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {!isOpen && !existingBet && <p className="text-gray-600 text-xs mt-2">Esta partida não aceita mais palpites.</p>}
        {canEdit && (
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-3 text-sm flex items-center justify-center gap-2">
            {saving ? <><Spinner size="sm" /> Salvando...</> : 'Registrar Palpites'}
          </button>
        )}
      </div>
    </div>
  );
}

type Tab = 'open' | 'all';

export default function BetsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [myBets, setMyBets]   = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState<Tab>('open');

  const load = async () => {
    try {
      setLoading(true);
      const [allMatches, bets] = await Promise.all([matchesApi.list(), betsApi.myBets()]);
      setMatches(allMatches); setMyBets(bets); setError('');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const betByMatch = (matchId: unknown) => {
    const currentMatchId = getEntityId(matchId);

    if (!currentMatchId) return undefined;

    return myBets.find(b => getEntityId(b.match) === currentMatchId);
  };

  const openMatches    = matches.filter(m => m.status === MatchStatus.OPEN);
  const nonOpenMatches = matches.filter(m => m.status !== MatchStatus.OPEN);
  const displayed      = tab === 'open' ? openMatches : nonOpenMatches;

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t ? 'bg-brand-600/20 text-brand-400' : 'text-gray-500 hover:text-white'}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">🎯 Palpites</h1>
        <p className="text-gray-500 text-sm mt-1">{openMatches.length} jogo(s) aberto(s) · {myBets.length} palpite(s) registrado(s)</p>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        <button className={tabCls('open')} onClick={() => setTab('open')}>🟢 Abertos ({openMatches.length})</button>
        <button className={tabCls('all')}  onClick={() => setTab('all')}>📋 Encerrados ({nonOpenMatches.length})</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : displayed.length === 0 ? (
        <EmptyState
          emoji={tab === 'open' ? '🎉' : '📭'}
          title={tab === 'open' ? 'Nenhum jogo aberto' : 'Nenhum jogo encerrado'}
          description={tab === 'open' ? 'Aguarde o admin abrir os palpites.' : 'Os jogos encerrados aparecerão aqui.'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayed.map(m => (
            <BetCard key={m._id} match={m} existingBet={betByMatch(m._id)} onBetSaved={load} />
          ))}
        </div>
      )}
    </div>
  );
}
