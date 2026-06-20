import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { getErrorMessage } from '../api/axios';
import type { Match } from '../types';
import { BetResult, MatchStatus } from '../types';
import Modal from './Modal';
import Spinner from './Spinner';
import ErrorBanner from './ErrorBanner';
import EmptyState from './EmptyState';

// ─── Tipo local — resposta de GET /bets/match/:matchId ────────────────────────
interface PickEntry {
  _id: string;
  user: { _id: string; name: string } | string;
  homeScore: number;
  awayScore: number;
  result: BetResult;
  points: number;
}

function pickUserName(user: PickEntry['user']): string {
  if (typeof user === 'string') return 'Usuário';
  return user.name ?? 'Usuário';
}

function pickUserInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

const resultStyle: Record<BetResult, { label: string; cls: string; ring: string }> = {
  [BetResult.EXACT]:   { label: '🎯 Exato',    cls: 'text-brand-400 bg-brand-600/15',  ring: 'ring-brand-700/40' },
  [BetResult.WINNER]:  { label: '✅ Vencedor', cls: 'text-blue-400 bg-blue-600/15',    ring: 'ring-blue-700/40' },
  [BetResult.MISS]:    { label: '❌ Errou',    cls: 'text-red-400 bg-red-600/10',      ring: 'ring-red-800/30' },
  [BetResult.PENDING]: { label: '⏳ Aguardando', cls: 'text-gray-500 bg-gray-800/60',  ring: 'ring-gray-700/40' },
};

interface Props {
  match: Match;
  onClose: () => void;
}

export default function MatchPicksModal({ match, onClose }: Props) {
  const [picks, setPicks]     = useState<PickEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get<PickEntry[]>(`/bets/match/${match._id}`);
        if (active) { setPicks(data); setError(''); }
      } catch (e) {
        if (active) setError(getErrorMessage(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [match._id]);

  const isFinished = match.status === MatchStatus.FINISHED;

  return (
    <Modal title="Palpites da partida" onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Cabeçalho da partida */}
        <div className="text-center pb-3 border-b border-gray-800">
          <p className="font-black text-white text-lg leading-snug">
            {match.homeTeam} <span className="text-gray-600 font-light">×</span> {match.awayTeam}
          </p>
          {isFinished && match.homeScore !== null && (
            <p className="text-3xl font-black text-brand-400 mt-1">
              {match.homeScore} <span className="text-gray-600 text-xl">×</span> {match.awayScore}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {picks.length} palpite(s) registrado(s)
          </p>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorBanner message={error} />
        ) : picks.length === 0 ? (
          <EmptyState emoji="🤷" title="Sem palpites" description="Nenhum usuário registrou palpite para esta partida." />
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
            {picks.map((pick) => {
              const name  = pickUserName(pick.user);
              const style = resultStyle[pick.result] ?? resultStyle[BetResult.PENDING];

              return (
                <div
                  key={pick._id}
                  className={`flex items-center gap-3 rounded-xl bg-gray-900/60 border border-gray-800 px-3 py-2.5 ring-1 ${style.ring}`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 shrink-0">
                    {pickUserInitial(name)}
                  </div>

                  {/* Nome + placar */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {match.homeTeam} <span className="font-bold text-gray-200">{pick.homeScore}</span>
                      <span className="text-gray-600 mx-1">×</span>
                      <span className="font-bold text-gray-200">{pick.awayScore}</span> {match.awayTeam}
                    </p>
                  </div>

                  {/* Badge de resultado */}
                  <div className={`shrink-0 text-[11px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${style.cls}`}>
                    {style.label}
                    {pick.points > 0 && <span className="ml-1">+{pick.points}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}