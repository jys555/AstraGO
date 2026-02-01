import { Request, Response, NextFunction } from 'express';
import {
  createReservation,
  confirmReservation,
  cancelReservation,
  getActiveReservation,
  checkDriverResponse,
  getMyReservationsAsPassenger,
} from '../services/reservationService';
import { NotFoundError } from '../utils/errors';

export async function createReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { tripId, seatCount = 1 } = req.body;

    const reservation = await createReservation(tripId, user.id, seatCount);

    res.status(201).json({ reservation });
  } catch (error) {
    next(error);
  }
}

export async function getReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const reservation = await getActiveReservation(user.id);

    if (!reservation || reservation.id !== id) {
      throw new NotFoundError('Reservation');
    }

    // Check driver response status
    const driverResponded = await checkDriverResponse(id);

    res.json({
      reservation,
      driverResponded,
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const reservation = await confirmReservation(id, user.id);

    res.json({ reservation });
  } catch (error) {
    next(error);
  }
}

export async function cancelReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const reservation = await cancelReservation(id, user.id);

    res.json({ reservation });
  } catch (error) {
    next(error);
  }
}

export async function getActiveReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    const reservation = await getActiveReservation(user.id);

    if (!reservation) {
      return res.json({ reservation: null });
    }

    const driverResponded = await checkDriverResponse(reservation.id);

    res.json({
      reservation,
      driverResponded,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyReservationsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    const reservations = await getMyReservationsAsPassenger(user.id);

    res.json({ reservations });
  } catch (error) {
    next(error);
  }
}
