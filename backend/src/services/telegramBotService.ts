/**
 * Telegram Bot API service for sending notifications
 */

const TELEGRAM_BOT_API_URL = 'https://api.telegram.org/bot';

/**
 * Send message via Telegram Bot API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  const url = `${TELEGRAM_BOT_API_URL}${botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ description: 'Unknown error' })) as { description?: string };
      throw new Error(`Telegram API error: ${error.description || response.statusText}`);
    }

    const result = await response.json() as { ok: boolean; description?: string };
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    throw error;
  }
}
