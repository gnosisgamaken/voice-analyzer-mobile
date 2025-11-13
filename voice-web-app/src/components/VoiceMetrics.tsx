import type { VoiceSample } from '../types';
import { interpretVoiceMetrics } from '../utils/enhancedAudioAnalysis';

interface VoiceMetricsProps {
  samples: VoiceSample[];
}

export function VoiceMetrics({ samples }: VoiceMetricsProps) {
  const latestSample = samples[samples.length - 1];
  
  if (!latestSample?.voiceMetrics) {
    return null;
  }

  const metrics = latestSample.voiceMetrics;
  const labels = interpretVoiceMetrics(metrics);

  const formatPercentage = (value: number) => Math.round(value * 100);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Voice Analysis
      </h3>
      
      <div className="space-y-3">
        <MetricBar
          label="Brightness"
          value={metrics.brightness}
          displayValue={labels.brightnessLabel}
          color="from-blue-500 to-yellow-500"
        />
        
        <MetricBar
          label="Clarity"
          value={metrics.clarity}
          displayValue={labels.clarityLabel}
          color="from-gray-400 to-blue-500"
        />
        
        <MetricBar
          label="Richness"
          value={metrics.richness}
          displayValue={labels.richnessLabel}
          color="from-orange-400 to-red-500"
        />
        
        <MetricBar
          label="Energy"
          value={metrics.energy}
          displayValue={labels.energyLabel}
          color="from-green-400 to-green-600"
        />
        
        <MetricBar
          label="Stability"
          value={metrics.pitchStability}
          displayValue={labels.stabilityLabel}
          color="from-purple-400 to-purple-600"
        />
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div>
            <span className="font-medium">Brightness:</span>{' '}
            {formatPercentage(metrics.brightness)}%
          </div>
          <div>
            <span className="font-medium">Clarity:</span>{' '}
            {formatPercentage(metrics.clarity)}%
          </div>
          <div>
            <span className="font-medium">Richness:</span>{' '}
            {formatPercentage(metrics.richness)}%
          </div>
          <div>
            <span className="font-medium">Energy:</span>{' '}
            {formatPercentage(metrics.energy)}%
          </div>
          <div className="col-span-2">
            <span className="font-medium">Pitch Stability:</span>{' '}
            {formatPercentage(metrics.pitchStability)}%
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricBarProps {
  label: string;
  value: number;
  displayValue: string;
  color: string;
}

function MetricBar({ label, value, displayValue, color }: MetricBarProps) {
  const percentage = Math.round(value * 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs font-semibold text-gray-600 px-2 py-0.5 bg-gray-100 rounded-full">
          {displayValue}
        </span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${color} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
