// Telegram service for generating deep links and handling Telegram-specific features

export function generateChatDeepLink(username?: string, phone?: string): string {
  if (username) {
    return `https://t.me/${username}`;
  }
  if (phone) {
    return `tg://resolve?phone=${phone}`;
  }
  return '';
}

export function generateTelegramLink(type: 'user' | 'chat', identifier: string): string {
  if (type === 'user') {
    return `tg://resolve?domain=${identifier}`;
  }
  return `https://t.me/${identifier}`;
}
