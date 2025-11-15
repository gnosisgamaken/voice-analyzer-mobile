export interface FluencyAnalysis {
  pauseCount: number;
  averagePauseDuration: number;
  speechRate: number;
  fluencyScore: number | null;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function analyzeFluency(
  energyTimeline: number[],
  sampleIntervalMs: number,
  pauseThreshold = 0.01
): FluencyAnalysis {
  if (!energyTimeline.length) {
    return {
      pauseCount: 0,
      averagePauseDuration: 0,
      speechRate: 0,
      fluencyScore: null,
    };
  }

  let pauseCount = 0;
  let totalPauseDuration = 0;
  let currentPauseLength = 0;
  let voicesFrames = 0;

  energyTimeline.forEach((energy) => {
    if (energy < pauseThreshold) {
      currentPauseLength += sampleIntervalMs;
    } else {
      if (currentPauseLength >= 200) {
        pauseCount += 1;
        totalPauseDuration += currentPauseLength;
      }
      currentPauseLength = 0;
      voicesFrames += 1;
    }
  });

  if (currentPauseLength >= 200) {
    pauseCount += 1;
    totalPauseDuration += currentPauseLength;
  }

  const averagePauseDuration = pauseCount > 0 ? totalPauseDuration / pauseCount : 0;
  const speechDuration = voicesFrames * sampleIntervalMs;
  const speechRate = speechDuration > 0 ? (voicesFrames / speechDuration) * 1000 : 0;
  const pauseRatio = totalPauseDuration / (energyTimeline.length * sampleIntervalMs);
  const fluencyScore = clamp(1 - pauseRatio);

  return {
    pauseCount,
    averagePauseDuration,
    speechRate,
    fluencyScore,
  };
}
