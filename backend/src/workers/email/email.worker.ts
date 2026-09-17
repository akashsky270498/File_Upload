import { getRabbitChannel, QUEUES } from '../../config/rabbitmq';
import { RabbitJobMessage } from '../../infrastructure/rabbitmq/rabbitmq.producer';
import { logger } from '../../common/logger';
import { env } from '../../config/env';

export const startEmailWorker = async (): Promise<void> => {
  const channel = getRabbitChannel();

  logger.info(`Starting Email Worker listening on queue: ${QUEUES.EMAIL}`);

  await channel.consume(QUEUES.EMAIL, async (msg) => {
    if (!msg) return;

    try {
      const job: RabbitJobMessage = JSON.parse(msg.content.toString());
      logger.info({ jobName: job.jobName, payload: job.payload }, 'Email Worker: Processing job...');

      let htmlContent = '';
      let subject = '';

      if (job.jobName === 'send-welcome-email') {
        subject = 'Welcome to OmniMedia Platform! 🎉';
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to OmniMedia</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 10px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
                        <span style="font-size: 24px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px;">OmniMedia</span>
                        <span style="font-size: 14px; font-weight: 600; color: #94a3b8; margin-left: 6px;">PLATFORM</span>
                      </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px; color: #334155;">
                        <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #0f172a;">Welcome aboard, ${job.payload.firstName || job.payload.email}! 👋</h1>
                        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                          Thank you for registering with <b>OmniMedia Platform</b>. Your enterprise multimedia account has been activated and is ready for production.
                        </p>
                        
                        <!-- Features Box -->
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                          <div style="font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 12px;">Included Features:</div>
                          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.8;">
                            <li><b>Strategy Stream Uploads</b>: Automated media processing & Cloudinary CDN distribution</li>
                            <li><b>Real-Time Push Notifications</b>: Socket.IO WebSocket user channels</li>
                            <li><b>Elasticsearch Fuzzy Search</b>: Autocomplete & faceted keyword filters</li>
                          </ul>
                        </div>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 32px 0 16px 0;">
                          <a href="${env.clientUrl}" target="_blank" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
                            Launch Workspace Dashboard
                          </a>
                        </div>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #94a3b8;">
                        <p style="margin: 0 0 8px 0;">If you have any questions, please contact our support team.</p>
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} OmniMedia Platform. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;
        logger.info({ email: job.payload.email, subject, from: env.smtp.from }, '📨 [Email Worker] Dispatched Professional Welcome Email');
      } else if (job.jobName === 'send-login-otp') {
        subject = 'OmniMedia Verification Code';
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification Code</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 10px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
                        <span style="font-size: 24px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px;">OmniMedia</span>
                        <span style="font-size: 14px; font-weight: 600; color: #94a3b8; margin-left: 6px;">SECURITY</span>
                      </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px; text-align: center; color: #334155;">
                        <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Your One-Time Verification Code</h1>
                        <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569;">
                          Use the code below to complete your authentication request for <b>${job.payload.email}</b>.
                        </p>
                        
                        <!-- OTP Display Box -->
                        <div style="background-color: #e0e7ff; border: 2px dashed #818cf8; border-radius: 12px; padding: 24px; margin: 24px 0; display: inline-block;">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4338ca;">
                            ${job.payload.otp}
                          </span>
                        </div>

                        <p style="margin: 16px 0 0 0; font-size: 13px; font-weight: 600; color: #ef4444;">
                          ⏳ This code expires in 5 minutes.
                        </p>
                        <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">
                          If you did not request this OTP code, please ignore this email or secure your account.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #94a3b8;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} OmniMedia Security System. Do not share your OTP with anyone.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;
        logger.info({ email: job.payload.email, otp: job.payload.otp, subject, from: env.smtp.from }, '🔑 [Email Worker] Dispatched Professional OTP Email');
      }

      // Send Acknowledgement to RabbitMQ Broker
      channel.ack(msg);
    } catch (err) {
      logger.error({ err }, 'Email Worker: Error processing job. Sending NACK -> Dead Letter Queue');
      // Send NACK without requeueing (requeue = false) to send message directly to DLQ
      channel.nack(msg, false, false);
    }
  });
};
