import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { winningsApi } from '../api/services';
import type { WinningsSummary } from '../types';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function WinningsLoginNotice() {
  const { justLoggedIn, clearJustLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<WinningsSummary | null | undefined>(undefined);

  useEffect(() => {
    if (!justLoggedIn) return;

    let cancelled = false;
    winningsApi.me()
      .then(data => { if (!cancelled) setSummary(data.summary); })
      .catch(() => { if (!cancelled) setSummary(null); });

    return () => { cancelled = true; };
  }, [justLoggedIn]);

  if (!justLoggedIn || summary === undefined) return null;

  const positive = (summary?.netProfit ?? 0) >= 0;

  const close = () => {
    clearJustLoggedIn();
    setSummary(undefined);
  };

  const seeDetails = () => {
    close();
    navigate('/ganhos');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 text-center animate-[fadeIn_0.15s_ease-out]">
        {!summary ? (
          <>
            <div className="text-4xl mb-3">💰</div>
            <h2 className="text-lg font-black text-white mb-1">Seu faturamento fictício</h2>
            <p className="text-sm text-gray-500 mb-6">
              Você ainda não tem palpites em partidas finalizadas para simular.
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">{positive ? '📈' : '📉'}</div>
            <h2 className="text-lg font-black text-white mb-1">Seu faturamento fictício</h2>
            <p className="text-xs text-gray-500 mb-4">
              Se cada palpite fosse uma aposta de R$100 nas odds reais da Copa 2026
            </p>
            <p className={`text-4xl font-black mb-4 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatBRL(summary.netProfit)}
            </p>
            <div className="flex justify-center gap-6 mb-6 text-center">
              <div>
                <p className="text-xl font-black text-white">{summary.totalBets}</p>
                <p className="text-xs text-gray-500">Apostas</p>
              </div>
              <div>
                <p className="text-xl font-black text-white">{summary.hits}</p>
                <p className="text-xs text-gray-500">Acertos</p>
              </div>
              <div>
                <p className="text-xl font-black text-white">{summary.hitRate}%</p>
                <p className="text-xs text-gray-500">Aproveit.</p>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button onClick={close} className="btn-secondary flex-1 py-2.5 text-sm">
            Fechar
          </button>
          {summary && (
            <button onClick={seeDetails} className="btn-primary flex-1 py-2.5 text-sm">
              Ver detalhes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
