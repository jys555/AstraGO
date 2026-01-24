import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import prisma from '../config/database';
import { getDriverRanking } from '../services/driverRankingService';
import { UnauthorizedError } from '../utils/errors';

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        driverMetrics: true,
      },
    });

    res.json({ user: fullUser });
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { firstName, lastName, phone, role, onlineStatus } = req.body;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (onlineStatus !== undefined) {
      updateData.onlineStatus = onlineStatus;
      updateData.lastSeen = new Date();
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: {
        driverMetrics: true,
      },
    });

    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
}

export async function getDriverMetrics(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const metrics = await getDriverRanking(id);

    if (!metrics) {
      return res.status(404).json({ error: 'Driver metrics not found' });
    }

    res.json({ metrics });
  } catch (error) {
    next(error);
  }
}

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      throw new UnauthorizedError('Telegram initData required');
    }

    // Validate Telegram initData
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let userData: any = null;

    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not set, skipping validation');
      // In development, parse without validation
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      if (userStr) {
        userData = JSON.parse(userStr);
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
        userData = JSON.parse(userStr);
      }
    }

    if (!userData || !userData.id) {
      throw new UnauthorizedError('Invalid user data in initData');
    }

    const { firstName, lastName, phone, role, carNumber, carModel, carColor } = req.body;

    // Validate required fields
    if (!firstName || !phone) {
      return res.status(400).json({ error: { message: 'FirstName and phone are required' } });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: String(userData.id) },
    });

    if (existingUser) {
      // Update existing user
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName,
          lastName: lastName || null,
          phone,
          role: role || 'PASSENGER',
          username: userData.username || null,
          carNumber: (role === 'DRIVER' || role === 'BOTH') ? carNumber : null,
          carModel: (role === 'DRIVER' || role === 'BOTH') ? carModel : null,
          carColor: (role === 'DRIVER' || role === 'BOTH') ? carColor : null,
        },
        include: {
          driverMetrics: true,
        },
      });

      return res.json({ user: updated });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        telegramId: String(userData.id),
        firstName,
        lastName: lastName || null,
        phone,
        role: role || 'PASSENGER',
        username: userData.username || null,
        carNumber: (role === 'DRIVER' || role === 'BOTH') ? carNumber : null,
        carModel: (role === 'DRIVER' || role === 'BOTH') ? carModel : null,
        carColor: (role === 'DRIVER' || role === 'BOTH') ? carColor : null,
      },
      include: {
        driverMetrics: true,
      },
    });

    res.json({ user: newUser });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: { message: error.message } });
    }
    next(error);
  }
}
