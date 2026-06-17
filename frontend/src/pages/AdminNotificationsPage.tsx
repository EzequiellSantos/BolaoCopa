import { useState } from 'react';
import { notificationsApi } from '../api/services';
import { getErrorMessage } from '../api/axios';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import { useToast } from '../contexts/ToastContext';

export default function AdminNotificationsPage() {
  const toast = useToast();
  const [title, setTitle]     = useState('Bolão Aziladuz');
  const [body, setBody]       = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setError('Preencha o título e a mensagem.');
      return;
    }
    setSending(true); setError('');
    try {
      const res = await notificationsApi.broadcast(title.trim(), body.trim());
      toast.success(`Notificação enviada para ${res.sent} usuário(s).`);
      if (res.failed > 0) toast.warning(`${res.failed} inscrição(ões) falharam ou expiraram.`);
      setBody('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">🔔 Notificações</h1>
        <p className="text-gray-500 text-sm mt-1">
          Envie uma notificação para todos os usuários que ativaram o recebimento.
          A notificação chega mesmo com o app fechado.
        </p>
      </div>

      <div className="card space-y-4 max-w-2xl">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Título</label>
          <input
            className="input"
            value={title}
            maxLength={100}
            onChange={e => setTitle(e.target.value)}
            placeholder="Bolão Copa"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Mensagem</label>
          <textarea
            className="input min-h-[120px] resize-y"
            value={body}
            maxLength={500}
            onChange={e => setBody(e.target.value)}
            placeholder="Ex: As partidas da rodada já estão abertas. Faça seus palpites!"
          />
          <p className="text-xs text-gray-600 mt-1 text-right">{body.length}/500</p>
        </div>

        <button onClick={handleSend} disabled={sending} className="btn-primary w-full">
          {sending
            ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Enviando...</span>
            : 'Enviar notificação'}
        </button>
      </div>
    </div>
  );
}
