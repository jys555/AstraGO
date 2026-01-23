import { PrismaClient, UserRole, PickupType, DeliveryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const driver1 = await prisma.user.upsert({
    where: { telegramId: '123456789' },
    update: {},
    create: {
      telegramId: '123456789',
      firstName: 'John',
      lastName: 'Driver',
      username: 'johndriver',
      phone: '+1234567890',
      role: UserRole.DRIVER,
      onlineStatus: true,
    },
  });

  const driver2 = await prisma.user.upsert({
    where: { telegramId: '987654321' },
    update: {},
    create: {
      telegramId: '987654321',
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      phone: '+0987654321',
      role: UserRole.DRIVER,
      onlineStatus: false,
    },
  });

  const passenger1 = await prisma.user.upsert({
    where: { telegramId: '111222333' },
    update: {},
    create: {
      telegramId: '111222333',
      firstName: 'Alice',
      lastName: 'Passenger',
      username: 'alicepass',
      role: UserRole.PASSENGER,
      onlineStatus: true,
    },
  });

  // Create driver metrics
  await prisma.driverMetrics.upsert({
    where: { driverId: driver1.id },
    update: {},
    create: {
      driverId: driver1.id,
      avgResponseTime: 45, // 45 seconds
      responseRate: 95,
      totalTrips: 50,
      totalReservations: 100,
      confirmedReservations: 95,
      rankingScore: 85.5,
    },
  });

  await prisma.driverMetrics.upsert({
    where: { driverId: driver2.id },
    update: {},
    create: {
      driverId: driver2.id,
      avgResponseTime: 120, // 2 minutes
      responseRate: 75,
      totalTrips: 20,
      totalReservations: 40,
      confirmedReservations: 30,
      rankingScore: 65.2,
    },
  });

  // Create sample trips
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(14, 30, 0, 0);

  const trip1 = await prisma.trip.create({
    data: {
      driverId: driver1.id,
      routeFrom: 'New York',
      routeTo: 'Boston',
      departureWindowStart: tomorrow,
      departureWindowEnd: tomorrowEnd,
      vehicleType: 'Sedan',
      totalSeats: 4,
      availableSeats: 2,
      pickupType: PickupType.HOME_PICKUP,
      deliveryType: DeliveryType.PASSENGER_ONLY,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      driverId: driver2.id,
      routeFrom: 'Los Angeles',
      routeTo: 'San Francisco',
      departureWindowStart: tomorrow,
      departureWindowEnd: tomorrowEnd,
      vehicleType: 'SUV',
      totalSeats: 6,
      availableSeats: 4,
      pickupType: PickupType.STATION_ONLY,
      deliveryType: DeliveryType.CARGO_ACCEPTED,
    },
  });

  // Create seat availability records
  await prisma.seatAvailability.create({
    data: {
      tripId: trip1.id,
      reservedSeats: 2,
      availableSeats: 2,
    },
  });

  await prisma.seatAvailability.create({
    data: {
      tripId: trip2.id,
      reservedSeats: 2,
      availableSeats: 4,
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
