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
 * Also checks for Telegram Web environment
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Telegram WebApp SDK
  if ((window as any).Telegram?.WebApp) {
    return true;
  }
  
  // Check for Telegram Web environment (web.telegram.org)
  if (window.location.hostname.includes('web.telegram.org')) {
    return true;
  }
  
  // Check for Telegram Mini App iframe
  if (window.parent !== window && document.referrer.includes('telegram.org')) {
    return true;
  }
  
  return false;
}

export function openTelegramChat(username?: string, phone?: string) {
  if (!username && !phone) {
    console.error('No username or phone provided for Telegram chat');
    return;
  }

  let link = '';
  if (username) {
    // Remove @ if present
    const cleanUsername = username.replace('@', '');
    link = `https://t.me/${cleanUsername}`;
  } else if (phone) {
    link = `tg://resolve?phone=${phone}`;
  }

  if (link) {
    // If in Telegram, use Telegram's openTelegramLink
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(link);
    } else {
      window.open(link, '_blank');
    }
  }
}

/**
 * Open bot by username
 */
export function openBot(botUsername: string) {
  const cleanUsername = botUsername.replace('@', '');
  const link = `https://t.me/${cleanUsername}`;
  
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(link);
  } else {
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
