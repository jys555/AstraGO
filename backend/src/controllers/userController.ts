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
    const user = (req as any).user;
    
    // Validate request body
    const validation = registerUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validation.error.errors,
      });
    }

    const { firstName, lastName, phone, role, carNumber, carModel, carColor } = validation.data;

    // Check if user already completed registration
    if (user.isProfileComplete) {
      return res.status(400).json({
        error: 'User already registered',
      });
    }

    const updateData: any = {
      firstName,
      lastName,
      phone,
      role,
      isProfileComplete: true,
    };

    // Add car fields if driver
    if (role === 'DRIVER' || role === 'BOTH') {
      updateData.carNumber = carNumber;
      updateData.carModel = carModel;
      updateData.carColor = carColor;
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
