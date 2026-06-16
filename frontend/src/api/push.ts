import { notificationsApi } from './services';

// Indica se o navegador suporta notificações push.
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Estado atual da permissão de notificação ('default' | 'granted' | 'denied').
export function getPermissionState(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Já existe uma inscrição push ativa para este navegador?
export async function isPushEnabled(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

// Converte a chave VAPID base64url para o Uint8Array exigido pelo PushManager.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Pede permissão, registra a inscrição no PushManager e envia ao backend.
// Lança Error com mensagem amigável em caso de falha.
export async function subscribeToPush(): Promise<void> {
  console.log('[push] subscribeToPush: início', {
    supported: isPushSupported(),
    permission: getPermissionState(),
    swInNavigator: 'serviceWorker' in navigator,
    pushManagerInWindow: 'PushManager' in window,
    notificationInWindow: 'Notification' in window,
    isSecureContext: window.isSecureContext,
  });

  if (!isPushSupported()) {
    console.error('[push] navegador não suporta push (serviceWorker/PushManager/Notification)');
    throw new Error('Seu navegador não suporta notificações push.');
  }

  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
    console.log('[push] Notification.requestPermission ->', permission);
  } catch (e) {
    console.error('[push] erro em Notification.requestPermission', e);
    throw e;
  }
  if (permission !== 'granted') {
    console.error('[push] permissão não concedida:', permission);
    throw new Error(
      'Permissão de notificações negada. Habilite nas configurações do navegador.',
    );
  }

  let publicKey: string;
  try {
    publicKey = await notificationsApi.getVapidKey();
    console.log('[push] getVapidKey ->', publicKey ? `presente (len=${publicKey.length})` : 'ausente/vazio');
  } catch (e) {
    console.error('[push] erro ao buscar VAPID public key no backend', e);
    throw e;
  }
  if (!publicKey) {
    console.error('[push] VAPID public key ausente — backend sem VAPID configurado');
    throw new Error('Notificações não estão configuradas no servidor.');
  }

  let reg: ServiceWorkerRegistration;
  try {
    reg = await navigator.serviceWorker.ready;
    console.log('[push] serviceWorker.ready ok', { scope: reg.scope, active: !!reg.active });
  } catch (e) {
    console.error('[push] erro em navigator.serviceWorker.ready (sw.js não registrado?)', e);
    throw e;
  }

  let subscription = await reg.pushManager.getSubscription();
  console.log('[push] subscription existente?', !!subscription);
  if (!subscription) {
    try {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      console.log('[push] pushManager.subscribe ok', { endpoint: subscription.endpoint });
    } catch (e) {
      console.error('[push] erro em pushManager.subscribe (chave VAPID inválida / applicationServerKey?)', e);
      throw e;
    }
  }

  try {
    await notificationsApi.subscribe(subscription.toJSON());
    console.log('[push] subscription enviada ao backend com sucesso');
  } catch (e) {
    console.error('[push] erro ao enviar subscription ao backend /notifications/subscribe', e);
    throw e;
  }
}

// Cancela a inscrição push atual no navegador e remove do backend.
export async function unsubscribeFromPush(): Promise<void> {
  console.log('[push] unsubscribeFromPush: início');

  if (!isPushSupported()) {
    console.error('[push] navegador não suporta push');
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();

    if (subscription) {
      // Guarda os dados atuais da inscrição para conseguir identificar e remover no backend
      const subscriptionJson = subscription.toJSON();

      // Cancela a inscrição no navegador
      const deactivated = await subscription.unsubscribe();
      console.log('[push] subscription.unsubscribe no navegador ->', deactivated);

    if (deactivated) {
      // 1. Verifica se o endpoint realmente existe
      if (!subscriptionJson.endpoint) {
        throw new Error('Não foi possível localizar o endereço de inscrição para cancelar.');
      }

      // 2. Agora o TypeScript sabe que é 100% uma string
      await notificationsApi.unsubscribe(subscriptionJson.endpoint);
      console.log('[push] inscrição removida do backend com sucesso');
    }
    } else {
      console.log('[push] nenhuma inscrição ativa encontrada para cancelar.');
    }
  } catch (e) {
    console.error('[push] erro ao cancelar a inscrição de notificações', e);
    throw new Error(
      'Não foi possível cancelar as notificações. Tente novamente mais tarde.',
    );
  }
}