import { useEffect, useState } from 'react';
import { winningsApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import type { WinningsSummary, WinningsDetail, WinningsMatchBreakdown } from '../types';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function directionLabel(dir: 'home' | 'draw' | 'away', homeTeam: string, awayTeam: string) {
  if (dir === 'home') return homeTeam;
  if (dir === 'away') return awayTeam;
  return 'Empate';
}

function betDirection(m: WinningsMatchBreakdown): 'home' | 'draw' | 'away' {
  if (m.betHomeScore > m.betAwayScore) return 'home';
  if (m.betHomeScore < m.betAwayScore) return 'away';
  return 'draw';
}

function MyWinningsCard({ summary }: { summary: WinningsSummary | null }) {
  if (!summary) return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">💰</div>
      <div>
        <p className="text-sm text-gray-500">Você ainda não tem palpites em partidas finalizadas.</p>
        <p className="text-xs text-gray-600 mt-0.5">Faça palpites para ver sua simulação de ganhos.</p>
      </div>
    </div>
  );

  const positive = summary.netProfit >= 0;

  return (
    <div className="card border-brand-800/60 flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{positive ? '📈' : '📉'}</span>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Seu saldo simulado</p>
          <p className={`text-3xl font-black ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatBRL(summary.netProfit)}
          </p>
        </div>
      </div>
      <div className="flex gap-6 text-center">
        <div>
          <p className="text-2xl font-black text-white">{summary.totalBets}</p>
          <p className="text-xs text-gray-500">Apostas simuladas</p>
        </div>
        <div>
          <p className="text-2xl font-black text-white">{summary.hits}</p>
          <p className="text-xs text-gray-500">Acertos</p>
        </div>
        <div>
          <p className="text-2xl font-black text-white">{summary.hitRate}%</p>
          <p className="text-xs text-gray-500">Aproveit.</p>
        </div>
        <div>
          <p className="text-2xl font-black text-white">{formatBRL(summary.totalStaked)}</p>
          <p className="text-xs text-gray-500">Total apostado</p>
        </div>
      </div>
    </div>
  );
}

function MatchBreakdownRow({ m }: { m: WinningsMatchBreakdown }) {
  const dir = betDirection(m);
  return (
    <tr className="hover:bg-gray-800/40">
      <td className="px-5 py-3">
        <p className="text-sm font-semibold text-white">{m.homeTeam} {m.homeScore} x {m.awayScore} {m.awayTeam}</p>
        <p className="text-xs text-gray-600">{m.description}</p>
      </td>
      <td className="px-5 py-3 text-center text-sm text-gray-400">{m.betHomeScore} x {m.betAwayScore}</td>
      <td className="px-5 py-3 text-center text-sm text-gray-400">{directionLabel(dir, m.homeTeam, m.awayTeam)}</td>
      <td className="px-5 py-3 text-center text-sm text-gray-500">{m.odd.toFixed(2)}</td>
      <td className="px-5 py-3 text-center">
        {m.hit ? <span className="text-emerald-400">✅</span> : <span className="text-red-400">❌</span>}
      </td>
      <td className="px-5 py-3 text-center">
        <span className={`font-bold text-sm ${m.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatBRL(m.profit)}
        </span>
      </td>
    </tr>
  );
}

export default function WinningsPage() {
  const [myData, setMyData] = useState<WinningsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const me = await winningsApi.me();
      setMyData(me); setError('');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">💰 Meus Ganhos por Odds</h1>
        <p className="text-gray-500 text-sm mt-1">
          Simulação: se cada palpite seu fosse uma aposta de R$100 nas odds reais de cada partida, quanto você teria ganhado ou perdido?
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {myData && <MyWinningsCard summary={myData.summary} />}

          {myData && myData.matches.length === 0 && (
            <EmptyState emoji="🏜️" title="Nada por aqui ainda" description="Assim que você tiver palpites em partidas finalizadas, sua simulação aparece aqui." />
          )}

          {myData && myData.matches.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Seu detalhamento partida a partida</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-widest">
                      <th className="px-5 py-3">Partida</th>
                      <th className="px-5 py-3 text-center">Seu palpite</th>
                      <th className="px-5 py-3 text-center">Você apostou em</th>
                      <th className="px-5 py-3 text-center">Odd</th>
                      <th className="px-5 py-3 text-center">Acertou?</th>
                      <th className="px-5 py-3 text-center">Ganho/Perda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {myData.matches.map(m => <MatchBreakdownRow key={m.matchId} m={m} />)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card bg-gray-900/40 text-xs text-gray-500 space-y-1">
            <p>💰 Cada palpite simula uma aposta de <strong className="text-white">R$100</strong>.</p>
            <p>📊 As odds das 104 partidas são <strong className="text-white">odds reais de mercado</strong> (bet365, FanDuel, Pinnacle e outras casas) praticadas antes de cada jogo da Copa 2026.</p>
            <p>✅ Considera-se acerto quando o palpite bate a <strong className="text-white">direção</strong> do resultado (vitória do mandante, empate ou vitória do visitante) — não é necessário acertar o placar exato.</p>
          </div>
        </>
      )}
    </div>
  );
}
