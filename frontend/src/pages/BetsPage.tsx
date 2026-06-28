import { useEffect, useRef, useState } from 'react';
import { matchesApi, betsApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import type { Match, Bet } from '../types';
import { BetResult, MatchStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import MatchPicksModal from '../components/MatchPicksModal';
import { useToast } from '../contexts/ToastContext';

function fmt(date: string) {
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function resultLabel(result: BetResult) {
  const map: Record<BetResult, { label: string; cls: string }> = {
    [BetResult.PENALTY_WINNER]: { label: '🏆 Pênaltis exato · +5pts',   cls: 'text-yellow-400' },
    [BetResult.EXACT]:          { label: '🎯 Placar exato · +3pts',      cls: 'text-brand-400' },
    [BetResult.PENALTY_DRAW]:   { label: '🥅 Pênaltis acertado · +2pts', cls: 'text-orange-400' },
    [BetResult.WINNER]:         { label: '✅ Empate acertado · +1pt',    cls: 'text-blue-400' },
    [BetResult.MISS]:           { label: '❌ Errou · 0pts',              cls: 'text-red-400' },
    [BetResult.PENDING]:        { label: '⏳ Aguardando resultado',       cls: 'text-gray-500' },
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
    if (typeof id === 'object' && id !== null && typeof (id as any).toString === 'function') {
      const s = (id as any).toString();
      return s === '[object Object]' ? undefined : s;
    }
    if (typeof (value as any).toString === 'function') {
      const s = (value as any).toString();
      return s === '[object Object]' ? undefined : s;
    }
  }
  return undefined;
}

// ─── Lógica de categorias (grupos e fases) ────────────────────────────────────

function extractCategory(match: Match): string {
  if (!match.description) return 'Outros';
  const m = match.description.match(/^Grupo ([A-L])/);
  if (m) return m[1];
  if (match.description.includes('Mata-mata')) return 'Mata-mata';
  if (match.description.includes('Oitavas'))   return 'Oitavas';
  if (match.description.includes('Quartas'))   return 'Quartas';
  if (match.description.includes('Semifinal')) return 'Semis';
  if (match.description.includes('3º Lugar'))  return '3º Lugar';
  if (match.description.includes('Final'))     return 'Final';
  return 'Outros';
}

const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const PHASE_ORDER   = ['Mata-mata','Oitavas','Quartas','Semis','3º Lugar','Final','Outros'];

function sortCategories(cats: string[]): string[] {
  return [...cats].sort((a, b) => {
    const ai = GROUP_LETTERS.indexOf(a);
    const bi = GROUP_LETTERS.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return PHASE_ORDER.indexOf(a) - PHASE_ORDER.indexOf(b);
  });
}

function categoryLabel(cat: string): string {
  return GROUP_LETTERS.includes(cat) ? `Grupo ${cat}` : cat;
}

function isKnockout(match: Match): boolean {
  const d = match.description ?? '';
  return ['Mata-mata', 'Oitavas', 'Quartas', 'Semifinal', 'Semis', '3º Lugar', 'Final'].some(p => d.includes(p));
}

// ─── BetCard ──────────────────────────────────────────────────────────────────

interface BetCardProps {
  match: Match;
  existingBet?: Bet;
  onBetSaved: () => void;
  onViewPicks: (match: Match) => void;
}

function BetCard({ match, existingBet, onBetSaved, onViewPicks }: BetCardProps) {
  const toast = useToast();
  const [homeScore, setHomeScore]         = useState(String(existingBet?.homeScore ?? ''));
  const [awayScore, setAwayScore]         = useState(String(existingBet?.awayScore ?? ''));
  const [penaltyWinner, setPenaltyWinner] = useState<'home' | 'away' | null>(existingBet?.penaltyWinner ?? null);
  const [isEditing, setIsEditing]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');

  const isOpen      = match.status === MatchStatus.OPEN;
  const hasBet      = !!existingBet;
  const canCreate   = isOpen && !hasBet;
  const canEditMode = isOpen && hasBet;
  const inputsDisabled = !canCreate && !(canEditMode && isEditing);

  const parsedHome = parseInt(homeScore);
  const parsedAway = parseInt(awayScore);
  const isDraw     = !isNaN(parsedHome) && !isNaN(parsedAway) && parsedHome === parsedAway;
  const showPenaltySelector = isKnockout(match) && isDraw && (canCreate || (canEditMode && isEditing));
  const showPenaltyResult   = isKnockout(match) && !isOpen && existingBet?.penaltyWinner;

  useEffect(() => {
    setHomeScore(String(existingBet?.homeScore ?? ''));
    setAwayScore(String(existingBet?.awayScore ?? ''));
    setPenaltyWinner(existingBet?.penaltyWinner ?? null);
    setError('');
    setIsEditing(false);
  }, [existingBet]);

  const handleCreate = async () => {
    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { setError('Preencha os placares corretamente.'); return; }
    const effectivePenalty = (isKnockout(match) && h === a) ? penaltyWinner ?? undefined : undefined;
    setSaving(true); setError('');
    try {
      await betsApi.create({ matchId: match._id, homeScore: h, awayScore: a, penaltyWinner: effectivePenalty });
      toast.success('Palpite registrado!');
      onBetSaved();
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { setError('Preencha os placares corretamente.'); return; }
    const effectivePenalty = (isKnockout(match) && h === a) ? penaltyWinner ?? undefined : undefined;
    setSaving(true); setError('');
    try {
      await betsApi.update(existingBet!._id, { homeScore: h, awayScore: a, penaltyWinner: effectivePenalty });
      toast.success('Palpite atualizado!');
      setIsEditing(false);
      onBetSaved();
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleCancelEdit = () => {
    setHomeScore(String(existingBet?.homeScore ?? ''));
    setAwayScore(String(existingBet?.awayScore ?? ''));
    setPenaltyWinner(existingBet?.penaltyWinner ?? null);
    setError('');
    setIsEditing(false);
  };

  return (
    <div className={`card flex flex-col gap-4 transition-all ${hasBet ? 'border-brand-800/60' : 'border-gray-800'}`}>
      {/* Header — clicável quando a partida não está mais aberta */}
      <button
        type="button"
        disabled={isOpen}
        onClick={() => onViewPicks(match)}
        className={`flex items-start justify-between gap-2 flex-wrap text-left w-full rounded-lg -m-1 p-1 transition-colors ${
          !isOpen ? 'active:bg-gray-800/60 sm:hover:bg-gray-800/40 cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={match.status} />
            {match.description && <span className="text-xs text-gray-500 truncate">{match.description}</span>}
          </div>
          <p className="font-black text-white text-xl tracking-tight">
            {match.homeTeam} <span className="text-gray-600 font-light">×</span> {match.awayTeam}
          </p>
          <p className="text-xs text-gray-500 mt-1">📅 {fmt(match.matchDate)}{match.stadium ? ` · 🏟️ ${match.stadium}` : ''}</p>
          {!isOpen && (
            <p className="text-[11px] text-brand-500 mt-1.5 font-semibold flex items-center gap-1">
              👁️ Ver palpites de todos
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </p>
          )}
        </div>
        {match.status === MatchStatus.FINISHED && match.homeScore !== null && (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Resultado</p>
            <p className="text-2xl font-black text-brand-400">{match.homeScore} × {match.awayScore}</p>
          </div>
        )}
      </button>

      {existingBet && match.status === MatchStatus.FINISHED && (
        <div className={`text-sm font-semibold ${resultLabel(existingBet.result).cls}`}>
          {resultLabel(existingBet.result).label}
        </div>
      )}

      <div className="border-t border-gray-800 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Seu palpite</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 mb-1 truncate">{match.homeTeam}</p>
            <input
              type="number" min={0} value={homeScore}
              onChange={e => setHomeScore(e.target.value)}
              disabled={inputsDisabled}
              className="input text-center text-2xl font-black py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>
          <span className="text-gray-600 font-light text-2xl mt-4">×</span>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 mb-1 truncate">{match.awayTeam}</p>
            <input
              type="number" min={0} value={awayScore}
              onChange={e => setAwayScore(e.target.value)}
              disabled={inputsDisabled}
              className="input text-center text-2xl font-black py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>
        </div>

        {/* Seletor de pênaltis — visível ao apostar empate em mata-mata */}
        {showPenaltySelector && (
          <div className="mt-4 p-3 rounded-xl bg-yellow-900/20 border border-yellow-800/40">
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-2">Quem vence nos pênaltis?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPenaltyWinner('home')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                  penaltyWinner === 'home'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {match.homeTeam}
              </button>
              <button
                type="button"
                onClick={() => setPenaltyWinner('away')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                  penaltyWinner === 'away'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {match.awayTeam}
              </button>
            </div>
            {penaltyWinner && (
              <p className="text-xs text-yellow-500/70 mt-1.5 text-center">
                +2pts extras se acertar os pênaltis
              </p>
            )}
          </div>
        )}

        {/* Palpite de pênaltis já registrado (só leitura) */}
        {showPenaltyResult && (
          <p className="text-xs text-yellow-500/80 mt-1">
            Pênaltis: <span className="font-bold text-yellow-400">
              {existingBet!.penaltyWinner === 'home' ? match.homeTeam : match.awayTeam}
            </span>
          </p>
        )}

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {!isOpen && !hasBet && (
          <p className="text-gray-600 text-xs mt-2">Esta partida não aceita mais palpites.</p>
        )}

        {canEditMode && !isEditing && (
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-brand-300 text-sm">
                Seu palpite: <span className="font-bold">{existingBet?.homeScore} × {existingBet?.awayScore}</span>
              </p>
              {existingBet?.penaltyWinner && (
                <p className="text-xs text-yellow-500/80 mt-0.5">
                  Pênaltis: <span className="font-bold text-yellow-400">
                    {existingBet.penaltyWinner === 'home' ? match.homeTeam : match.awayTeam}
                  </span>
                </p>
              )}
            </div>
            <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm py-1.5">
              ✏️ Editar
            </button>
          </div>
        )}

        {canEditMode && isEditing && (
          <div className="flex gap-2 mt-3">
            <button onClick={handleUpdate} disabled={saving} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
              {saving ? <><Spinner size="sm" /> Salvando...</> : '✅ Salvar Alteração'}
            </button>
            <button onClick={handleCancelEdit} disabled={saving} className="btn-secondary text-sm px-4">
              Cancelar
            </button>
          </div>
        )}

        {canCreate && (
          <button onClick={handleCreate} disabled={saving} className="btn-primary w-full mt-3 text-sm flex items-center justify-center gap-2">
            {saving ? <><Spinner size="sm" /> Salvando...</> : 'Registrar Palpites'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── BetsPage ─────────────────────────────────────────────────────────────────

type MainTab = 'open' | 'all';

export default function BetsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [myBets, setMyBets]   = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState<MainTab>('open');
  const [category, setCategory] = useState<string>('all');
  const [picksMatch, setPicksMatch] = useState<Match | null>(null);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const pendingScrollToLastClosed = useRef(false);

  const [showTip, setShowTip]       = useState(false);
  const [tipVisible, setTipVisible] = useState(false);
  const tipCountIncremented = useRef(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('bolao_penalty_tip') ?? '0', 10);
    if (count >= 5) return;

    // Incrementa o contador só uma vez por visita (guard contra StrictMode double-invoke)
    if (!tipCountIncremented.current) {
      tipCountIncremented.current = true;
      localStorage.setItem('bolao_penalty_tip', String(count + 1));
    }

    // Mostra o popup (roda normalmente em ambos os mounts do StrictMode — o segundo é o que vale)
    setShowTip(true);
    const showTimer    = setTimeout(() => setTipVisible(true), 50);
    const dismissTimer = setTimeout(() => {
      setTipVisible(false);
      setTimeout(() => setShowTip(false), 500);
    }, 7000);
    return () => { clearTimeout(showTimer); clearTimeout(dismissTimer); };
  }, []);

  const dismissTip = () => {
    setTipVisible(false);
    setTimeout(() => setShowTip(false), 500);
  };

  const load = async () => {
    try {
      setLoading(true);
      const [allMatches, bets] = await Promise.all([matchesApi.list(), betsApi.myBets()]);
      setMatches(allMatches); setMyBets(bets); setError('');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!pendingScrollToLastClosed.current || tab !== 'all') return;
    pendingScrollToLastClosed.current = false;

    const nonOpen = matches.filter(m => m.status !== MatchStatus.OPEN);
    const last = nonOpen[nonOpen.length - 1];
    if (!last) return;

    setTimeout(() => {
      cardRefs.current.get(last._id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }, [tab, matches]);

  const betByMatch = (matchId: unknown) => {
    const id = getEntityId(matchId);
    if (!id) return undefined;
    return myBets.find(b => getEntityId(b.match) === id);
  };

  const openMatches    = matches.filter(m => m.status === MatchStatus.OPEN);
  const nonOpenMatches = matches.filter(m => m.status !== MatchStatus.OPEN);
  const baseMatches    = tab === 'open' ? openMatches : nonOpenMatches;

  const availableCategories = sortCategories([...new Set(baseMatches.map(extractCategory))]);
  const activeCategory = availableCategories.includes(category) ? category : 'all';

  const displayed = activeCategory === 'all'
    ? baseMatches
    : baseMatches.filter(m => extractCategory(m) === activeCategory);

  const handleTabChange = (t: MainTab) => {
    if (t === 'all') pendingScrollToLastClosed.current = true;
    setTab(t);
    setCategory('all');
  };

  const mainTabCls = (t: MainTab) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t ? 'bg-brand-600/20 text-brand-400' : 'text-gray-500 hover:text-white'}`;

  const catBtnCls = (cat: string) => {
    const active = activeCategory === cat;
    return `px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
      active
        ? 'bg-brand-600 text-white shadow-sm'
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
    }`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">🎯 Palpites</h1>
        <p className="text-gray-500 text-sm mt-1">
          {openMatches.length} jogo(s) aberto(s) · {myBets.length} palpite(s) registrado(s)
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* Tabs principais */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        <button className={mainTabCls('open')} onClick={() => handleTabChange('open')}>
          🟢 Abertos ({openMatches.length})
        </button>
        <button className={mainTabCls('all')} onClick={() => handleTabChange('all')}>
          📋 Encerrados ({nonOpenMatches.length})
        </button>
      </div>

      {/* Filtro por grupo / fase */}
      {!loading && availableCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
            {tab === 'open' ? 'Filtrar por grupo' : 'Filtrar por fase'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button className={catBtnCls('all')} onClick={() => setCategory('all')}>
              Todos ({baseMatches.length})
            </button>
            {availableCategories.map(cat => {
              const count = baseMatches.filter(m => extractCategory(m) === cat).length;
              const done  = baseMatches
                .filter(m => extractCategory(m) === cat)
                .filter(m => betByMatch(m._id)).length;
              return (
                <button key={cat} className={catBtnCls(cat)} onClick={() => setCategory(cat)}>
                  {categoryLabel(cat)}
                  {tab === 'open' && (
                    <span className="ml-1 opacity-70">{done}/{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Info da seleção atual */}
      {!loading && activeCategory !== 'all' && (
        <p className="text-sm text-white font-semibold">
          {categoryLabel(activeCategory)}
          <span className="text-gray-500 font-normal ml-2">
            · {displayed.length} jogo(s)
            {tab === 'open' && ` · ${displayed.filter(m => betByMatch(m._id)).length} palpite(s) feito(s)`}
          </span>
        </p>
      )}

      {/* Grid de jogos */}
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
            <div
              key={m._id}
              ref={el => { if (el) cardRefs.current.set(m._id, el); else cardRefs.current.delete(m._id); }}
            >
              <BetCard
                match={m}
                existingBet={betByMatch(m._id)}
                onBetSaved={load}
                onViewPicks={setPicksMatch}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal de palpites de todos */}
      {picksMatch && (
        <MatchPicksModal match={picksMatch} onClose={() => setPicksMatch(null)} />
      )}

      {/* Notificação: dica de pênaltis no mata-mata */}
      {showTip && (
        <div className={`fixed bottom-6 right-4 left-4 sm:left-auto sm:w-84 z-50 transition-all duration-500 ${
          tipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}>
          <div className="bg-gray-900 border border-yellow-700/50 rounded-2xl p-4 shadow-2xl shadow-black/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0 text-xl">
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-snug">Novidade no mata-mata!</p>
                <p className="text-xs text-gray-400 leading-relaxed mt-1">
                  Palpite de <span className="text-white font-semibold">empate</span>? Agora você pode prever quem vence nos{' '}
                  <span className="text-yellow-400 font-semibold">pênaltis</span> e ganhar até{' '}
                  <span className="text-yellow-400 font-bold">+5 pts</span> por jogo!
                </p>
              </div>
              <button
                onClick={dismissTip}
                className="text-gray-600 hover:text-gray-400 shrink-0 transition-colors -mt-0.5 -mr-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-3 h-0.5 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full bg-yellow-500/50 rounded-full transition-[width] duration-[7000ms] ease-linear ${
                tipVisible ? 'w-0' : 'w-full'
              }`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}