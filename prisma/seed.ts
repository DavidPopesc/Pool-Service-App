import { addDays, addHours, subDays } from "date-fns";
import { PrismaClient, Role, PoolStatus, JobStatus, WaterLevelStatus } from "@prisma/client";
import { hashPassword } from "../lib/password";
import { generateAlertsForChemicalLog } from "../lib/alerts";

const prisma = new PrismaClient();

async function main() {
  await prisma.alert.deleteMany();
  await prisma.customerMessage.deleteMany();
  await prisma.incidentLog.deleteMany();
  await prisma.chemicalLog.deleteMany();
  await prisma.serviceLog.deleteMany();
  await prisma.jobChecklistItem.deleteMany();
  await prisma.job.deleteMany();
  await prisma.checklistTemplateItem.deleteMany();
  await prisma.checklistTemplate.deleteMany();
  await prisma.equipmentExpense.deleteMany();
  await prisma.report.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: { name: "Pool Cleaners Inc" },
  });

  const passwordHash = hashPassword("demo1234");
  const [john, scylla, alex, maya, diego] = await Promise.all([
    prisma.user.create({ data: { organizationId: org.id, name: "John", email: "john@poolcleaners.test", passwordHash, role: Role.OWNER, phone: "555-1010" } }),
    prisma.user.create({ data: { organizationId: org.id, name: "Scylla", email: "scylla@poolcleaners.test", passwordHash, role: Role.OPERATIONS_MANAGER, phone: "555-2020" } }),
    prisma.user.create({ data: { organizationId: org.id, name: "Alex", email: "alex@poolcleaners.test", passwordHash, role: Role.TECHNICIAN, phone: "555-3030" } }),
    prisma.user.create({ data: { organizationId: org.id, name: "Maya", email: "maya@poolcleaners.test", passwordHash, role: Role.TECHNICIAN, phone: "555-4040" } }),
    prisma.user.create({ data: { organizationId: org.id, name: "Diego", email: "diego@poolcleaners.test", passwordHash, role: Role.TECHNICIAN, phone: "555-5050" } }),
  ]);

  const customers = await Promise.all([
    prisma.customer.create({ data: { organizationId: org.id, name: "Carter Residence", email: "carter@example.com", phone: "555-1111", address: "14 Palm Crest Dr, Miami, FL", notes: "Weekly family pool service." } }),
    prisma.customer.create({ data: { organizationId: org.id, name: "Harbor View HOA", email: "hoa@harborview.test", phone: "555-2222", address: "200 Bayside Blvd, Fort Lauderdale, FL", notes: "Community pool and splash pad." } }),
    prisma.customer.create({ data: { organizationId: org.id, name: "Blue Tide Resort", email: "ops@bluetide.test", phone: "555-3333", address: "88 Ocean Reach Way, Key Largo, FL", notes: "Resort operations team needs inspection-ready records." } }),
    prisma.customer.create({ data: { organizationId: org.id, name: "Sunset Villas", email: "mgr@sunsetvillas.test", phone: "555-4444", address: "52 Sunset Loop, Naples, FL", notes: "Shared hot tub for condo association." } }),
  ]);

  const pools = await Promise.all([
    prisma.pool.create({
      data: {
        organizationId: org.id,
        customerId: customers[0].id,
        name: "Carter Backyard Pool",
        poolType: "Residential pool",
        dimensions: "18x36 ft",
        estimatedVolume: 22000,
        careInstructions: "Focus on leaves near the deep end skimmer. Customer prefers updates after each visit.",
        targetPhMin: 7.2,
        targetPhMax: 7.6,
        targetChlorineMin: 1,
        targetChlorineMax: 3,
        notes: "Variable speed pump installed last quarter.",
        status: PoolStatus.ACTIVE,
      },
    }),
    prisma.pool.create({
      data: {
        organizationId: org.id,
        customerId: customers[1].id,
        name: "Harbor View Community Pool",
        poolType: "Community pool",
        dimensions: "25x50 ft",
        estimatedVolume: 48000,
        careInstructions: "Log deck safety observations and verify gate latch every visit.",
        targetPhMin: 7.2,
        targetPhMax: 7.8,
        targetChlorineMin: 1.5,
        targetChlorineMax: 4,
        notes: "Busy after school hours.",
        status: PoolStatus.ACTIVE,
      },
    }),
    prisma.pool.create({
      data: {
        organizationId: org.id,
        customerId: customers[2].id,
        name: "Blue Tide Main Resort Pool",
        poolType: "Resort pool",
        dimensions: "35x70 ft",
        estimatedVolume: 96000,
        careInstructions: "Check feature fountain strainers and document chemistry for compliance binder.",
        targetPhMin: 7.2,
        targetPhMax: 7.6,
        targetChlorineMin: 2,
        targetChlorineMax: 4,
        notes: "High bather load in the afternoon.",
        status: PoolStatus.ACTIVE,
      },
    }),
    prisma.pool.create({
      data: {
        organizationId: org.id,
        customerId: customers[2].id,
        name: "Blue Tide Splash Zone",
        poolType: "Splash zone",
        dimensions: "20x30 ft",
        estimatedVolume: 12000,
        careInstructions: "Inspect nozzles and surface drains, note any slip hazards.",
        targetPhMin: 7.2,
        targetPhMax: 7.6,
        targetChlorineMin: 2,
        targetChlorineMax: 4,
        notes: "Toddler play zone.",
        status: PoolStatus.ACTIVE,
      },
    }),
    prisma.pool.create({
      data: {
        organizationId: org.id,
        customerId: customers[3].id,
        name: "Sunset Villas Hot Tub",
        poolType: "Hot tub",
        dimensions: "10x10 ft",
        estimatedVolume: 2200,
        careInstructions: "Monitor temperature signs and foam closely.",
        targetPhMin: 7.2,
        targetPhMax: 7.8,
        targetChlorineMin: 3,
        targetChlorineMax: 5,
        notes: "Weekend-heavy usage.",
        status: PoolStatus.ACTIVE,
      },
    }),
  ]);

  const routineTemplate = await prisma.checklistTemplate.create({
    data: {
      organizationId: org.id,
      name: "Routine pool visit",
      description: "Standard field workflow for weekly service visits.",
      items: {
        create: [
          { label: "Inspect skimmer and pump baskets", sortOrder: 1, required: true },
          { label: "Brush walls and steps", sortOrder: 2, required: true },
          { label: "Vacuum visible debris", sortOrder: 3, required: true },
          { label: "Verify water level", sortOrder: 4, required: true },
          { label: "Confirm gate and deck safety", sortOrder: 5, required: true },
        ],
      },
    },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  const complianceTemplate = await prisma.checklistTemplate.create({
    data: {
      organizationId: org.id,
      name: "Resort compliance sweep",
      description: "Extra logging for resort inspections and incident readiness.",
      items: {
        create: [
          { label: "Photograph control panel and feed system", sortOrder: 1, required: true },
          { label: "Record chemistry in compliance binder", sortOrder: 2, required: true },
          { label: "Verify signage and rescue equipment", sortOrder: 3, required: true },
        ],
      },
    },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  const now = new Date();
  const historicalJob1 = await prisma.job.create({
    data: {
      organizationId: org.id,
      poolId: pools[2].id,
      technicianId: alex.id,
      createdById: john.id,
      title: "Main resort weekly compliance visit",
      scheduledStart: subDays(addHours(now, 8), 7),
      scheduledEnd: subDays(addHours(now, 10), 7),
      routeOrder: 1,
      status: JobStatus.COMPLETED,
      completedAt: subDays(addHours(now, 10), 7),
      notes: "Prepare records for county inspection.",
    },
  });

  const historicalJob2 = await prisma.job.create({
    data: {
      organizationId: org.id,
      poolId: pools[1].id,
      technicianId: maya.id,
      createdById: john.id,
      title: "HOA weekend reset",
      scheduledStart: subDays(addHours(now, 9), 3),
      scheduledEnd: subDays(addHours(now, 11), 3),
      routeOrder: 2,
      status: JobStatus.COMPLETED,
      completedAt: subDays(addHours(now, 11), 3),
      notes: "Heavy debris after windstorm.",
    },
  });

  const todayJobs = await Promise.all([
    prisma.job.create({
      data: {
        organizationId: org.id,
        poolId: pools[0].id,
        technicianId: alex.id,
        createdById: john.id,
        title: "Weekly residential service",
        scheduledStart: addHours(new Date(new Date().setHours(9, 0, 0, 0)), 0),
        scheduledEnd: addHours(new Date(new Date().setHours(10, 0, 0, 0)), 0),
        routeOrder: 1,
        notes: "Customer wants text summary after visit.",
      },
    }),
    prisma.job.create({
      data: {
        organizationId: org.id,
        poolId: pools[2].id,
        technicianId: maya.id,
        createdById: john.id,
        title: "Resort pool morning chemistry check",
        scheduledStart: addHours(new Date(new Date().setHours(11, 0, 0, 0)), 0),
        scheduledEnd: addHours(new Date(new Date().setHours(12, 30, 0, 0)), 0),
        routeOrder: 2,
        notes: "Ops team expects report before 2 PM.",
      },
    }),
    prisma.job.create({
      data: {
        organizationId: org.id,
        poolId: pools[4].id,
        technicianId: diego.id,
        createdById: john.id,
        title: "Hot tub sanitizer check",
        scheduledStart: addHours(new Date(new Date().setHours(13, 0, 0, 0)), 0),
        scheduledEnd: addHours(new Date(new Date().setHours(14, 0, 0, 0)), 0),
        routeOrder: 3,
        notes: "Watch for foam and guest complaints.",
      },
    }),
  ]);

  const upcomingJobs = await Promise.all([
    prisma.job.create({
      data: {
        organizationId: org.id,
        poolId: pools[3].id,
        technicianId: alex.id,
        createdById: john.id,
        title: "Splash zone filter inspection",
        scheduledStart: addDays(addHours(new Date(new Date().setHours(10, 0, 0, 0)), 0), 1),
        scheduledEnd: addDays(addHours(new Date(new Date().setHours(11, 30, 0, 0)), 0), 1),
        routeOrder: 1,
        notes: "Audit nozzle flow and safety surfacing.",
      },
    }),
    prisma.job.create({
      data: {
        organizationId: org.id,
        poolId: pools[1].id,
        technicianId: maya.id,
        createdById: john.id,
        title: "Community pool weekly visit",
        scheduledStart: addDays(addHours(new Date(new Date().setHours(8, 30, 0, 0)), 0), 2),
        scheduledEnd: addDays(addHours(new Date(new Date().setHours(10, 0, 0, 0)), 0), 2),
        routeOrder: 1,
        notes: "Confirm gate latch logs.",
      },
    }),
  ]);

  for (const job of [historicalJob1, historicalJob2, ...todayJobs, ...upcomingJobs]) {
    const template = job.poolId === pools[2].id || job.poolId === pools[3].id ? complianceTemplate : routineTemplate;
    await prisma.jobChecklistItem.createMany({
      data: template.items.map((item) => ({
        jobId: job.id,
        templateItemId: item.id,
        label: item.label,
        sortOrder: item.sortOrder,
        required: item.required,
        completed: job.status === JobStatus.COMPLETED,
        completedAt: job.status === JobStatus.COMPLETED ? job.completedAt : null,
        completedById: job.technicianId,
      })),
    });
  }

  await prisma.serviceLog.create({
    data: {
      organizationId: org.id,
      jobId: historicalJob1.id,
      poolId: pools[2].id,
      technicianId: alex.id,
      summary: "Completed resort chemistry sweep and cleaned strainer baskets.",
      observations: "Fountain strainer had minor debris. Deck drains clear. Chemistry documented for inspection binder.",
      waterLevelStatus: WaterLevelStatus.NORMAL,
      submittedAt: subDays(addHours(now, 10), 7),
    },
  });

  await prisma.serviceLog.create({
    data: {
      organizationId: org.id,
      jobId: historicalJob2.id,
      poolId: pools[1].id,
      technicianId: maya.id,
      summary: "Recovered community pool after storm debris.",
      observations: "Removed palm fronds and vacuumed fine sediment near stairs.",
      waterLevelStatus: WaterLevelStatus.LOW,
      submittedAt: subDays(addHours(now, 11), 3),
    },
  });

  const chem1 = await prisma.chemicalLog.create({
    data: {
      organizationId: org.id,
      poolId: pools[2].id,
      jobId: historicalJob1.id,
      technicianId: alex.id,
      chemicalType: "Liquid chlorine",
      dosageAmount: 8,
      dosageUnit: "gal",
      costPerUnit: 6.4,
      phReading: 7.5,
      chlorineReading: 2.8,
      alkalinityReading: 105,
      notes: "Balanced after morning guest load.",
      loggedAt: subDays(addHours(now, 9), 7),
    },
  });

  const chem2 = await prisma.chemicalLog.create({
    data: {
      organizationId: org.id,
      poolId: pools[1].id,
      jobId: historicalJob2.id,
      technicianId: maya.id,
      chemicalType: "Muriatic acid",
      dosageAmount: 2.5,
      dosageUnit: "gal",
      costPerUnit: 7.2,
      phReading: 7.9,
      chlorineReading: 1.4,
      alkalinityReading: 95,
      notes: "Post-storm correction.",
      loggedAt: subDays(addHours(now, 10), 3),
    },
  });

  const chem3 = await prisma.chemicalLog.create({
    data: {
      organizationId: org.id,
      poolId: pools[4].id,
      technicianId: diego.id,
      chemicalType: "Granular chlorine",
      dosageAmount: 4,
      dosageUnit: "lb",
      costPerUnit: 5.8,
      phReading: 7.1,
      chlorineReading: 5.8,
      alkalinityReading: 120,
      notes: "Generated alert for out-of-range hot tub reading.",
      loggedAt: subDays(addHours(now, 15), 1),
    },
  });

  await generateAlertsForChemicalLog(prisma, chem1.id);
  await generateAlertsForChemicalLog(prisma, chem2.id);
  await generateAlertsForChemicalLog(prisma, chem3.id);

  await prisma.incidentLog.create({
    data: {
      organizationId: org.id,
      poolId: pools[2].id,
      jobId: historicalJob1.id,
      technicianId: alex.id,
      title: "Loose fountain access panel",
      details: "Panel fastener was backing out on the decorative fountain housing. Tightened temporarily and flagged for maintenance.",
      severity: "Medium",
      createdAt: subDays(addHours(now, 10), 7),
    },
  });

  await prisma.incidentLog.create({
    data: {
      organizationId: org.id,
      poolId: pools[1].id,
      jobId: historicalJob2.id,
      technicianId: maya.id,
      title: "Debris overload after storm",
      details: "Skimmer baskets full and deck covered with leaf litter. Added extra vacuum time.",
      severity: "Low",
      createdAt: subDays(addHours(now, 10), 3),
    },
  });

  await prisma.customerMessage.create({
    data: {
      organizationId: org.id,
      customerId: customers[0].id,
      jobId: historicalJob2.id,
      createdById: john.id,
      subject: "Weekly service update",
      body: "Your pool was serviced and chemistry was corrected after debris cleanup.",
      status: "SENT",
      sentAt: subDays(now, 3),
      createdAt: subDays(now, 3),
    },
  });

  await prisma.equipmentExpense.createMany({
    data: [
      { organizationId: org.id, category: "Filter media", description: "Resort DE top-up", amount: 220, incurredAt: subDays(now, 12) },
      { organizationId: org.id, category: "Pump parts", description: "Replacement basket for Carter residence", amount: 68, incurredAt: subDays(now, 8) },
      { organizationId: org.id, category: "Safety", description: "New rescue hook for Blue Tide", amount: 145, incurredAt: subDays(now, 5) },
    ],
  });

  console.log("Seed complete with demo users:");
  console.log("john@poolcleaners.test / demo1234");
  console.log("scylla@poolcleaners.test / demo1234");
  console.log("alex@poolcleaners.test / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
