import { useEffect, useState } from 'react';
import { rankingApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { RankingEntry } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function medalFor(pos: number) {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return null;
}

function podiumHeight(pos: number) {
  if (pos === 1) return 'h-28';
  if (pos === 2) return 'h-20';
  return 'h-14';
}

// ─── Pódio (top 3) ────────────────────────────────────────────────────────────
function Podium({ top3 }: { top3: RankingEntry[] }) {
  if (top3.length === 0) return null;

  // Ordena visualmente: 2º | 1º | 3º
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-3 pt-6 pb-2">
      {order.map((entry) => (
        <div key={entry.userId} className="flex flex-col items-center gap-2 w-28">
          {/* Nome + emoji */}
          <div className="text-center">
            <p className="text-lg">{medalFor(entry.position)}</p>
            <p className="text-xs font-bold text-white truncate max-w-[7rem] text-center">
              {entry.name.split(' ')[0]}
            </p>
            <p className="text-brand-400 font-black text-lg leading-none">{entry.totalPoints}pts</p>
          </div>

          {/* Coluna do pódio */}
          <div
            className={`w-full ${podiumHeight(entry.position)} rounded-t-lg flex items-center justify-center text-2xl font-black
              ${entry.position === 1
                ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
                : entry.position === 2
                  ? 'bg-gray-400/10 border border-gray-500/30 text-gray-400'
                  : 'bg-amber-700/10 border border-amber-700/30 text-amber-600'
              }`}
          >
            {entry.position}º
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────
interface RowProps { entry: RankingEntry; isMe: boolean; }

function RankingRow({ entry, isMe }: RowProps) {
  return (
    <tr className={`transition-colors ${isMe ? 'bg-brand-600/10 border-l-2 border-brand-500' : 'hover:bg-gray-800/40'}`}>
      <td className="px-5 py-3 text-center">
        {medalFor(entry.position) ?? (
          <span className={`font-bold text-sm ${isMe ? 'text-brand-400' : 'text-gray-500'}`}>
            {entry.position}º
          </span>
        )}
      </td>
      <td className="px-5 py-3">
        <p className={`font-semibold text-sm ${isMe ? 'text-brand-300' : 'text-white'}`}>
          {entry.name}
          {isMe && <span className="ml-2 text-xs text-brand-500 font-normal">(você)</span>}
        </p>
        <p className="text-xs text-gray-600">{entry.email}</p>
      </td>
      <td className="px-5 py-3 text-center">
        <span className={`text-lg font-black ${isMe ? 'text-brand-400' : 'text-white'}`}>
          {entry.totalPoints}
        </span>
      </td>
      <td className="px-5 py-3 text-center text-sm text-gray-400">{entry.exactScores}</td>
      <td className="px-5 py-3 text-center text-sm text-gray-400">{entry.correctWinners}</td>
      <td className="px-5 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1 max-w-[80px] bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(entry.hitRate, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-8 text-right">{entry.hitRate}%</span>
        </div>
      </td>
      <td className="px-5 py-3 text-center text-sm text-gray-500">{entry.totalBets}</td>
    </tr>
  );
}

// ─── Meu card de posição ──────────────────────────────────────────────────────
function MyPositionCard({ entry, position }: { entry: RankingEntry | null; position: number | null }) {
  if (!entry) {
    return (
      <div className="card flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">🎯</div>
        <div>
          <p className="text-sm text-gray-500">Você ainda não tem apostas finalizadas.</p>
          <p className="text-xs text-gray-600 mt-0.5">Faça apostas para aparecer no ranking.</p>
        </div>
      </div>
    );
  }

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
        <div>
          <p className="text-2xl font-black text-white">{entry.exactScores}</p>
          <p className="text-xs text-gray-500">Placar exato</p>
        </div>
        <div>
          <p className="text-2xl font-black text-white">{entry.correctWinners}</p>
          <p className="text-xs text-gray-500">Vencedor certo</p>
        </div>
        <div>
          <p className="text-2xl font-black text-white">{entry.totalBets}</p>
          <p className="text-xs text-gray-500">Apostas</p>
        </div>
        <div>
          <p className="text-2xl font-black text-white">{entry.hitRate}%</p>
          <p className="text-xs text-gray-500">Aproveit.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking]   = useState<RankingEntry[]>([]);
  const [myData,  setMyData]    = useState<{ entry: RankingEntry | null; position: number | null } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [all, me] = await Promise.all([rankingApi.list(), rankingApi.me()]);
        setRanking(all);
        setMyData(me);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top3 = ranking.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">🏆 Ranking</h1>
        <p className="text-gray-500 text-sm mt-1">{ranking.length} participante(s) classificado(s)</p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Minha posição */}
          {myData && (
            <MyPositionCard entry={myData.entry} position={myData.position} />
          )}

          {ranking.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-4xl mb-3">🏜️</p>
              <p className="text-gray-500">Nenhum resultado ainda. Finalize partidas para gerar o ranking.</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              {/* Pódio */}
              {top3.length >= 2 && (
                <div className="border-b border-gray-800 bg-gray-900/50 px-6 pb-0">
                  <Podium top3={top3} />
                </div>
              )}

              {/* Tabela */}
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
                      <th className="px-5 py-3 text-center">Apostas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {ranking.map(entry => (
                      <RankingRow
                        key={entry.userId}
                        entry={entry}
                        isMe={entry.userId === user?.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Legenda de pontuação */}
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