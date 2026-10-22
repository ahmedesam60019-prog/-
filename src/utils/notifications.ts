import { PomodoroMode } from '../types';

/**
 * SVG data URI icon for Zakirly notifications (graduation cap / focus icon)
 */
const NOTIFICATION_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%234f46e5" stroke="white" stroke-width="1.5"><circle cx="12" cy="12" r="10" fill="%234f46e5"/><path d="M12 6L4 10l8 4 8-4-8-4z" fill="white"/><path d="M7 11.5v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" stroke="white" fill="none"/></svg>`;

/**
 * Check if the browser supports desktop notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request permission from the user for desktop notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return false;
  }
}

/**
 * Sends a native desktop browser notification
 */
export function sendDesktopNotification(options: {
  title: string;
  body: string;
  tag?: string;
}): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      tag: options.tag || 'zakirly-timer',
      dir: 'rtl',
      lang: 'ar',
      requireInteraction: true, // Keep notification visible until user clicks or dismisses
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (e) {
    console.warn('Failed to dispatch desktop notification:', e);
    return null;
  }
}

/**
 * Sends notification specifically when a Pomodoro timer session concludes
 */
export function notifySessionEnd(
  completedMode: PomodoroMode,
  nextMode: PomodoroMode,
  taskTitle?: string
): void {
  let title = '';
  let body = '';

  if (completedMode === 'focus') {
    title = '🎉 انتهت جلسة التركيز بنجاح!';
    body = taskTitle
      ? `أحسنت! أتممت جلسة التركيز لمهمة "${taskTitle}". حان الآن وقت استراحة مستحقة لتجديد طاقتك.`
      : 'أحسنت! أتممت جلسة التركيز بنجاح. خذ استراحة قصيرة لتصفية ذهنك.';
  } else if (completedMode === 'shortBreak') {
    title = '⚡ انتهت الاستراحة القصيرة!';
    body = 'طاقة متجددة! استعد لبدء جلسة التركيز القادمة والمحافظة على وتيرة إنجازك.';
  } else {
    title = '🌟 انتهت الاستراحة المطولة!';
    body = 'أحسنت الاسترخاء. عد الآن إلى مكتب المذاكرة بكامل النشاط والانتباه!';
  }

  sendDesktopNotification({
    title,
    body,
    tag: `zakirly-session-${Date.now()}`,
  });
}
