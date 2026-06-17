import { useEffect, useState } from 'react';
import {
  isPushSupported,
  getPermissionState,
  isPushEnabled,
  subscribeToPush,
  unsubscribeFromPush, // 1. Importa a nova função de cancelamento
} from '../api/push';
import { getErrorMessage } from '../api/axios';
import { useToast } from '../contexts/ToastContext';

interface Props {
  className?: string;
}

export default function EnableNotificationsButton({ className = '' }: Props) {
  const toast = useToast();
  const [supported] = useState(isPushSupported());
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verifica se já está ativo ao carregar a página
  useEffect(() => {
    if (supported) {
      isPushEnabled().then(setEnabled).catch(() => setEnabled(false));
    }
  }, [supported]);

  if (!supported) return null;

  // Função única que gerencia Ativar / Desativar
  const handleToggleNotifications = async () => {
    setLoading(true);
    try {
      if (enabled) {
        // Se já está ativo, desativa
        await unsubscribeFromPush();
        setEnabled(false);
        toast.success('Notificações desativadas com sucesso.');
      } else {
        // Se está inativo, ativa
        await subscribeToPush();
        setEnabled(true);
        toast.success('Notificações ativadas! Você receberá os avisos do bolão.');
      }
    } catch (e) {
      console.error('[push] handleToggleNotifications: falha na operação', e);
      toast.error(
        getErrorMessage(e) || 
        (e instanceof Error ? e.message : 'Não foi possível alterar a configuração.')
      );
    } finally {
      setLoading(false);
    }
  };

  const denied = getPermissionState() === 'denied';

  // Renderização se as notificações estiverem BLOQUEADAS no navegador
  if (denied) {
    return (
      <button
        disabled
        title="Permissão bloqueada — habilite nas configurações do navegador"
        className={`btn-secondary text-xs px-3 py-1.5 opacity-60 cursor-not-allowed ${className}`}
      >
        🔕 Bloqueadas no navegador
      </button>
    );
  }

  // Renderização do botão dinâmico (Ativar / Desativar)
  return (
    <button
      onClick={handleToggleNotifications}
      disabled={loading}
      className={`text-xs px-3 py-1.5 rounded transition-colors ${
        enabled 
          ? `bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 ${className}` 
          : `btn-secondary ${className}`
      }`}
    >
      {loading ? (
        enabled ? 'Desativando...' : 'Ativando...'
      ) : enabled ? (
        '🔔 Notificações ativas (Clique para desativar)'
      ) : (
        '🔔 Ativar notificações'
      )}
    </button>
  );
}