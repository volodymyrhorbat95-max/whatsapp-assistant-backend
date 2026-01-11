// Conversation Abandonment Detection
// Automatically marks conversations as "abandoned" when customers stop responding

import { CronJob } from 'cron';
import Conversation from '../database/models/Conversation';
import { Op } from 'sequelize';

/**
 * Scheduled job that runs every hour to detect and mark abandoned conversations
 *
 * Abandonment criteria:
 * - Conversation status is 'ongoing'
 * - Last message was more than ABANDONMENT_THRESHOLD_HOURS hours ago
 * - No order was created for this conversation
 *
 * Configurable via environment variable: ABANDONMENT_THRESHOLD_HOURS (default: 24)
 */
export const abandonmentDetectorJob = new CronJob('0 * * * *', async () => {
  try {
    const abandonmentThresholdHours = parseInt(process.env.ABANDONMENT_THRESHOLD_HOURS || '24', 10);
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - abandonmentThresholdHours);

    console.log(`[Abandonment Detector] Running check for conversations inactive since ${cutoffTime.toISOString()}`);

    // Mark conversations as abandoned if:
    // - Status is 'ongoing'
    // - Last message was more than X hours ago
    const [updateCount] = await Conversation.update(
      { status: 'abandoned' },
      {
        where: {
          status: 'ongoing',
          lastMessageAt: { [Op.lt]: cutoffTime }
        }
      }
    );

    if (updateCount > 0) {
      console.log(`[Abandonment Detector] Marked ${updateCount} conversations as abandoned`);
    } else {
      console.log('[Abandonment Detector] No conversations to mark as abandoned');
    }
  } catch (error: any) {
    console.error('[Abandonment Detector] Error:', error.message);
  }
});

/**
 * Start the abandonment detection job
 * Call this from server startup (index.ts)
 */
export const startAbandonmentDetection = (): void => {
  abandonmentDetectorJob.start();
  console.log('[Abandonment Detector] Job started - runs every hour');
};

/**
 * Stop the abandonment detection job
 * Call this on graceful shutdown
 */
export const stopAbandonmentDetection = (): void => {
  abandonmentDetectorJob.stop();
  console.log('[Abandonment Detector] Job stopped');
};
