// Telegram Mini App utilities

/**
 * Initialize Telegram WebApp SDK
 * This should only work inside Telegram Mini App
 */
export function initTelegramWebApp() {
  if (typeof window === 'undefined') return null;

  // Check if running in Telegram
  if ((window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp;
    
    // Initialize Telegram WebApp
    tg.ready();
    tg.expand(); // Expand to full height
    
    // Set theme colors to match app
    tg.setHeaderColor('#ffffff');
    tg.setBackgroundColor('#f9fafb');
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    // Enable haptic feedback
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    
    return tg;
  }

  return null;
}

/**
 * Check if app is running inside Telegram
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Telegram?.WebApp;
}

export function openTelegramChat(username?: string, phone?: string) {
  if (!username && !phone) {
    console.error('No username or phone provided for Telegram chat');
    return;
  }

  let link = '';
  if (username) {
    link = `https://t.me/${username}`;
  } else if (phone) {
    link = `tg://resolve?phone=${phone}`;
  }

  if (link) {
    window.open(link, '_blank');
  }
}

export function getTelegramUser() {
  if (typeof window === 'undefined') return null;
  
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }
  
  return null;
}

export function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null;
  
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initData || null;
}
