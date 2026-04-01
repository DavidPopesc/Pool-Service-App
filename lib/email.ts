import nodemailer from "nodemailer";
import { MessageStatus } from "@prisma/client";
import { db } from "@/lib/db";

type CustomerEmailInput = {
  organizationId: string;
  customerId: string;
  jobId?: string;
  createdById: string;
  to?: string | null;
  subject: string;
  body: string;
};

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

export async function sendOrQueueCustomerEmail(input: CustomerEmailInput) {
  const baseRecord = await db.customerMessage.create({
    data: {
      organizationId: input.organizationId,
      customerId: input.customerId,
      jobId: input.jobId,
      createdById: input.createdById,
      subject: input.subject,
      body: input.body,
      status: MessageStatus.PENDING,
    },
  });

  if (!hasSmtpConfig() || !input.to) {
    console.log("Customer update email fallback", {
      to: input.to,
      subject: input.subject,
      body: input.body,
    });
    return baseRecord;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      text: input.body,
    });

    return db.customerMessage.update({
      where: { id: baseRecord.id },
      data: { status: MessageStatus.SENT, sentAt: new Date() },
    });
  } catch (error) {
    console.error("Failed to send SMTP email, left queued in database.", error);
    return db.customerMessage.update({
      where: { id: baseRecord.id },
      data: { status: MessageStatus.FAILED },
    });
  }
}
