// Telegram Mini App utilities

export function initTelegramWebApp() {
  if (typeof window === 'undefined') return null;

  // Check if running in Telegram
  if ((window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp;
    try {
      if (tg.ready) {
        tg.ready();
      }
      
      // Set Telegram bot header to black (absolute header from bot settings)
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#000000');
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#0B1220');
      }
      if (tg.setBottomBarColor) {
        tg.setBottomBarColor('#000000');
      }
    } catch (error) {
      console.warn('Telegram WebApp init error:', error);
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
