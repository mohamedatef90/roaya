import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../../config/redis.js';
import { config } from '../../config/environment.js';
import { logger } from '../../shared/utils/logger.js';
import { emailService } from '../../application/services/email.service.js';
import { prisma } from '../../config/database.js';

// Queue names
const EMAIL_QUEUE = 'email-queue';

// Job types
interface LeadEmailJob {
  type: 'lead_confirmation' | 'admin_notification' | 'roi_results';
  leadId: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string | null;
  company?: string | null;
  source?: string;
  message?: string | null;
  estimatedValue?: number | null;
}

// Create queue
export const emailQueueInstance = new Queue<LeadEmailJob>(EMAIL_QUEUE, {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

// Worker processor
async function processEmailJob(job: Job<LeadEmailJob>): Promise<void> {
  const { data } = job;
  logger.info('Processing email job', { jobId: job.id, type: data.type });

  let success = false;
  let errorMsg: string | null = null;

  try {
    switch (data.type) {
      case 'lead_confirmation':
        success = await emailService.sendLeadConfirmationEmail({
          email: data.email,
          firstName: data.firstName,
        });
        break;

      case 'admin_notification':
        success = await emailService.sendAdminNewLeadNotification({
          id: data.leadId,
          firstName: data.firstName,
          lastName: data.lastName ?? '',
          email: data.email,
          phone: data.phone,
          company: data.company,
          source: data.source ?? 'CONTACT_FORM',
          message: data.message,
        });
        break;

      case 'roi_results':
        success = await emailService.sendROICalculatorResults({
          email: data.email,
          firstName: data.firstName,
          estimatedValue: data.estimatedValue,
        });
        break;
    }

    // Record notification
    await prisma.notification.create({
      data: {
        leadId: data.leadId,
        type: data.type,
        subject: `Email: ${data.type}`,
        body: `Email sent to ${data.email}`,
        recipient: data.email,
        status: success ? 'SENT' : 'FAILED',
        sentAt: success ? new Date() : null,
        errorMsg: success ? null : 'Email delivery failed',
      },
    });

    if (!success) {
      throw new Error('Email delivery failed');
    }

    logger.info('Email job completed', { jobId: job.id, type: data.type });
  } catch (error) {
    errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Email job failed', { jobId: job.id, error: errorMsg });
    throw error;
  }
}

// Create worker
let emailWorker: Worker<LeadEmailJob> | null = null;

export function startEmailWorker(): void {
  emailWorker = new Worker<LeadEmailJob>(EMAIL_QUEUE, processEmailJob, {
    connection: redis as any,
    concurrency: 5,
  });

  emailWorker.on('completed', (job) => {
    logger.debug('Email job completed', { jobId: job.id });
  });

  emailWorker.on('failed', (job, error) => {
    logger.error('Email job failed', { jobId: job?.id, error: error.message });
  });

  logger.info('Email worker started');
}

export async function stopEmailWorker(): Promise<void> {
  if (emailWorker) {
    await emailWorker.close();
    logger.info('Email worker stopped');
  }
}

// Helper functions to add jobs
export const emailQueue = {
  async addLeadConfirmationEmail(lead: {
    id: string;
    email: string;
    firstName: string;
  }): Promise<void> {
    await emailQueueInstance.add('lead_confirmation', {
      type: 'lead_confirmation',
      leadId: lead.id,
      email: lead.email,
      firstName: lead.firstName,
    });
  },

  async addAdminNotificationEmail(lead: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    source: string;
    message?: string | null;
  }): Promise<void> {
    await emailQueueInstance.add('admin_notification', {
      type: 'admin_notification',
      leadId: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      message: lead.message,
    });
  },

  async addROIResultsEmail(lead: {
    id: string;
    email: string;
    firstName: string;
    estimatedValue?: number | null;
  }): Promise<void> {
    if (!lead.estimatedValue) return;

    await emailQueueInstance.add('roi_results', {
      type: 'roi_results',
      leadId: lead.id,
      email: lead.email,
      firstName: lead.firstName,
      estimatedValue: lead.estimatedValue,
    });
  },
};
