import { AlertType, Prisma, PrismaClient } from "@prisma/client";

export async function generateAlertsForChemicalLog(
  prisma: PrismaClient | Prisma.TransactionClient,
  chemicalLogId: string,
) {
  const chemicalLog = await prisma.chemicalLog.findUnique({
    where: { id: chemicalLogId },
    include: { pool: true },
  });

  if (!chemicalLog) return [];

  const alerts: Prisma.AlertCreateManyInput[] = [];

  if (chemicalLog.phReading != null) {
    if (chemicalLog.phReading > chemicalLog.pool.targetPhMax) {
      alerts.push({
        organizationId: chemicalLog.organizationId,
        poolId: chemicalLog.poolId,
        chemicalLogId: chemicalLog.id,
        type: AlertType.PH_HIGH,
        message: `pH ${chemicalLog.phReading} exceeds max ${chemicalLog.pool.targetPhMax} for ${chemicalLog.pool.name}.`,
      });
    }
    if (chemicalLog.phReading < chemicalLog.pool.targetPhMin) {
      alerts.push({
        organizationId: chemicalLog.organizationId,
        poolId: chemicalLog.poolId,
        chemicalLogId: chemicalLog.id,
        type: AlertType.PH_LOW,
        message: `pH ${chemicalLog.phReading} is below min ${chemicalLog.pool.targetPhMin} for ${chemicalLog.pool.name}.`,
      });
    }
  }

  if (chemicalLog.chlorineReading != null && chemicalLog.pool.targetChlorineMax != null) {
    if (chemicalLog.chlorineReading > chemicalLog.pool.targetChlorineMax) {
      alerts.push({
        organizationId: chemicalLog.organizationId,
        poolId: chemicalLog.poolId,
        chemicalLogId: chemicalLog.id,
        type: AlertType.CHLORINE_HIGH,
        message: `Chlorine ${chemicalLog.chlorineReading} exceeds max ${chemicalLog.pool.targetChlorineMax} for ${chemicalLog.pool.name}.`,
      });
    }
  }

  if (chemicalLog.chlorineReading != null && chemicalLog.pool.targetChlorineMin != null) {
    if (chemicalLog.chlorineReading < chemicalLog.pool.targetChlorineMin) {
      alerts.push({
        organizationId: chemicalLog.organizationId,
        poolId: chemicalLog.poolId,
        chemicalLogId: chemicalLog.id,
        type: AlertType.CHLORINE_LOW,
        message: `Chlorine ${chemicalLog.chlorineReading} is below min ${chemicalLog.pool.targetChlorineMin} for ${chemicalLog.pool.name}.`,
      });
    }
  }

  if (alerts.length > 0) {
    await prisma.alert.createMany({ data: alerts });
  }

  return alerts;
}
