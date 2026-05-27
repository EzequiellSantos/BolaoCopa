import { useEffect, useState } from 'react';
import { rankingApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { RankingEntry } from '../types';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

function medalFor(pos: number) {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return null;
}

function Podium({ top3 }: { top3: RankingEntry[] }) {
  if (top3.length < 2) return null;
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = [' h-20', 'h-28', 'h-14'];
  const colors  = [
    'bg-gray-400/10 border border-gray-500/30 text-gray-400',
    'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400',
    'bg-amber-700/10 border border-amber-700/30 text-amber-600',
  ];

  return (
    <div className="flex items-end justify-center gap-3 pt-6 pb-0">
      {order.map((entry, i) => (
        <div key={entry.userId} className="flex flex-col items-center gap-2 w-28">
          <div className="text-center">
            <p className="text-lg">{medalFor(entry.position)}</p>
            <p className="text-xs font-bold text-white truncate max-w-[7rem] text-center">{entry.name.split(' ')[0]}</p>
            <p className="text-brand-400 font-black text-lg leading-none">{entry.totalPoints}pts</p>
          </div>
          <div className={`w-full ${heights[i]} rounded-t-lg flex items-center justify-center text-2xl font-black ${colors[i]}`}>
            {entry.position}º
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingRow({ entry, isMe }: { entry: RankingEntry; isMe: boolean }) {
  return (
    <tr className={`transition-colors ${isMe ? 'bg-brand-600/10 border-l-2 border-brand-500' : 'hover:bg-gray-800/40'}`}>
      <td className="px-5 py-3 text-center">
        {medalFor(entry.position) ?? <span className={`font-bold text-sm ${isMe ? 'text-brand-400' : 'text-gray-500'}`}>{entry.position}º</span>}
      </td>
      <td className="px-5 py-3">
        <p className={`font-semibold text-sm ${isMe ? 'text-brand-300' : 'text-white'}`}>
          {entry.name}{isMe && <span className="ml-2 text-xs text-brand-500 font-normal">(você)</span>}
        </p>
        <p className="text-xs text-gray-600">{entry.email}</p>
      </td>
      <td className="px-5 py-3 text-center">
        <span className={`text-lg font-black ${isMe ? 'text-brand-400' : 'text-white'}`}>{entry.totalPoints}</span>
      </td>
      <td className="px-5 py-3 text-center text-sm text-gray-400">{entry.exactScores}</td>
      <td className="px-5 py-3 text-center text-sm text-gray-400">{entry.correctWinners}</td>
      <td className="px-5 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1 max-w-[80px] bg-gray-800 rounded-full h-1.5">
            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min(entry.hitRate, 100)}%` }} />
          </div>
          <span className="text-xs text-gray-500 w-8 text-right">{entry.hitRate}%</span>
        </div>
      </td>
      <td className="px-5 py-3 text-center text-sm text-gray-500">{entry.totalBets}</td>
    </tr>
  );
}

function MyPositionCard({ entry, position }: { entry: RankingEntry | null; position: number | null }) {
  if (!entry) return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">🎯</div>
      <div>
        <p className="text-sm text-gray-500">Você ainda não tem palpites finalizados.</p>
        <p className="text-xs text-gray-600 mt-0.5">Faça palpites para aparecer no ranking.</p>
      </div>
    </div>
  );
  return (
    <div className="card border-brand-800/60 flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{medalFor(position ?? 0) ?? `${position}º`}</span>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Sua posição</p>
          <p className="text-3xl font-black text-brand-400">{entry.totalPoints} pts</p>
        </div>
      </div>
      <div className="flex gap-6 text-center">
        {[['exactScores','Placar exato'],['correctWinners','Vencedor certo'],['totalBets','Palpites'],['hitRate','Aproveit.']].map(([k, l]) => (
          <div key={k}>
            <p className="text-2xl font-black text-white">{(entry as any)[k]}{k === 'hitRate' ? '%' : ''}</p>
            <p className="text-xs text-gray-500">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [myData, setMyData]   = useState<{ entry: RankingEntry | null; position: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [all, me] = await Promise.all([rankingApi.list(), rankingApi.me()]);
      setRanking(all); setMyData(me); setError('');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">🏆 Ranking</h1>
        <p className="text-gray-500 text-sm mt-1">{ranking.length} participante(s) classificado(s)</p>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {myData && <MyPositionCard entry={myData.entry} position={myData.position} />}

          {ranking.length === 0 ? (
            <EmptyState emoji="🏜️" title="Ranking vazio" description="Finalize partidas para gerar a classificação." />
          ) : (
            <div className="card p-0 overflow-hidden">
              {ranking.length >= 2 && (
                <div className="border-b border-gray-800 bg-gray-900/50 px-6 pb-0">
                  <Podium top3={ranking.slice(0, 3)} />
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-widest">
                      <th className="px-5 py-3 text-center w-12">#</th>
                      <th className="px-5 py-3">Participante</th>
                      <th className="px-5 py-3 text-center">Pts</th>
                      <th className="px-5 py-3 text-center">🎯 Exatos</th>
                      <th className="px-5 py-3 text-center">✅ Vencedor</th>
                      <th className="px-5 py-3 text-center">Aproveit.</th>
                      <th className="px-5 py-3 text-center">Palpites</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {ranking.map(entry => <RankingRow key={entry.userId} entry={entry} isMe={entry.userId === user?.id} />)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card bg-gray-900/40 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>🎯 Placar exato = <strong className="text-white">3 pts</strong></span>
            <span>✅ Vencedor certo = <strong className="text-white">1 pt</strong></span>
            <span>❌ Errou = <strong className="text-white">0 pts</strong></span>
            <span className="ml-auto">Empate desempata por: Exatos → Nome</span>
          </div>
        </>
      )}
    </div>
  );
}