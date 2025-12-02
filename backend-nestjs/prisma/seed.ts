import { PrismaClient, UserRole, DriverStatus, VehicleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // STEP 1: Create Companies
  // ============================================================================
  console.log('\n📦 Creating companies...');

  const acmeCompany = await prisma.company.upsert({
    where: { email: 'contact@acmeconcierge.com' },
    update: {},
    create: {
      name: 'ACME Concierge Services',
      email: 'contact@acmeconcierge.com',
      phone: '+1-555-0100',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      timezone: 'America/New_York',
      subscriptionTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
      settings: {
        businessHours: {
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '08:00', close: '20:00' },
          sunday: { open: '08:00', close: '20:00' },
        },
        pricingRules: {
          baseFare: 5.0,
          perKm: 1.5,
          perMinute: 0.5,
          surgePricing: true,
          nightSurcharge: 1.5,
        },
      },
    },
  });

  const eliteCompany = await prisma.company.upsert({
    where: { email: 'info@elitetransport.com' },
    update: {},
    create: {
      name: 'Elite Transport Group',
      email: 'info@elitetransport.com',
      phone: '+1-555-0200',
      address: '456 Park Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      timezone: 'America/Los_Angeles',
      subscriptionTier: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
      settings: {
        businessHours: {
          monday: { open: '00:00', close: '23:59' },
          tuesday: { open: '00:00', close: '23:59' },
          wednesday: { open: '00:00', close: '23:59' },
          thursday: { open: '00:00', close: '23:59' },
          friday: { open: '00:00', close: '23:59' },
          saturday: { open: '00:00', close: '23:59' },
          sunday: { open: '00:00', close: '23:59' },
        },
        pricingRules: {
          baseFare: 10.0,
          perKm: 2.5,
          perMinute: 1.0,
          surgePricing: true,
          nightSurcharge: 2.0,
        },
      },
    },
  });

  console.log(`✅ Created ${acmeCompany.name} and ${eliteCompany.name}`);

  // ============================================================================
  // STEP 2: Create Users
  // ============================================================================
  console.log('\n👥 Creating users...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // ACME Users
  const acmeAdmin = await prisma.user.upsert({
    where: { companyId_email: { companyId: acmeCompany.id, email: 'admin@acmeconcierge.com' } },
    update: {},
    create: {
      companyId: acmeCompany.id,
      email: 'admin@acmeconcierge.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Admin',
      phone: '+1-555-0101',
      role: UserRole.COMPANY_ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  const acmeDispatcher = await prisma.user.upsert({
    where: { companyId_email: { companyId: acmeCompany.id, email: 'dispatch@acmeconcierge.com' } },
    update: {},
    create: {
      companyId: acmeCompany.id,
      email: 'dispatch@acmeconcierge.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Dispatcher',
      phone: '+1-555-0102',
      role: UserRole.DISPATCHER,
      isActive: true,
      isVerified: true,
    },
  });

  const acmeDriverUser = await prisma.user.upsert({
    where: { companyId_email: { companyId: acmeCompany.id, email: 'driver1@acmeconcierge.com' } },
    update: {},
    create: {
      companyId: acmeCompany.id,
      email: 'driver1@acmeconcierge.com',
      passwordHash,
      firstName: 'Mike',
      lastName: 'Driver',
      phone: '+1-555-0103',
      role: UserRole.DRIVER,
      isActive: true,
      isVerified: true,
    },
  });

  // Elite Users
  const eliteAdmin = await prisma.user.upsert({
    where: { companyId_email: { companyId: eliteCompany.id, email: 'admin@elitetransport.com' } },
    update: {},
    create: {
      companyId: eliteCompany.id,
      email: 'admin@elitetransport.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Elite',
      phone: '+1-555-0201',
      role: UserRole.COMPANY_ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  console.log(`✅ Created ${4} users`);

  // ============================================================================
  // STEP 3: Create Drivers
  // ============================================================================
  console.log('\n🚗 Creating drivers...');

  const acmeDriver = await prisma.driver.upsert({
    where: { userId: acmeDriverUser.id },
    update: {},
    create: {
      companyId: acmeCompany.id,
      userId: acmeDriverUser.id,
      licenseNumber: 'DL123456789',
      licenseExpiry: new Date('2025-12-31'),
      licenseState: 'NY',
      isVerified: true,
      verifiedAt: new Date(),
      status: DriverStatus.AVAILABLE,
      currentLat: 40.7128,
      currentLng: -74.006,
      lastLocationUpdate: new Date(),
      rating: 4.8,
      totalRides: 0,
      totalEarnings: 0,
      acceptsRides: true,
    },
  });

  console.log(`✅ Created driver: ${acmeDriver.id}`);

  // ============================================================================
  // STEP 4: Create Vehicles
  // ============================================================================
  console.log('\n🚙 Creating vehicles...');

  const vehicle1 = await prisma.vehicle.upsert({
    where: { companyId_licensePlate: { companyId: acmeCompany.id, licensePlate: 'ABC-1234' } },
    update: {},
    create: {
      companyId: acmeCompany.id,
      driverId: acmeDriver.id,
      type: VehicleType.SEDAN,
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      color: 'Black',
      licensePlate: 'ABC-1234',
      vin: '1HGBH41JXMN109186',
      seats: 4,
      wheelchairAccessible: false,
      isActive: true,
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { companyId_licensePlate: { companyId: acmeCompany.id, licensePlate: 'XYZ-5678' } },
    update: {},
    create: {
      companyId: acmeCompany.id,
      type: VehicleType.SUV,
      make: 'Chevrolet',
      model: 'Suburban',
      year: 2023,
      color: 'White',
      licensePlate: 'XYZ-5678',
      vin: '1GNSCJKC8KR123456',
      seats: 7,
      wheelchairAccessible: false,
      isActive: true,
    },
  });

  console.log(`✅ Created ${2} vehicles`);

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Companies: 2`);
  console.log(`   - Users: 4`);
  console.log(`   - Drivers: 1`);
  console.log(`   - Vehicles: 2`);
  console.log('\n🔑 Login Credentials:');
  console.log(`   - ACME Admin: admin@acmeconcierge.com / Password123!`);
  console.log(`   - ACME Dispatcher: dispatch@acmeconcierge.com / Password123!`);
  console.log(`   - ACME Driver: driver1@acmeconcierge.com / Password123!`);
  console.log(`   - Elite Admin: admin@elitetransport.com / Password123!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
