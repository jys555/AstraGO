// Telegram Mini App utilities

export function initTelegramWebApp() {
  if (typeof window === 'undefined') return null;

  // Check if running in Telegram
  if ((window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Set Telegram bot header to black (absolute header from bot settings)
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#000000'); // Qora rang
    }
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor('#f9fafb');
    }
    
    // Apply rounded corners via CSS
    if (typeof document !== 'undefined') {
      document.documentElement.style.borderRadius = '24px 24px 0 0';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.borderRadius = '24px 24px 0 0';
      document.body.style.overflow = 'hidden';
    }
    
    return tg;
  }

  return null;
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
