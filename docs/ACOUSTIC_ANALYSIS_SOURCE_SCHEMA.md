# Book Source Schema: The Acoustic Analysis of Speech

**Book:** The Acoustic Analysis of Speech  
**Authors:** Kent & Read  
**Primary Use:** Foundation for metric definitions, acoustic theory validation, and implementation guidelines  
**Status:** 📋 Reference Schema v1.0  
**Date:** November 17, 2025

---

## 📊 Complete Source Schema

```json
{
  "metadata": {
    "book_title": "The Acoustic Analysis of Speech",
    "authors": ["Ray D. Kent", "Charles Read"],
    "publication_year": 1992,
    "edition": "2nd",
    "publisher": "Singular Publishing Group",
    "relevance_to_app": "Foundation for all metric calculations and acoustic theory",
    "priority_level": "🔴 CRITICAL",
    "chapters_count": 8,
    "key_chapters": ["2", "3", "4", "5", "6", "7"],
    "estimated_read_time_hours": 40,
    "implementation_priority": "Week 1-2"
  },
  "acoustic_signal_role_note": "The acoustic signal is the output of the respiratory/phonatory/articulatory production loop and the input to the listener's perceptual system; every metric we expose must honor its dual role as the bridge between physiology and perception.",
  
  "global_models": [
    {
      "id": "model_linear_source_filter",
      "name": "Linear Source-Filter Theory of Speech Production",
      "summary": "This foundational theory assumes that speech sounds can be understood as a sound source (laryngeal vibration or turbulence) that is modified and shaped by the vocal tract, which acts as a filter or resonator. It provides the theoretical basis for interpreting acoustic measurements and is essential for understanding articulatory-acoustic relationships.",
      "theoretical_importance": "FOUNDATIONAL — All acoustic analysis methods are built on this model",
      "key_equations": [
        {
          "formula": "P(f) = U(f) · T(f) · R(f)",
          "components": {
            "P_f": "Output spectrum (acoustic pressure waveform)",
            "U_f": "Source spectrum (typically -12 dB/octave roll-off for glottal source)",
            "T_f": "Vocal tract transfer function (defines formants, resonances)",
            "R_f": "Radiation characteristic (typically +6 dB/octave for lip radiation)"
          },
          "interpretation": "The acoustic output is the product of source, filter, and radiation characteristics"
        }
      ],
      "assumptions": [
        "The system is LINEAR (output is proportional to input)",
        "The system is TIME-INVARIANT (properties don't change rapidly during analysis window)",
        "Source and filter are INDEPENDENT (source doesn't interact with filter)"
      ],
      "limitations": [
        "Real voice production has NONLINEAR properties (vocal folds interact with tract)",
        "Dynamic coupling exists between source and filter",
        "High-intensity phonation violates linearity assumption"
      ],
      "usage_notes": "This model is adequate for most standard speech analysis. Understanding this theory is essential for valid interpretation of acoustic measures and for knowing when measurements may be unreliable.",
      "chapters": ["2", "4", "5"],
      "application_to_voice_analyzer": {
        "clarity_metric": "Based on T(f)—the vocal tract transfer function. Clear voices have sharp, well-defined peaks (formants).",
        "power_metric": "Based on U(f) × magnitude—source spectrum energy. Higher power = more efficient phonation.",
        "health_metric": "Related to regularity of U(f)—noise in source indicates irregular vocal fold vibration (pathology)."
      }
    },
    {
      "id": "model_nonlinear_source_filter",
      "name": "Nonlinear Source-Filter Model",
      "summary": "An alternative or refined model that considers the dynamic nature and interplay of the sound source and the resonator, where each impacts the other in a nonlinear fashion. This accounts for vocal tract loading on the vocal folds and dynamic system coupling in voice production.",
      "theoretical_importance": "ADVANCED — Better explains high-intensity or dysphonic voices",
      "key_equations": [],
      "assumptions": [
        "Source and filter INTERACT dynamically",
        "Vocal tract impedance AFFECTS vocal fold oscillation",
        "System behavior is NONLINEAR at high intensities"
      ],
      "when_applies": [
        "Loud, intense phonation",
        "Pathological voices with irregular patterns",
        "Singers using advanced techniques"
      ],
      "why_matters": "Explains phenomena the linear model cannot (e.g., bifurcation, sudden frequency jumps, complex nonlinear patterns in dysphonia)",
      "chapters": ["2"],
      "application_to_voice_analyzer": {
        "note": "For MVP, use linear model. Nonlinear model is for advanced/professional tier users.",
        "when_relevant": "When analyzing professional singers or detecting vocal pathology patterns."
      }
    }
  ],

  "acoustic_metrics": [
    {
      "id": "metric_f0",
      "metric_name": "Fundamental Frequency (F0) / Speaking Fundamental Frequency (SF0)",
      "app_metric_name": "Pitch (basis for Confidence metric)",
      "chapter_sources": ["3", "4", "6", "7"],
      "definition": "The rate of oscillation or vibratory frequency of the vocal folds. F0 = 'F-oh' (frequency of oscillation zero).",
      "units": "Hz (hertz, or cycles per second)",
      "mathematical_definition": "F0 is the reciprocal of the period of vocal fold vibration: $F_0 = 1/T_0$",
      "perceptual_correlate": "PITCH — the primary perceptual attribute that humans hear",
      "input_requirements": {
        "signal_type": "Voiced speech segments (vowels, voiced consonants, continuous speech)",
        "sampling_rate_minimum_hz": 8000,
        "sampling_rate_recommended_hz": 16000,
        "window_size_ms": "20-40 ms (typical analysis window)",
        "preprocessing": "Pre-emphasis filtering common (boosts high frequencies)"
      },
      "calculation_methods": [
        {
          "method": "Zero-crossing rate",
          "pros": "Fast, simple",
          "cons": "Less accurate with noise present"
        },
        {
          "method": "Autocorrelation",
          "pros": "Accurate, robust to noise",
          "cons": "More computationally expensive"
        },
        {
          "method": "Cepstral analysis",
          "pros": "Very accurate",
          "cons": "Complex, computationally intensive"
        }
      ],
      "interpretation": {
        "what_it_represents": "**Pitch** — a perceptual quality that listeners hear. Also used for intonation (suprasegmental), stress patterns, and linguistic meaning.",
        "how_changes_are_interpreted": "Higher F0 = higher pitch. Linguistic meaning varies by language (tone languages use pitch for meaning; stress-languages use pitch for emphasis).",
        "in_context_of_voice_health": "F0 expected values vary by age, gender, and context. Abnormal F0 can indicate dysphonia or laryngeal pathology.",
        "variability_matters": "Natural speech has F0 variation (intonation). Pathological voices often show irregular F0 jumps (perturbation)."
      },
      "normative_patterns": {
        "adult_male_hz": 80,
        "adult_female_hz": 180,
        "child_hz": 250,
        "speaking_range_octaves": 1.5,
        "source": "Baken & Orlikoff (1999), Table 3.1"
      },
      "limitations": [
        "Measurement difficulty increases with vocal pathology",
        "Very low F0 (hoarse, creaky voice) challenging for algorithms",
        "Very high F0 (head voice, falsetto) may be underestimated",
        "Background noise degrades accuracy"
      ],
      "implementation_notes": {
        "your_app_uses": "Autocorrelation method (accurate, handles noise well)",
        "normalization": "Compare to user baseline, not absolute values",
        "visualization": "F0 contour over time; show variability as secondary metric"
      },
      "related_metrics": [
        "Jitter (F0 cycle-to-cycle variability)",
        "Pitch Range (max F0 - min F0)",
        "Vibrato (periodic F0 modulation)"
      ]
    },

    {
      "id": "metric_formants",
      "metric_name": "Formant Frequencies (F1, F2, F3, ...Fn)",
      "app_metric_name": "Warmth & Clarity (resonance-based)",
      "chapter_sources": ["4", "5"],
      "definition": "The natural resonant frequencies of the vocal tract filter. They appear as conspicuous spectral peaks (standing wave resonances) in the speech spectrum.",
      "units": "Hz (hertz)",
      "mathematical_definition": "Determined by vocal tract length and configuration. For a closed tube: $f_n = \\frac{n \\cdot c}{4L}$ (where n=1,3,5... for odd harmonics; c=speed of sound; L=tract length)",
      "perceptual_correlate": "VOWEL IDENTITY — Formant pattern is the primary cue for vowel perception",
      "input_requirements": {
        "signal_type": "Vowels, sonorants, diphthongs (open vocal tract)",
        "sampling_rate_minimum_hz": 8000,
        "sampling_rate_recommended_hz": 16000,
        "window_size_ms": "20-50 ms",
        "preprocessing": "Linear Predictive Coding (LPC) commonly used for formant tracking"
      },
      "calculation_methods": [
        {
          "method": "Linear Predictive Coding (LPC)",
          "pros": "Standard method, accurate, widely implemented",
          "cons": "Order selection critical"
        },
        {
          "method": "STRAIGHT (speech analysis by spectral time-warping)",
          "pros": "Very accurate formant tracking",
          "cons": "Complex, computationally expensive"
        },
        {
          "method": "Spectral peak picking",
          "pros": "Simple, intuitive",
          "cons": "Less robust to noise"
        }
      ],
      "interpretation": {
        "what_it_represents": "Vocal tract resonance. **F1** relates inversely to tongue height (vowel height). **F2** relates to tongue advancement (front-back position).",
        "f1_relationships": {
          "low_f1": "High tongue (close vowels like /i/, /u/)",
          "high_f1": "Low tongue (open vowels like /a/, /æ/)"
        },
        "f2_relationships": {
          "low_f2": "Back tongue (back vowels like /u/, /ɔ/)",
          "high_f2": "Front tongue (front vowels like /i/, /e/, /æ/)"
        },
        "in_context_of_voice_health": "Used to evaluate vowel clarity, articulatory precision, dysarthria (reduced vowel space), voice quality."
      },
      "normative_patterns": {
        "american_english_vowels": {
          "note": "Varies by speaker, but reference formant values exist",
          "female_average_f1": 600,
          "female_average_f2": 1300,
          "male_average_f1": 500,
          "male_average_f2": 1000
        },
        "source": "Kent & Read (1992), Figure 4.3"
      },
      "limitations": [
        "Formant tracking can be inaccurate in noisy signals",
        "High-pitched voices (children, women) have formants closer together; harder to track",
        "Nasal consonants alter formant patterns",
        "Microphone placement affects frequency response"
      ],
      "implementation_notes": {
        "your_app_uses": "LPC for formant extraction; F1 & F2 primarily",
        "warmth_metric": "Primarily F1 (lower F1 = rounder, warmer vowels)",
        "clarity_metric": "F2 and spectral spread (tight, well-defined peaks = clear)"
      },
      "related_metrics": [
        "Formant Bandwidth (Bn) — width of formant peak",
        "Vowel Space Area — area enclosed by F1-F2 plot of vowels",
        "Vowel Quadrilateral — 2D plot of F1 vs F2"
      ]
    },

    {
      "id": "metric_spectral_centroid",
      "metric_name": "Spectral Centroid (Centre of Gravity)",
      "app_metric_name": "Clarity (brightness measure)",
      "chapter_sources": ["5", "6"],
      "definition": "The frequency that divides the spectrum into two regions of equal energy. It is the 'center of mass' of the spectrum. Also called 'centre of gravity'.",
      "units": "Hz (hertz)",
      "mathematical_definition": "$SC = \\frac{\\sum (f_i \\cdot M_i)}{\\sum M_i}$ where $f_i$ is frequency bin and $M_i$ is magnitude at that bin",
      "perceptual_correlate": "BRIGHTNESS — Listener impression of how 'bright' or 'shrill' the voice is",
      "input_requirements": {
        "signal_type": "Any voiced or voiceless sound",
        "sampling_rate_minimum_hz": 8000,
        "window_size_ms": "20-40 ms",
        "preprocessing": "Magnitude spectrum (absolute value of FFT)"
      },
      "calculation_steps": [
        "1. Compute FFT of the audio signal",
        "2. Compute magnitude spectrum (absolute value)",
        "3. For each frequency bin, multiply frequency by magnitude",
        "4. Sum all (frequency × magnitude) products",
        "5. Divide by sum of all magnitudes"
      ],
      "interpretation": {
        "what_it_represents": "A measure of where the speech energy is concentrated in the frequency domain. Higher centroid = more high-frequency energy = brighter/sharper.",
        "high_spectral_centroid": {
          "hz_range": "> 4000 Hz",
          "perception": "Bright, shrill, sharp",
          "causes": "High formants, strong fricatives, tension"
        },
        "low_spectral_centroid": {
          "hz_range": "< 2000 Hz",
          "perception": "Dark, muffled, soft",
          "causes": "Low formants, vocal tract constriction"
        },
        "in_context_of_voice_health": "Used to evaluate voice quality, articulation precision, presence of energy in speech."
      },
      "normative_patterns": {
        "typical_range_hz": "1000-3000",
        "speaking_males_hz": "1500-2000",
        "speaking_females_hz": "2000-2500",
        "variation": "Highly dependent on vowel; fricatives push centroid higher"
      },
      "limitations": [
        "Sensitive to pitch changes",
        "Affected by microphone frequency response",
        "Window choice affects calculation"
      ],
      "implementation_notes": {
        "your_app_uses": "FFT-based calculation over analysis windows",
        "normalization": "Normalize to typical range (1000-5000 Hz); map to 0-100 scale",
        "interpretation": "Higher centroid (> 3000 Hz) = clear, bright voice"
      },
      "related_metrics": [
        "Spectral Spread (variance around centroid)",
        "Spectral Flatness (how spread out vs. concentrated)"
      ]
    },

    {
      "id": "metric_spectral_flatness",
      "metric_name": "Spectral Flatness (Wiener Entropy)",
      "app_metric_name": "Clarity (purity measure, inverse)",
      "chapter_sources": ["6"],
      "definition": "A measure of how evenly distributed the spectrum is. Flat spectrum (high flatness) = noise-like; peaked spectrum (low flatness) = tonal/clear. Uses geometric mean / arithmetic mean ratio.",
      "units": "Dimensionless ratio or 0-1 scale (sometimes expressed in dB)",
      "mathematical_definition": "$SF = \\frac{(\\prod_{i=1}^{N} M_i)^{1/N}}{\\frac{1}{N}\\sum_{i=1}^{N} M_i}$ (geometric mean / arithmetic mean)",
      "perceptual_correlate": "VOICE QUALITY — presence of noise vs. tonal clarity",
      "input_requirements": {
        "signal_type": "Voiced speech (vowels, sonorants)",
        "sampling_rate_minimum_hz": 8000,
        "window_size_ms": "20-40 ms",
        "preprocessing": "Power spectrum or magnitude spectrum"
      },
      "interpretation": {
        "high_flatness": {
          "range": "0.7-1.0",
          "meaning": "Spectrum is flat, noise-like, lacks harmonic structure",
          "perception": "Breathy, hoarse, dysphonic"
        },
        "low_flatness": {
          "range": "0.0-0.3",
          "meaning": "Spectrum is peaked, clear harmonics, tonal",
          "perception": "Clear, healthy voice"
        },
        "in_context_of_voice_health": "High flatness indicates presence of noise component (breach of vocal folds, irregular vibration) = pathology indicator."
      },
      "normative_patterns": {
        "healthy_voices": "0.1-0.3",
        "dysphonic_voices": "0.4-0.8",
        "source": "Baken & Orlikoff (1999)"
      },
      "limitations": [
        "Sensitive to noise in recording",
        "Window selection matters",
        "Difficult to measure in whispered speech"
      ],
      "implementation_notes": {
        "your_app_uses": "Inverse of flatness for clarity; low flatness = high clarity",
        "formula_simplified": "flatness = geometric_mean / arithmetic_mean of magnitudes",
        "interpretation_reversed": "For user-facing metric, invert so high = clear"
      },
      "related_metrics": [
        "Harmonics-to-Noise Ratio (HNR) — similar concept, but ratio-based",
        "Spectral Entropy"
      ]
    },

    {
      "id": "metric_hnr",
      "metric_name": "Harmonics-to-Noise Ratio (H/N or HNR)",
      "app_metric_name": "Vocal Health (noise indicator)",
      "chapter_sources": ["6"],
      "definition": "The ratio of energy in the harmonic (periodic) components of the speech signal to the energy in the aperiodic (noise) components. A numerical evaluation of voice quality in terms of periodicity.",
      "units": "Dimensionless ratio, or expressed in dB (decibels): $HNR_{dB} = 10 \\log_{10}(HNR)$",
      "mathematical_definition": "$HNR = \\frac{\\sum (E_{harmonic})}{\\sum (E_{noise})}$",
      "perceptual_correlate": "VOICE QUALITY — presence of noise (breathiness, roughness, hoarseness)",
      "input_requirements": {
        "signal_type": "Voiced speech (vowels, sonorants)",
        "sampling_rate_minimum_hz": 8000,
        "window_size_ms": "30-50 ms",
        "preprocessing": "Spectral decomposition into harmonic and noise components"
      },
      "calculation_steps": [
        "1. Compute short-time Fourier transform (STFT)",
        "2. Identify the F0 and its harmonics",
        "3. Sum energy within narrow bands around harmonics → E_harmonic",
        "4. Sum energy in remaining regions → E_noise",
        "5. Compute ratio: HNR = E_harmonic / E_noise"
      ],
      "interpretation": {
        "high_hnr": {
          "db_range": "> 12 dB",
          "ratio": "> 16:1",
          "meaning": "Mostly harmonic, little noise",
          "perception": "Clean, healthy voice"
        },
        "medium_hnr": {
          "db_range": "8-12 dB",
          "ratio": "6-16:1",
          "meaning": "Mix of harmonic and noise",
          "perception": "Slightly breathy or rough"
        },
        "low_hnr": {
          "db_range": "< 8 dB",
          "ratio": "< 6:1",
          "meaning": "Substantial noise component",
          "perception": "Very breathy, dysphonic, hoarse"
        },
        "in_context_of_voice_health": "Clinical gold standard for assessing voice quality pathology. Low HNR strongly indicates dysphonia."
      },
      "normative_patterns": {
        "healthy_adult_male": "> 12 dB",
        "healthy_adult_female": "> 10 dB",
        "mild_dysphonia": "6-10 dB",
        "moderate_dysphonia": "0-6 dB",
        "severe_dysphonia": "< 0 dB (more noise than harmony)",
        "source": "Baken & Orlikoff (1999), Clinical Measurement of Speech and Voice"
      },
      "limitations": [
        "Depends on accurate F0 identification",
        "Affected by microphone quality and background noise",
        "Window selection affects results"
      ],
      "implementation_notes": {
        "your_app_uses": "HNR calculation from spectral decomposition",
        "normalization": "Map dB values to 0-100 scale (e.g., 0 dB = 0, 20 dB = 100)",
        "health_metric": "HNR is direct indicator of vocal health; high HNR = healthy"
      },
      "related_metrics": [
        "Spectral Flatness (similar concept, inverse measure)",
        "Normalized Noise Energy (NNE)",
        "Cepstral Peak Prominence (CPP)"
      ]
    },

    {
      "id": "metric_jitter",
      "metric_name": "Jitter (F0 Perturbation)",
      "app_metric_name": "Confidence & Health (pitch stability)",
      "chapter_sources": ["3", "6", "7"],
      "definition": "The nonvolitional, cycle-to-cycle variability in the Fundamental Frequency (F0). It measures the irregularity of vocal fold vibration period-to-period.",
      "units": "Jitter Factor (ratio), Jitter Percent (%), or Absolute Jitter (seconds or ms)",
      "mathematical_definition": "Several standardized algorithms; most common is Relative Average Perturbation (RAP): $RAP = \\frac{100}{N-2} \\sum_{i=1}^{N-2} \\frac{|T_i - T_{\\overline{3i}}|}{T_i}$ (where T is period and $T_{\\overline{3i}}$ is 3-point average)",
      "perceptual_correlate": "VOICE QUALITY — perceived roughness, hoarseness, instability",
      "input_requirements": {
        "signal_type": "Sustained vowels (for measurement stability) or continuous voiced speech",
        "sampling_rate_minimum_hz": 22050,
        "sampling_rate_recommended_hz": 44100,
        "quantization_bit_depth_minimum": 16,
        "window_size_ms": "1000+ (several vocal cycles needed for stable measurement)",
        "preprocessing": "F0 extraction; period marking"
      },
      "calculation_steps": [
        "1. Extract F0 contour (pitch tracking)",
        "2. Convert F0 to period: T = 1/F0",
        "3. Calculate period deviation for each cycle",
        "4. Use standard formula (RAP, JAP, etc.) to compute jitter"
      ],
      "interpretation": {
        "low_jitter": {
          "percent": "< 1.04%",
          "meaning": "Very regular vocal fold vibration",
          "perception": "Steady, confident pitch"
        },
        "normal_jitter": {
          "percent": "1.04% - 2.0%",
          "meaning": "Natural, expected variability",
          "perception": "Healthy voice"
        },
        "high_jitter": {
          "percent": "> 2.0%",
          "meaning": "Irregular vocal fold vibration",
          "perception": "Rough, unstable, dysphonic"
        },
        "in_context_of_voice_health": "High jitter is clinical indicator of laryngeal pathology (Parkinson's, vocal fold scar, dysphonia)."
      },
      "normative_patterns": {
        "healthy_adult_male": "0.5-1.0%",
        "healthy_adult_female": "0.5-1.2%",
        "mild_dysphonia": "1.5-3.0%",
        "moderate_dysphonia": "3.0-5.0%",
        "severe_dysphonia": "> 5.0%"
      },
      "limitations": [
        "Requires accurate F0 tracking; fails with noisy signals",
        "Highly sensitive to analysis method (different algorithms give different values)",
        "Measurement error can dominate in normal voices (where jitter is already very small)",
        "Very dependent on signal quality and microphone"
      ],
      "screen_utility_cautions": [
        "Per Behrman, jitter should not be used as a binary screening tool; interpret alongside clinical context and perceptual assessment."
      ],
      "implementation_notes": {
        "your_app_uses": "RAP (Relative Average Perturbation) algorithm",
        "confidence_metric": "Low jitter = high confidence (steady pitch)",
        "health_metric": "Jitter correlates with vocal fold dysfunction"
      },
      "related_metrics": [
        "Shimmer (amplitude perturbation, analogous to jitter)",
        "Vibrato (intentional periodic F0 modulation — not jitter)",
        "Pitch Range Variability"
      ]
    },

    {
      "id": "metric_shimmer",
      "metric_name": "Shimmer (Amplitude Perturbation)",
      "app_metric_name": "Health (amplitude stability)",
      "chapter_sources": ["3", "6", "7"],
      "definition": "The nonvolitional cycle-to-cycle variability in the amplitude (peak-to-peak extent) of the acoustic waveform. Measures irregularity in vocal fold closing strength/consistency.",
      "units": "Shimmer Factor (ratio), Shimmer Percent (%), or Absolute Shimmer (dB)",
      "mathematical_definition": "Similar to Jitter, but applied to amplitude. Most common: Amplitude Perturbation Quotient (APQ): $APQ = \\frac{100}{N-2} \\sum_{i=1}^{N-2} \\frac{|A_i - A_{\\overline{3i}}|}{A_i}$ (where A is amplitude)",
      "perceptual_correlate": "VOICE QUALITY — tremor, instability in loudness",
      "input_requirements": {
        "signal_type": "Sustained vowels or continuous voiced speech",
        "sampling_rate_minimum_hz": 22050,
        "sampling_rate_recommended_hz": 44100,
        "quantization_bit_depth_minimum": 16,
        "window_size_ms": "1000+ (multiple cycles)",
        "preprocessing": "Amplitude envelope extraction; cycle marking"
      },
      "interpretation": {
        "low_shimmer": {
          "percent": "< 3.8%",
          "meaning": "Stable amplitude cycle-to-cycle",
          "perception": "Steady vocal strength"
        },
        "normal_shimmer": {
          "percent": "3.8% - 5.0%",
          "meaning": "Natural amplitude variability",
          "perception": "Healthy voice"
        },
        "high_shimmer": {
          "percent": "> 5.0%",
          "meaning": "Unstable amplitude",
          "perception": "Tremorous, weak, dysphonic"
        },
        "in_context_of_voice_health": "High shimmer indicates irregular vocal fold closure or laryngeal weakness; pathology indicator."
      },
      "normative_patterns": {
        "healthy_adult": "3.0-5.0%",
        "mild_dysphonia": "5.0-8.0%",
        "moderate_dysphonia": "8.0-15.0%",
        "severe_dysphonia": "> 15.0%"
      },
      "limitations": [
        "Affected by recording level (amplitude is absolute, not normalized)",
        "Microphone distortion introduces false shimmer",
        "Background noise degrades measurement"
      ],
      "screen_utility_cautions": [
        "Do not use shimmer as a standalone screening metric—pedagogical texts (McCoy) note that vibrato or artistic amplitude modulation can be misclassified as pathology."
      ],
      "implementation_notes": {
        "your_app_uses": "APQ (Amplitude Perturbation Quotient) algorithm",
        "health_metric": "Low shimmer = healthy amplitude control",
        "normalization": "Normalize to user's baseline, not absolute"
      },
      "related_metrics": [
        "Jitter (frequency perturbation counterpart)",
        "Loudness Stability",
        "Voice Tremor"
      ]
    },

    {
      "id": "metric_zero_crossing_rate",
      "metric_name": "Zero-Crossing Rate (ZCR)",
      "app_metric_name": "Energy & Power (frequency content indicator)",
      "chapter_sources": ["3", "5"],
      "definition": "The rate at which the waveform crosses the zero line (transitions from positive to negative and back). Used as a simple measure of frequency content or signal activity.",
      "units": "Crossings per second, or normalized to frame",
      "mathematical_definition": "$ZCR = \\frac{1}{2}\\sum_{n=1}^{N-1} |sgn(x[n]) - sgn(x[n-1])|$ (where sgn is sign function)",
      "perceptual_correlate": "Indirectly related to spectral content; voiceless sounds have higher ZCR than voiced",
      "input_requirements": {
        "signal_type": "Any audio signal",
        "sampling_rate_minimum_hz": 8000,
        "window_size_ms": "10-40 ms",
        "preprocessing": "None required"
      },
      "interpretation": {
        "high_zcr": "High-frequency content (fricatives, noise, unvoiced consonants)",
        "low_zcr": "Low-frequency content (voiced vowels, sonorants)",
        "in_context_of_voice_health": "Used to distinguish voiced from unvoiced segments; helps detect pathological noise."
      },
      "limitations": [
        "Not as direct as spectral analysis",
        "Affected by DC offset or recording bias"
      ],
      "implementation_notes": {
        "your_app_uses": "ZCR for energy estimation in real-time analysis",
        "power_metric": "ZCR combined with RMS gives picture of frequency content"
      },
      "related_metrics": [
        "Spectral Centroid (more direct measure of frequency content)",
        "RMS Energy"
      ]
    },

    {
      "id": "metric_rms_energy",
      "metric_name": "Root Mean Square (RMS) Energy",
      "app_metric_name": "Power (loudness/intensity)",
      "chapter_sources": ["3", "5"],
      "definition": "The square root of the average of the squared amplitude values. A measure of signal energy or loudness.",
      "units": "RMS amplitude (linear) or dB (decibels, logarithmic)",
      "mathematical_definition": "$RMS = \\sqrt{\\frac{1}{N}\\sum_{i=1}^{N} x_i^2}$ or in dB: $RMS_{dB} = 20 \\log_{10}(RMS)$",
      "perceptual_correlate": "LOUDNESS — how loud the voice is perceived",
      "input_requirements": {
        "signal_type": "Any audio signal",
        "sampling_rate_minimum_hz": 8000,
        "window_size_ms": "20-40 ms",
        "preprocessing": "Optional pre-emphasis"
      },
      "interpretation": {
        "high_rms": "Loud, powerful voice",
        "low_rms": "Quiet, weak voice",
        "in_context_of_voice_health": "Lower RMS after fatigue is indicator of vocal strain. Consistent RMS over time = healthy power control."
      },
      "normative_patterns": {
        "conversational_speech_db": "-20 to -10 dB (relative to 1 Pa)",
        "raised_voice_db": "-10 to 0 dB",
        "shouting_db": "> 0 dB"
      },
      "limitations": [
        "Highly dependent on microphone placement and distance",
        "Absolute values not comparable across recordings without normalization"
      ],
      "implementation_notes": {
        "your_app_uses": "RMS in dB for power metric; normalized to user baseline",
        "power_metric": "RMS energy directly maps to power"
      },
      "related_metrics": [
        "Dynamic Range (max RMS - min RMS)",
        "Peak Amplitude",
        "Loudness (perceptual)"
      ]
    }
  ],

  "analysis_procedures": [
    {
      "id": "procedure_spectrogram",
      "name": "Sound Spectrography / Spectrogram Analysis",
      "description": "Visual representation of frequency content over time. Decomposes audio signal into component frequencies and displays energy as intensity.",
      "theoretical_basis": "Fast Fourier Transform (FFT) — decomposes time-domain signal into frequency-domain components",
      "steps": [
        "1. Acquire acoustic signal (digital or analog)",
        "2. Divide signal into overlapping analysis windows (frames)",
        "3. Apply window function (Hamming, Hann, etc.) to each frame to reduce spectral leakage",
        "4. Compute FFT for each frame, producing power spectrum",
        "5. Display time (x-axis) × frequency (y-axis) × intensity (color/gray scale)"
      ],
      "recommended_parameters": {
        "window_type": "Hamming window (most common)",
        "window_length_ms_narrowband": 29,
        "window_length_ms_wideband": 3,
        "overlap_percent": 50,
        "fft_size": 512,
        "bandwidth_hz_narrowband": 29,
        "bandwidth_hz_wideband": 300
      },
      "bandwidth_tradeoff": {
        "narrowband_low_bw": {
          "frequency_resolution": "High (can see individual harmonics)",
          "time_resolution": "Low (cannot track fast transitions)",
          "use_case": "Visualizing F0 contour, pitch patterns, voice quality"
        },
        "wideband_high_bw": {
          "frequency_resolution": "Low (harmonics blur together)",
          "time_resolution": "High (can track consonant bursts, formant transitions)",
          "use_case": "Analyzing consonants, formant transitions, temporal patterns"
        }
      },
      "pitfalls": [
        "Parameter selection (bandwidth, window) dramatically changes visible features",
        "Requires knowledge of acoustic theory to interpret correctly",
        "Pattern recognition in spectrograms is difficult to automate reliably",
        "User confusion between narrowband and wideband displays"
      ],
      "use_cases_in_your_app": [
        "Waveform visualization (musical waveform display)",
        "F0 contour extraction (pitch over time)",
        "Formant tracking (for clarity assessment)",
        "Detecting fricatives and noise (for health assessment)"
      ],
      "implementation_notes": {
        "your_app_uses": "FFT-based spectrogram for waveform display",
        "visualization": "Color-coded by pitch (blue → red → yellow) as per app design",
        "real_time": "Streaming analysis with 20ms windows for responsive UI"
      }
    },

    {
      "id": "procedure_inverse_filtering",
      "name": "Inverse Filtering (Source Estimation)",
      "description": "Removes vocal tract effects from speech signal to isolate the glottal source waveform. Separates source (vocal folds) from filter (vocal tract).",
      "theoretical_basis": "Linear Source-Filter Model inversion: If P(f) = U(f) · T(f) · R(f), then U(f) = P(f) / [T(f) · R(f)]",
      "steps": [
        "1. Record speech signal",
        "2. Estimate vocal tract transfer function T(f) (formants) using LPC or spectral analysis",
        "3. Estimate radiation characteristic R(f) (typically ~+6 dB/octave)",
        "4. Calculate reciprocal of T(f) · R(f) → create inverse filter",
        "5. Apply inverse filter to original signal",
        "6. Result: Glottal volume velocity waveform (source signal)"
      ],
      "recommended_parameters": {
        "signal_type": "Voiced speech (vowels work best)",
        "window_length_ms": 20,
        "lpc_order": 12,
        "preprocessing": "High-pass filtering (remove DC offset)"
      },
      "pitfalls": [
        "Accurate estimation of T(f) is critical; errors propagate",
        "Linearity assumption violated at high intensities",
        "Spectral noise in recorded signal gets amplified by high-order inverse filter"
      ],
      "use_cases_in_your_app": [
        "Glottal source analysis (for advanced Health metric)",
        "Detecting vocal fold irregularities (pathology screening)",
        "Professional voice analysis (singers, speakers)"
      ],
      "implementation_notes": {
        "your_app_uses": "Not in MVP; considered for advanced/professional tier",
        "complexity": "Advanced procedure; requires strong signal processing foundation",
        "value": "Provides direct window into vocal fold behavior"
      }
    },

    {
      "id": "procedure_lpc",
      "name": "Linear Predictive Coding (LPC) Analysis",
      "description": "Autoregressive model-based analysis for extracting formants and vocal tract characteristics. Standard method in speech processing.",
      "theoretical_basis": "Models vocal tract as all-pole filter; predicts next sample based on previous samples",
      "steps": [
        "1. Select analysis window (20-30 ms)",
        "2. Apply pre-emphasis filter (boosts high frequencies)",
        "3. Compute autocorrelation function",
        "4. Solve Yule-Walker equations to get LPC coefficients",
        "5. Convert coefficients to formant frequencies and bandwidths"
      ],
      "recommended_parameters": {
        "window_length_ms": 20,
        "lpc_order": 12,
        "pre_emphasis_alpha": 0.97
      },
      "advantages": [
        "Fast, efficient algorithm",
        "Robust formant tracking",
        "Widely used standard in speech processing"
      ],
      "limitations": [
        "LPC order must be chosen (typically N/2, where N = # samples)",
        "Assumes all-pole model (not always accurate)",
        "Nasal consonants and fricatives challenge the model"
      ],
      "use_cases_in_your_app": [
        "Formant extraction (F1, F2 for Warmth & Clarity metrics)",
        "Vocal tract modeling",
        "Speech synthesis (future feature)"
      ],
      "implementation_notes": {
        "your_app_uses": "LPC order 12 for formant tracking on 44.1 kHz audio",
        "formant_accuracy": "±50 Hz typical error",
        "real_time": "Computationally efficient for streaming analysis"
      }
    }
  ],

  "implementation_guidelines": {
    "metric_prioritization": [
      {
        "priority": 1,
        "metrics": ["F0", "RMS Energy", "Spectral Centroid"],
        "reasoning": "Foundation for Power, Clarity, Confidence metrics; can be computed in real-time"
      },
      {
        "priority": 2,
        "metrics": ["Formants", "Jitter", "Shimmer"],
        "reasoning": "Enable Warmth, Confidence, Health metrics; require more computation"
      },
      {
        "priority": 3,
        "metrics": ["HNR", "Spectral Flatness"],
        "reasoning": "Refine Health and Clarity metrics; more robust post-processing"
      },
      {
        "priority": 4,
        "metrics": ["Zero-Crossing Rate"],
        "reasoning": "Supplementary for energy and frequency content assessment"
      }
    ],
    
    "sampling_and_preprocessing": {
      "recommended_sampling_rate": 44100,
      "minimum_sampling_rate": 16000,
      "bit_depth": 16,
      "preprocessing_steps": [
        "Remove DC offset (high-pass at ~1 Hz)",
        "Pre-emphasis filter (~0.97 coefficient)",
        "Normalize to prevent clipping"
      ]
    },

    "window_selection": {
      "for_pitch_tracking": "Hamming, 20-30 ms, 50% overlap",
      "for_formant_extraction": "Hamming, 20-30 ms, 50% overlap",
      "for_spectral_analysis": "Hann, 20-40 ms, 75% overlap"
    },

    "normalization_strategy": {
      "baseline_establishment": "First 5 recordings establish user baseline for each metric",
      "metric_scaling": "Map raw values to 0-100 scale using user's baseline ± 1 SD",
      "comparison_frame": "Always compare to user baseline, not population norms",
      "adaptation": "Baseline adjusts gradually as user data accumulates"
    },

    "error_handling": {
      "pitch_tracking_failure": "Use alternative method (autocorrelation backup); gracefully degrade",
      "formant_extraction_failure": "Use spectral peak picking fallback; flag low confidence",
      "high_noise_signal": "Flag recording quality warning; suggest re-recording in quiet space",
      "extreme_values": "Clip to reasonable ranges; investigate cause"
    }
  },

  "citations_and_references": {
    "primary_reference": {
      "full_citation": "Kent, R. D., & Read, C. (1992). The Acoustic Analysis of Speech (2nd ed.). Singular Publishing Group.",
      "isbn": "978-0750697704",
      "chapters_used": ["2", "3", "4", "5", "6", "7"]
    },
    "supplementary_references": [
      "Baken, R. J., & Orlikoff, R. F. (1999). Clinical Measurement of Speech and Voice (2nd ed.). Singular Publishing Group.",
      "Behrman, A. (2013). Speech and Voice Science: Anatomy, Physiology, Acoustics, & Perception. Plural Publishing.",
      "Titze, I. R. (2000). Principles of Voice Production (2nd ed.). National Center for Voice and Speech."
    ],
    "how_to_cite_in_app": "Based on 'The Acoustic Analysis of Speech' (Kent & Read, 1992), Chapter 6: Harmonics-to-Noise Ratio"
  }
}
```

---

## 📌 Integration Checklist

This schema feeds directly into your implementation:

- [x] **Metric definitions** grounded in academic sources
- [x] **Calculation methods** with mathematical formulas
- [x] **Normative patterns** for validation
- [x] **Interpretation guidelines** for user-facing copy
- [x] **Implementation notes** for engineers
- [x] **Error handling** strategies
- [x] **Citations** for credibility

---

## 🎯 Next Steps

1. **Save this schema** as reference during `brandedMetricsEngine.ts` implementation
2. **Reference specific chapters** when coding each metric
3. **Use normative patterns** for validation and thresholding
4. **Cite sources** in code comments using the citation format provided
5. **Test implementations** against expected ranges from this document

---

**Version:** 1.0  
**Status:** 🟢 Ready for Implementation  
**Last Updated:** November 17, 2025
