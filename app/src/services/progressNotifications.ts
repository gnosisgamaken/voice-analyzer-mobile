import type { BaselineStatus } from '../utils/baselineMetrics';
import type { MilestoneSignals } from '../utils/progressSignals';
import { selectMilestoneCopyKey } from '../utils/progressSignals';
import { getMilestoneMessage } from '../content/microcopy';
import {
  scheduleNotification,
  buildCelebrationPayload,
  buildGentleReminderPayload,
} from './notificationService';
import { wasEventNotified, markEventNotified } from './notificationTracker';

const DAY_MS = 24 * 60 * 60 * 1000;
const EVENT_BASELINE = 'baselineComplete';
const EVENT_LONG_GAP = 'longGap';

export async function evaluateProgressNotifications(
  signals: MilestoneSignals,
  baselineStatus?: BaselineStatus | null
): Promise<void> {
  await maybeNotifyBaseline(baselineStatus);
  await maybeNotifyMilestone(signals);
  await maybeNotifyLongGap(signals);
}

async function maybeNotifyBaseline(baselineStatus?: BaselineStatus | null) {
  if (!baselineStatus?.isEstablished) {
    return;
  }
  if (await wasEventNotified(EVENT_BASELINE)) {
    return;
  }
  const copy = getMilestoneMessage('baselineComplete');
  await scheduleNotification({
    type: 'milestone',
    title: copy.title,
    body: copy.body,
    scheduleAt: Date.now() + 5 * 60 * 1000,
  });
  await markEventNotified(EVENT_BASELINE);
}

async function maybeNotifyMilestone(signals: MilestoneSignals) {
  const milestoneKey = selectMilestoneCopyKey(signals);
  if (!milestoneKey) return;
  if (await wasEventNotified(milestoneKey)) {
    return;
  }

  if (milestoneKey === 'personalBest' && signals.personalBestValue) {
    await scheduleNotification(
      buildCelebrationPayload('Voice IQ™', signals.personalBestValue),
    );
  } else {
    const copy = getMilestoneMessage(milestoneKey);
    await scheduleNotification({
      type: 'milestone',
      title: copy.title,
      body: copy.body,
      scheduleAt: Date.now() + 5 * 60 * 1000,
    });
  }

  await markEventNotified(milestoneKey);
}

async function maybeNotifyLongGap(signals: MilestoneSignals) {
  if (
    signals.daysSinceLastRecording === null ||
    signals.daysSinceLastRecording < 7
  ) {
    return;
  }
  if (await wasEventNotified(EVENT_LONG_GAP, 3 * DAY_MS)) {
    return;
  }

  await scheduleNotification(
    buildGentleReminderPayload(signals.latestRecordingTimestamp ?? undefined),
  );
  await markEventNotified(EVENT_LONG_GAP);
}
