import { PoolStatus, WaterLevelStatus } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(5),
  notes: z.string().optional(),
});

export const poolSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(2),
  poolType: z.string().min(2),
  dimensions: z.string().min(2),
  estimatedVolume: z.coerce.number().int().positive(),
  careInstructions: z.string().min(10),
  targetPhMin: z.coerce.number().min(0).max(14),
  targetPhMax: z.coerce.number().min(0).max(14),
  targetChlorineMin: z.union([z.coerce.number().min(0), z.nan()]).optional(),
  targetChlorineMax: z.union([z.coerce.number().min(0), z.nan()]).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(PoolStatus),
});

export const jobSchema = z.object({
  poolId: z.string().min(1),
  technicianId: z.string().optional(),
  title: z.string().min(2),
  scheduledStart: z.string().min(1),
  scheduledEnd: z.string().min(1),
  routeOrder: z.coerce.number().int().positive().optional(),
  notes: z.string().optional(),
  checklistTemplateId: z.string().optional(),
});

export const checklistTemplateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  items: z.array(z.object({
    label: z.string().min(2),
    required: z.boolean().default(true),
  })).min(1),
});

export const serviceLogSchema = z.object({
  summary: z.string().min(5),
  observations: z.string().min(5),
  waterLevelStatus: z.nativeEnum(WaterLevelStatus),
});

export const chemicalLogSchema = z.object({
  chemicalType: z.string().min(2),
  dosageAmount: z.coerce.number().positive(),
  dosageUnit: z.string().min(1),
  costPerUnit: z.coerce.number().min(0),
  phReading: z.union([z.coerce.number().min(0).max(14), z.nan()]).optional(),
  chlorineReading: z.union([z.coerce.number().min(0), z.nan()]).optional(),
  alkalinityReading: z.union([z.coerce.number().min(0), z.nan()]).optional(),
  notes: z.string().optional(),
});

export const incidentSchema = z.object({
  title: z.string().min(2),
  details: z.string().min(5),
  severity: z.string().min(2),
});

export const customerUpdateSchema = z.object({
  subject: z.string().min(3),
  body: z.string().min(10),
});
