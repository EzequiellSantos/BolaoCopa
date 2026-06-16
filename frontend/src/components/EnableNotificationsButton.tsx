import { useEffect, useState } from 'react';
import {
  isPushSupported,
  getPermissionState,
  isPushEnabled,
  subscribeToPush,
} from '../api/push';
import { getErrorMessage } from '../api/axios';
import { useToast } from '../contexts/ToastContext';

interface Props {
  className?: string;
}

// Botão para o usuário ativar o recebimento de notificações push.
export default function EnableNotificationsButton({ className = '' }: Props) {
  const toast = useToast();
  const [supported] = useState(isPushSupported());
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supported) {
      isPushEnabled().then(setEnabled).catch(() => setEnabled(false));
    }
  }, [supported]);

  if (!supported) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      await subscribeToPush();
      setEnabled(true);
      toast.success('Notificações ativadas! Você receberá os avisos do bolão.');
    } catch (e) {
      toast.error(getErrorMessage(e) || (e instanceof Error ? e.message : 'Não foi possível ativar.'));
    } finally {
      setLoading(false);
    }
  };

  if (enabled) {
    return (
      <span className={`flex items-center gap-2 text-xs text-brand-400 ${className}`}>
        🔔 Notificações ativas
      </span>
    );
  }

  const denied = getPermissionState() === 'denied';

  return (
    <button
      onClick={handleClick}
      disabled={loading || denied}
      title={denied ? 'Permissão bloqueada — habilite nas configurações do navegador' : undefined}
      className={`btn-secondary text-xs px-3 py-1.5 ${className}`}
    >
      {loading ? 'Ativando...' : denied ? '🔕 Bloqueadas' : '🔔 Ativar notificações'}
    </button>
  );
}
