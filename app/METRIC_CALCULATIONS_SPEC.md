# Metric Calculations Specification

> Living document for the branded metric stack. Updated as of November 2025.

## Overview

| Metric | Acoustic Features (required) | Current Data Source | Status |
|--------|------------------------------|---------------------|--------|
| Clarity (💎) | Spectral centroid, spectral flatness, HNR | `VoiceAnalyzer.extractFeatures` + **HNR (missing)** | ⚠️ Pending HNR
| Power (⚡) | RMS (dB), peak dB, dynamic range | `audioAnalysis.rms`, energy timeline (**missing var tracking**) | ⚠️ Needs dynamic range tracking
| Health (❤️) | Jitter, shimmer, HNR | **Not implemented** | 🚧 Blocked on `voiceHealthMetrics`
| Warmth (☀️) | Formants (F1/F2), MFCC spectral slope | **Not implemented** | 🚧 Blocked on `formantAnalysis`
| Confidence (👑) | Pitch stability, resonance, pause cadence | Spectral flux proxy + **pause analysis missing** | ⚠️ Needs `speechFluency`
| Expressiveness (🔥) | Pitch range, intensity variance, tempo shifts | Spectral flux proxy + **tempo tracking missing** | ⚠️ Needs dynamic range + tempo analysis
| Voice IQ™ | Weighted composite of all six metrics + consistency modifiers | Derived | ⚠️ Depends on all metrics

## Algorithm Notes

- **Normalization**: Scores are mapped to 0-100. Intermediate helpers clamp to `[0, 1]` then scaled.
- **Fallbacks**: Until advanced features exist, the engine uses existing FFT-derived values with a `status` flag so we know which metrics are simulated.
- **Consistency Bonus**: +5 points if every metric ≥ 0.60. **Balance Penalty**: −10 points if any metric ≤ 0.30.

## Data Requirements

| Feature | Source | Work Remaining |
|---------|--------|----------------|
| Jitter/Shimmer | `voiceHealthMetrics.ts` (new) | Implement autocorrelation-based extractor and unit tests |
| HNR | `voiceHealthMetrics.ts` (new) | Autocorrelation or cepstral method |
| Formants | `formantAnalysis.ts` (new) | Implement LPC or peak-picking pipeline |
| Pause cadence / tempo | `speechFluency.ts` (new) | Silence detection, speech rate |
| Dynamic range timeline | Enhance `audioAnalysis.ts` | Maintain RMS history per window |

## Open Questions

1. **Human Calibration** – Need ground-truth dataset with human ratings (≥20 voices) for correlation tuning (Phase 1.4).
2. **Warmth Definition** – Confirm whether marketing wants a purely acoustic definition or to blend sentiment analysis.
3. **Voice IQ Branding** – Confirm copy rules for thresholds (e.g., "Exceptional" ≥ 85?).

## Next Steps

1. Build extraction modules (`voiceHealthMetrics`, `formantAnalysis`, `speechFluency`).
2. Replace fallback heuristics with real data and run statistical calibration.
3. Wire new metrics into UI + storage schemas and migrate legacy metrics.

