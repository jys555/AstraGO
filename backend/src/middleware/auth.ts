import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { UnauthorizedError } from '../utils/errors';
import prisma from '../config/database';

// Telegram Mini App authentication middleware
// Validates initData from Telegram WebApp
export async function authenticateTelegram(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      // For development, allow bypassing auth
      if (process.env.NODE_ENV === 'development' && req.headers['x-dev-user-id']) {
        const devUserId = req.headers['x-dev-user-id'] as string;
        const user = await prisma.user.findUnique({
          where: { telegramId: devUserId },
        });
        
        if (user) {
          (req as any).user = {
            id: user.id,
            telegramId: user.telegramId,
            role: user.role,
            isProfileComplete: user.isProfileComplete,
          };
          return next();
        }
      }
      
      // Log for debugging
      console.warn('Missing Telegram initData', {
        headers: Object.keys(req.headers),
        userAgent: req.headers['user-agent'],
      });
      
      throw new UnauthorizedError('Telegram initData required');
    }

    // Validate Telegram initData
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not set, skipping validation');
      // In development, parse without validation
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const user = await prisma.user.findUnique({
          where: { telegramId: String(userData.id) },
        });
        
        // User must be registered first - don't create automatically
        if (!user) {
          throw new UnauthorizedError('User not registered. Please complete registration first.');
        }
        
        (req as any).user = {
          id: user.id,
          telegramId: user.telegramId,
          role: user.role,
          isProfileComplete: user.isProfileComplete,
        };
        return next();
      }
    } else {
      // Validate hash
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      urlParams.delete('hash');
      
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
      
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
      
      if (calculatedHash !== hash) {
        throw new UnauthorizedError('Invalid Telegram initData');
      }
      
      const userStr = urlParams.get('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const user = await prisma.user.findUnique({
          where: { telegramId: String(userData.id) },
        });
        
        // User must be registered first - don't create automatically
        if (!user) {
          throw new UnauthorizedError('User not registered. Please complete registration first.');
        }
        
        (req as any).user = {
          id: user.id,
          telegramId: user.telegramId,
          role: user.role,
          isProfileComplete: user.isProfileComplete,
        };
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
}
