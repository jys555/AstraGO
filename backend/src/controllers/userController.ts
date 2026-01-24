import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { getDriverRanking } from '../services/driverRankingService';
import { registerUserSchema } from '../utils/validators';

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

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get Telegram user data from initData (not from authenticated user)
    const initData = req.headers['x-telegram-init-data'] as string;
    if (!initData) {
      return res.status(401).json({
        error: 'Telegram initData required',
      });
    }

    // Parse Telegram user data
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let telegramUserId: string | null = null;
    let telegramUsername: string | null = null;

    if (botToken) {
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
        return res.status(401).json({
          error: 'Invalid Telegram initData',
        });
      }

      const userStr = urlParams.get('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        telegramUserId = String(userData.id);
        telegramUsername = userData.username || null;
      }
    } else {
      // Development mode - parse without validation
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        telegramUserId = String(userData.id);
        telegramUsername = userData.username || null;
      }
    }

    if (!telegramUserId) {
      return res.status(401).json({
        error: 'Telegram user data not found',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: telegramUserId },
    });

    if (existingUser) {
      if (existingUser.isProfileComplete) {
        return res.status(400).json({
          error: 'User already registered',
        });
      }
      // Update existing incomplete user
      const validation = registerUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation error',
          details: validation.error.errors,
        });
      }

      const { firstName, lastName, phone, role, carNumber, carModel, carColor } = validation.data;

      const updateData: any = {
        firstName,
        lastName,
        phone,
        role,
        isProfileComplete: true,
      };

      if (role === 'DRIVER' || role === 'BOTH') {
        updateData.carNumber = carNumber;
        updateData.carModel = carModel;
        updateData.carColor = carColor;
      }

      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
        include: {
          driverMetrics: true,
        },
      });

      return res.json({ user: updated });
    }

    // Create new user
    const validation = registerUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validation.error.errors,
      });
    }

    const { firstName, lastName, phone, role, carNumber, carModel, carColor } = validation.data;

    const createData: any = {
      telegramId: telegramUserId,
      username: telegramUsername,
      firstName,
      lastName,
      phone,
      role,
      isProfileComplete: true,
    };

    if (role === 'DRIVER' || role === 'BOTH') {
      createData.carNumber = carNumber;
      createData.carModel = carModel;
      createData.carColor = carColor;
    }

    const newUser = await prisma.user.create({
      data: createData,
      include: {
        driverMetrics: true,
      },
    });

    res.status(201).json({ user: newUser });
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
    const { firstName, lastName, phone, role, onlineStatus, carNumber, carModel, carColor } = req.body;

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (carNumber !== undefined) updateData.carNumber = carNumber;
    if (carModel !== undefined) updateData.carModel = carModel;
    if (carColor !== undefined) updateData.carColor = carColor;
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
