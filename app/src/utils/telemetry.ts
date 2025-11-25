import { logger } from './logger';

type TelemetryPayload = Record<string, unknown>;

/**
 * Lightweight analytics stub so we can wire events before the backend is selected.
 * Replace with real instrumentation (Segments/Amplitude/etc.) when ready.
 */
export function trackEvent(name: string, payload: TelemetryPayload = {}): void {
  logger.debug(`[telemetry] ${name}`, payload);
}
