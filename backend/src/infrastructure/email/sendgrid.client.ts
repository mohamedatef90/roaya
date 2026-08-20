import sgMail from '@sendgrid/mail';
import { config } from '../../config/environment.js';
import { logger } from '../../shared/utils/logger.js';

// Initialize SendGrid
if (config.email.sendgridApiKey) {
  sgMail.setApiKey(config.email.sendgridApiKey);
  logger.info('SendGrid client initialized');
} else {
  logger.warn('SendGrid API key not configured - emails will be logged only');
}

interface SendGridMessage {
  to: string;
  from: {
    email: string;
    name: string;
  };
  subject: string;
  html: string;
  text: string;
}

class SendGridClient {
  async send(message: SendGridMessage): Promise<void> {
    if (!config.email.sendgridApiKey) {
      // Log email in development mode when no API key
      logger.info('Email would be sent (no API key configured)', {
        to: message.to,
        subject: message.subject,
        from: message.from.email,
      });
      return;
    }

    try {
      await sgMail.send({
        to: message.to,
        from: message.from,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
    } catch (error) {
      logger.error('SendGrid error', { error });
      throw error;
    }
  }

  async sendMultiple(messages: SendGridMessage[]): Promise<void> {
    if (!config.email.sendgridApiKey) {
      logger.info('Multiple emails would be sent (no API key configured)', {
        count: messages.length,
      });
      return;
    }

    try {
      await sgMail.send(messages);
    } catch (error) {
      logger.error('SendGrid batch error', { error });
      throw error;
    }
  }
}

export const sendgridClient = new SendGridClient();
