import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { getDriverRanking } from '../services/driverRankingService';

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
