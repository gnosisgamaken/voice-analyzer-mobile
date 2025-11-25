# Book Source Schema: Clinical Measurement of Speech and Voice

**Book:** Clinical Measurement of Speech and Voice  
**Authors:** Baken & Orlikoff  
**Edition:** 3rd (1999)  
**Primary Use:** Clinical grounding, normative patterns, measurement protocols, reliability guidelines  
**Status:** 📋 Reference Schema v1.0  
**Date:** November 17, 2025

---

## 📊 Complete Clinical Reference Schema

```json
{
  "metadata": {
    "book_title": "Clinical Measurement of Speech and Voice",
    "authors": ["Robert J. Baken", "Robert F. Orlikoff"],
    "publication_year": 1999,
    "edition": "2nd",
    "publisher": "Singular Publishing Group",
    "relevance_to_app": "Clinical validation, normative data, measurement protocols, reliability thresholds",
    "priority_level": "🔴 CRITICAL",
    "chapters_count": 10,
    "key_chapters": ["2", "3", "4", "5", "6", "7", "8"],
    "estimated_read_time_hours": 35,
    "implementation_priority": "Week 1-2 (parallel with Kent & Read)",
    "complementary_to": "Kent & Read provides theory; Baken & Orlikoff provides clinical application"
  },
  "measurement_integrity_constraints": {
    "microphone_distance_requirement_cm": "Maintain a constant mouth-to-microphone distance (≈ 15-20 cm) when collecting perturbation or shimmer data; any deviation invalidates comparisons.",
    "calibration_expectation": "Calibrate microphones / recording chains before clinical sessions; document gain settings inside each recording metadata block.",
    "norm_skepticism_note": "Treat undocumented 'norms' in commercial software with skepticism; only surface ranges that cite source chapter + table.",
    "physiological_linkage_requirement": "Every reported metric must explicitly describe the physiological aspect it represents (respiratory, phonatory, articulatory)."
  },

  "global_models": [
    {
      "id": "model_clinical_framework",
      "name": "Clinical Voice Measurement Framework",
      "summary": "A systematic approach to voice assessment that combines acoustic measurement with perceptual evaluation and physiologic understanding. This framework ensures measurements are valid, reliable, and clinically meaningful—not just technically accurate.",
      "theoretical_importance": "APPLIED — Bridges acoustic theory to real-world clinical diagnosis",
      "core_principles": [
        "Measurement reliability is as important as accuracy",
        "Normative data must account for age, sex, and context",
        "Single metrics are insufficient; multiple measures provide complete picture",
        "Perceptual assessment validates acoustic findings",
        "Context matters: conversation ≠ sustained phonation ≠ singing"
      ],
      "measurement_categories": [
        {
          "category": "Acoustic Measures",
          "examples": ["F0", "Jitter", "Shimmer", "HNR", "Formants"],
          "purpose": "Objective, reproducible, quantifiable"
        },
        {
          "category": "Perceptual Measures",
          "examples": ["GRBASI scale", "Listener impressions"],
          "purpose": "Validate what listeners actually hear"
        },
        {
          "category": "Physiologic Measures",
          "examples": ["Laryngoscopy", "Spirometry"],
          "purpose": "Understand underlying mechanism"
        },
        {
          "category": "Functional Measures",
          "examples": ["Voice Handicap Index", "Quality of life"],
          "purpose": "Impact on daily living"
        }
      ],
      "usage_notes": "Your app should use Baken & Orlikoff's framework as guide for which metrics matter clinically, not just which are easy to measure.",
      "chapters": ["1", "2", "3"],
      "application_to_voice_analyzer": {
        "voice_health_metric": "Should combine HNR + Jitter + Shimmer (Baken's trifecta for voice pathology detection)",
        "confidence_metric": "Should track F0 stability AND perceptual steadiness (not just variability)",
        "normative_comparison": "Always compare to age/sex-matched baselines, not universal thresholds"
      }
    }
  ],

  "acoustic_metrics_clinical": [
    {
      "id": "metric_f0_clinical",
      "metric_name": "Speaking Fundamental Frequency (SF0) — Clinical Context",
      "app_metric_name": "Confidence (pitch baseline)",
      "chapter_sources": ["3", "4"],
      "definition": "The average fundamental frequency during conversational or read speech. Clinically significant because abnormal SF0 may indicate pathology or vocal effort.",
      "physiological_linkage_note": "Reflects laryngeal tension and vocal fold mass/stiffness changes driven by respiratory drive and endocrine influences.",
      "units": "Hz",
      "clinical_significance": "Departure from expected SF0 can indicate: vocal effort, fatigue, pathology, age progression, or hormonal changes",
      "normative_data": {
        "adult_male": {
          "mean_hz": 120,
          "range_hz": "85-180",
          "age_reference": "20-40 years",
          "source": "Baken & Orlikoff, Table 3.1"
        },
        "adult_female": {
          "mean_hz": 220,
          "range_hz": "165-255",
          "age_reference": "20-40 years",
          "source": "Baken & Orlikoff, Table 3.1"
        },
        "prepubertal_child": {
          "mean_hz": 260,
          "range_hz": "200-300",
          "age_reference": "5-10 years",
          "note": "Both boys and girls similar at this age"
        },
        "adolescent_male": {
          "mean_hz": 165,
          "range_hz": "120-180",
          "age_reference": "11-16 years",
          "note": "Rapid changes during voice break"
        },
        "elderly_male": {
          "mean_hz": 112,
          "range_hz": "80-150",
          "age_reference": "65+ years",
          "note": "Slight lowering due to laryngeal changes"
        },
        "elderly_female": {
          "mean_hz": 180,
          "range_hz": "140-220",
          "age_reference": "65+ years",
          "note": "Lowering post-menopause due to hormonal changes"
        }
      },
      "interpretation": {
        "clinical_red_flags": [
          "SF0 significantly lower than expected → laryngeal fatigue, vocal damage, hormone deficiency",
          "SF0 significantly higher than expected → vocal strain, anxiety, pitch forcing",
          "Rapid SF0 change over time → possible laryngeal pathology, thyroid issues"
        ],
        "contextual_variations": {
          "conversation": "Natural, representative of typical voice",
          "reading": "May be higher or lower depending on comfort",
          "singing": "Often lower (singers use more relaxed phonation)",
          "stressed_speech": "Typically higher (increased tension)"
        }
      },
      "measurement_protocol": {
        "recording_duration": "30-60 seconds of conversational speech",
        "signal_quality": "Clean recording, no background noise (SNR > 20 dB)",
        "analysis_window": "Remove first 1-2 seconds and last 1-2 seconds (onset/offset artifacts)",
        "calculation": "Mean F0 across all voiced segments"
      },
      "reliability_data": {
        "test_retest_reliability": 0.95,
        "measurement_error_hz": "±5 Hz typical",
        "source": "Baken & Orlikoff, Chapter 3"
      },
      "limitations_clinical": [
        "Single SF0 value insufficient for diagnosis",
        "Must be interpreted with F0 variability (contour)",
        "Affected by recording conditions, microphone, background noise",
        "Users may alter SF0 when aware of recording"
      ],
      "implementation_notes": {
        "your_app_uses": "Track SF0 as part of baseline establishment",
        "user_message": "Your speaking pitch is 125 Hz. This is typical for adult males.",
        "tracking": "Monitor gradual shifts over weeks/months (fatigue indicator)",
        "confidence_metric": "Combine SF0 stability with F0 variability; steady SF0 = confidence"
      }
    },

    {
      "id": "metric_jitter_clinical",
      "metric_name": "Jitter — Clinical Perspective",
      "app_metric_name": "Confidence & Health (vocal stability)",
      "chapter_sources": ["6", "7"],
      "definition": "Cycle-to-cycle F0 perturbation. Clinically used to detect irregularity in vocal fold vibration indicating pathology.",
      "physiological_linkage_note": "Captures the steadiness of vocal fold oscillation (phonatory subsystem) and must be interpreted alongside laryngeal findings and respiratory drive.",
      "units": "Percent (%) or Relative Average Perturbation (RAP, dimensionless)",
      "clinical_significance": "Elevated jitter is hallmark of laryngeal pathology. One of the most sensitive acoustic indicators of dysphonia.",
      "normative_data": {
        "healthy_adult_male": {
          "jitter_percent": "0.5-1.0%",
          "jitter_rap": "0.5-1.0%",
          "classification": "Normal"
        },
        "healthy_adult_female": {
          "jitter_percent": "0.5-1.2%",
          "jitter_rap": "0.5-1.2%",
          "classification": "Normal"
        },
        "mild_dysphonia": {
          "jitter_percent": "1.5-3.0%",
          "classification": "Abnormal but subtle"
        },
        "moderate_dysphonia": {
          "jitter_percent": "3.0-5.0%",
          "classification": "Clear pathology"
        },
        "severe_dysphonia": {
          "jitter_percent": "> 5.0%",
          "classification": "Significant vocal fold dysfunction"
        },
        "source": "Baken & Orlikoff, Table 6.2; Titze normative data"
      },
      "pathology_correlation": {
        "elevated_jitter_indicates": [
          "Vocal fold scar or stiffness",
          "Laryngeal paralysis",
          "Spasmodic dysphonia",
          "Parkinson's disease (voice tremor + jitter)",
          "Vocal nodules or polyps",
          "Swelling or edema",
          "Age-related vocal fold changes (presbylarynx)"
        ]
      },
      "measurement_protocol": {
        "phonation_type": "Sustained /a/ on comfortable pitch (30+ seconds ideal)",
        "alternative": "Continuous speech, extract voiced segments",
        "signal_quality": "High SNR (> 20 dB), no distortion",
        "analysis_method": "RAP or Jitter Factor (standardize on one method)",
        "note": "Different software gives different values; consistency matters more than absolute value"
      },
      "reliability_data": {
        "test_retest_reliability": 0.80,
        "inter_rater_reliability": 0.75,
        "measurement_variability": "High sensitivity to: recording conditions, microphone, analysis settings",
        "source": "Baken & Orlikoff, Chapter 6"
      },
      "clinical_decision_thresholds": {
        "normal": "< 1.04%",
        "borderline": "1.04-1.5%",
        "abnormal": "> 1.5%"
      },
      "limitations_clinical": [
        "Very sensitive to noise; high SNR critical",
        "Fails with severely dysphonic voices (too irregular to measure accurately)",
        "Different algorithms yield different values; must standardize",
        "Age and sex must be considered in interpretation"
      ],
      "implementation_notes": {
        "your_app_uses": "RAP for calculation (most standardized)",
        "confidence_metric": "Low jitter = high confidence (stable pitch)",
        "health_metric": "High jitter = concern (possible pathology)",
        "user_message_normal": "Pitch stability: Excellent. Your vocal folds vibrate very regularly.",
        "user_message_elevated": "Pitch stability: Slightly irregular. This may indicate fatigue or strain.",
        "red_flag": "If jitter > 3%, suggest consulting SLP/ENT"
      }
    },

    {
      "id": "metric_shimmer_clinical",
      "metric_name": "Shimmer — Clinical Perspective",
      "app_metric_name": "Health (amplitude stability)",
      "chapter_sources": ["6", "7"],
      "definition": "Cycle-to-cycle amplitude perturbation. Indicates irregular vocal fold closure or incomplete glottal closure.",
      "physiological_linkage_note": "Represents consistency of glottal closure strength (interaction of phonatory and respiratory subsystems); deviations point to mucosal or neuromuscular issues.",
      "units": "Percent (%) or Amplitude Perturbation Quotient (APQ, dimensionless)",
      "clinical_significance": "Elevated shimmer indicates irregular vocal fold closure, often associated with breathy, weak, or dysphonic voice.",
      "normative_data": {
        "healthy_adult_male_db": {
          "mean_db": 0.39,
          "sd_db": 0.31,
          "classification": "Normal",
          "source": "Baken & Orlikoff (1999)"
        },
        "healthy_adult_female_db": {
          "mean_db": 0.25,
          "sd_db": 0.11,
          "classification": "Normal",
          "source": "Baken & Orlikoff (1999)"
        },
        "healthy_adult_percent": {
          "shimmer_percent": "3.0-5.0%",
          "classification": "Normal",
          "note": "Percent values roughly align with the dB means when SNR is high"
        },
        "mild_dysphonia": {
          "shimmer_percent": "5.0-8.0%",
          "classification": "Mildly abnormal"
        },
        "moderate_dysphonia": {
          "shimmer_percent": "8.0-15.0%",
          "classification": "Clearly abnormal"
        },
        "severe_dysphonia": {
          "shimmer_percent": "> 15.0%",
          "classification": "Severe irregularity"
        }
      },
      "pathology_correlation": {
        "elevated_shimmer_indicates": [
          "Incomplete glottal closure (breathy voice)",
          "Vocal fold swelling or edema",
          "Laryngeal web or adhesion",
          "Vocal fold atrophy",
          "Tremor (especially in Parkinson's)",
          "Vocal fatigue"
        ]
      },
      "measurement_protocol": {
        "phonation_type": "Sustained /a/ on comfortable pitch (30+ seconds)",
        "analysis_method": "APQ or Shimmer Percent (standardize)",
        "note": "Like jitter, shimmer is sensitive to recording level; normalize if possible"
      },
      "reliability_data": {
        "test_retest_reliability": 0.75,
        "note": "Lower than jitter; more affected by recording conditions"
      },
      "clinical_decision_thresholds": {
        "normal": "< 3.8%",
        "borderline": "3.8-5.0%",
        "abnormal": "> 5.0%"
      },
      "limitations_clinical": [
        "Very sensitive to recording level (absolute amplitude matters)",
        "Microphone distortion introduces false shimmer",
        "Cannot be reliably measured from quiet voices",
        "Less standardized than jitter across software platforms"
      ],
      "implementation_notes": {
        "your_app_uses": "APQ for calculation",
        "health_metric": "Low shimmer = healthy amplitude control",
        "user_message_normal": "Amplitude stability: Steady. Your voice maintains consistent strength.",
        "user_message_elevated": "Amplitude stability: Fluctuating. You may be experiencing fatigue or strain.",
        "tracking": "Monitor shimmer over time; increase = worsening (fatigue indicator)"
      }
    },

    {
      "id": "metric_hnr_clinical",
      "metric_name": "Harmonics-to-Noise Ratio (HNR) — Clinical Gold Standard",
      "app_metric_name": "Vocal Health (clinical indicator)",
      "chapter_sources": ["6", "8"],
      "definition": "Ratio of harmonic (periodic) to noise (aperiodic) energy in the voice source. THE most clinically validated measure of voice quality.",
      "units": "dB (decibels) or dimensionless ratio",
      "clinical_significance": "HNR is the single most reliable acoustic indicator of vocal pathology. Used in virtually all clinical voice labs.",
      "normative_data": {
        "healthy_adult_male": {
          "hnr_db": "> 12 dB",
          "hnr_ratio": "> 16:1",
          "classification": "Normal"
        },
        "healthy_adult_female": {
          "hnr_db": "> 10 dB",
          "hnr_ratio": "> 10:1",
          "classification": "Normal"
        },
        "mild_dysphonia": {
          "hnr_db": "6-10 dB",
          "hnr_ratio": "4-10:1",
          "classification": "Noticeable noise component"
        },
        "moderate_dysphonia": {
          "hnr_db": "0-6 dB",
          "hnr_ratio": "1-4:1",
          "classification": "Substantial noise"
        },
        "severe_dysphonia": {
          "hnr_db": "< 0 dB",
          "hnr_ratio": "< 1:1",
          "classification": "More noise than harmony; nearly whispered"
        },
        "source": "Baken & Orlikoff, Table 6.3; Gold standard clinical reference"
      },
      "pathology_correlation": {
        "low_hnr_indicates": [
          "Vocal fold pathology (nodules, polyps, scar)",
          "Incomplete glottal closure (bowing, atrophy)",
          "Dysphonia of any type",
          "Vocal fatigue",
          "Laryngeal swelling or inflammation"
        ],
        "clinical_utility": "HNR drops even with subtle pathology; highly sensitive"
      },
      "measurement_protocol": {
        "phonation_type": "Sustained /a/ on comfortable pitch (30+ seconds minimum)",
        "signal_quality": "Critical: SNR > 20 dB. Background noise degrades HNR.",
        "analysis_window": "Remove beginning and end of phonation (onset/offset artifacts)",
        "frequency_range": "0-5 kHz typical for analysis",
        "method": "Spectral decomposition into harmonic and noise bands"
      },
      "reliability_data": {
        "test_retest_reliability": 0.90,
        "most_reliable_acoustic_measure": true,
        "source": "Baken & Orlikoff, Chapter 6"
      },
      "clinical_decision_thresholds": {
        "definitely_normal": "> 12 dB",
        "probably_normal": "10-12 dB",
        "borderline": "6-10 dB (recommend referral)",
        "abnormal": "< 6 dB (refer to SLP/ENT)"
      },
      "limitations_clinical": [
        "Requires accurate F0 identification (fails if pitch is very low/high)",
        "Extremely sensitive to background noise; requires quiet recording environment",
        "Microphone quality critical",
        "Cannot measure in whispered or extremely dysphonic voices (too aperiodic)"
      ],
      "implementation_notes": {
        "your_app_uses": "HNR in dB; convert to 0-100 scale for display (0 dB = 0, 20 dB = 100)",
        "health_metric": "HNR is PRIMARY health indicator; high HNR = healthy voice",
        "user_message_excellent": "Vocal Health: Excellent. Your voice is clear and efficient.",
        "user_message_good": "Vocal Health: Good. Minor noise is normal and expected.",
        "user_message_fair": "Vocal Health: Fair. Some voice strain detected; consider rest.",
        "user_message_poor": "Vocal Health: Poor. Significant voice fatigue or hoarseness. Consider rest or consulting a specialist.",
        "clinical_note": "If HNR < 5 dB and persistent, recommend SLP/ENT referral",
        "validation": "HNR is most scientifically grounded metric in your app"
      }
    },

    {
      "id": "metric_formants_clinical",
      "metric_name": "Formant Frequencies — Clinical Voice Assessment",
      "app_metric_name": "Warmth & Clarity (articulatory precision)",
      "chapter_sources": ["4", "5"],
      "definition": "Vocal tract resonance frequencies. Clinically used to evaluate vowel clarity, articulation, and presence of dysarthria.",
      "units": "Hz",
      "clinical_significance": "Reduced vowel space (compressed F1-F2 area) is indicator of dysarthria or motor speech disorder.",
      "normative_data": {
        "american_english_vowels_male": {
          "vowel_i": {"f1": 270, "f2": 2290},
          "vowel_e": {"f1": 400, "f2": 1960},
          "vowel_a": {"f1": 560, "f2": 1040},
          "vowel_o": {"f1": 590, "f2": 920},
          "vowel_u": {"f1": 330, "f2": 635}
        },
        "american_english_vowels_female": {
          "vowel_i": {"f1": 310, "f2": 2790},
          "vowel_e": {"f1": 430, "f2": 2330},
          "vowel_a": {"f1": 640, "f2": 1370},
          "vowel_o": {"f1": 760, "f2": 1160},
          "vowel_u": {"f1": 370, "f2": 950}
        },
        "source": "Baken & Orlikoff, Figure 4.3; Kent & Read normative data"
      },
      "interpretation": {
        "high_f1": "Low tongue position (open vowels like /a/)",
        "low_f1": "High tongue position (close vowels like /i/, /u/)",
        "high_f2": "Front tongue position (front vowels like /i/, /e/)",
        "low_f2": "Back tongue position (back vowels like /u/, /o/)",
        "clinical_concern": "Compressed vowel space (all vowels clustered together) indicates dysarthria or imprecise articulation"
      },
      "vowel_space_measurement": {
        "definition": "Area enclosed by F1-F2 plot of corner vowels (/i/, /a/, /u/)",
        "clinical_use": "Dysarthric speakers show significantly reduced vowel space",
        "calculation": "Area on F1-F2 plot (units: Hz²)",
        "normal_adult": "~ 500,000-700,000 Hz²",
        "dysarthric": "< 300,000 Hz² (severely reduced)",
        "source": "Baken & Orlikoff, Chapter 5"
      },
      "measurement_protocol": {
        "phonation_type": "Sustained vowels (/a/, /i/, /u/) or vowel in nonsense syllables",
        "duration": "1-2 seconds per vowel (stable, steady-state portion)",
        "analysis_method": "LPC formant tracking (standard in speech labs)",
        "lpc_order": "10-12 for formant extraction"
      },
      "reliability_data": {
        "test_retest_reliability": 0.85,
        "note": "Lower than jitter/shimmer; depends on vowel production stability"
      },
      "limitations_clinical": [
        "High-pitched voices have formants closer together; harder to track",
        "Nasal consonants alter formant patterns",
        "Micro-phone frequency response affects measurements",
        "Vowel space is useful but not sole indicator of articulation"
      ],
      "implementation_notes": {
        "your_app_uses": "F1 for warmth (lower F1 = rounder vowels)",
        "clarity_metric": "F2 and formant definition (sharp vs. blurry peaks)",
        "user_message": "Articulation: Clear. Your vowels are distinct and well-defined.",
        "tracking": "Monitor formant stability; changes may indicate fatigue or articulatory changes"
      }
    }
  ],

  "measurement_quality_standards": [
    {
      "id": "standard_signal_to_noise_ratio",
      "name": "Signal-to-Noise Ratio (SNR)",
      "importance": "CRITICAL for all acoustic measurements",
      "definition": "Ratio of voice signal energy to background noise energy",
      "units": "dB",
      "acceptable_snr_db": "> 20 dB",
      "excellent_snr_db": "> 30 dB",
      "poor_snr_db": "< 15 dB (compromises HNR, jitter, shimmer)",
      "impact_if_poor": "All perturbation measures become unreliable; HNR artificially lowered",
      "how_to_improve": "Quiet room, close microphone placement (6-12 inches), avoid background noise"
    },
    {
      "id": "standard_recording_level",
      "name": "Recording Level / Amplitude Normalization",
      "importance": "CRITICAL for shimmer measurement",
      "definition": "Peak amplitude of recorded voice signal",
      "units": "dB or linear amplitude",
      "optimal_peak_level": "-6 dB to -3 dB (headroom to prevent clipping)",
      "impact_of_clipping": "Distortion introduces spurious shimmer; signal becomes useless",
      "impact_of_too_quiet": "Low SNR; small amplitude changes are noise",
      "how_to_measure": "RMS level should be ~ -20 to -12 dB (for typical speech)"
    },
    {
      "id": "standard_microphone_distance",
      "name": "Microphone Distance & Placement",
      "importance": "CRITICAL",
      "definition": "Distance between microphone and mouth during recording",
      "units": "inches or cm",
      "optimal_distance": "6-12 inches (15-30 cm)",
      "too_close_problems": "Plosives, mouth noise, proximity effect (bass boost)",
      "too_far_problems": "Low signal level, increased noise, poor frequency response",
      "consistency": "MUST be consistent across recordings; small changes affect absolute measurements",
      "note": "Shimmer values cannot be compared across different distances without normalization"
    }
  ],

  "measurement_protocols_clinical": [
    {
      "id": "protocol_sustained_phonation",
      "name": "Sustained Phonation Protocol",
      "use_case": "Measuring jitter, shimmer, HNR (clinical gold standard)",
      "steps": [
        "1. Instruct subject: 'Produce a steady, comfortable note on the vowel /a/ (as in 'father'). Try to keep it as steady as possible.'",
        "2. Subject phonates for 30-60 seconds",
        "3. Record middle 15-20 seconds (discard onset/offset artifacts)",
        "4. Ensure SNR > 20 dB"
      ],
      "advantages": [
        "Stable, quasiperiodic signal ideal for perturbation measurement",
        "Removes linguistic/cognitive variability",
        "Standardizable across subjects"
      ],
      "limitations": [
        "Not representative of natural speech",
        "Unnatural task; some subjects struggle",
        "Fatigue effects after 60+ seconds"
      ],
      "normative_data_available": true,
      "source": "Baken & Orlikoff, Clinical Protocol"
    },
    {
      "id": "protocol_connected_speech",
      "name": "Connected Speech Protocol",
      "use_case": "Measuring F0, formants, natural voice quality",
      "steps": [
        "1. Subject reads passage or speaks naturally for 30-60 seconds",
        "2. Extract voiced segments (automatic or manual)",
        "3. Analyze acoustic features across connected speech"
      ],
      "advantages": [
        "Representative of natural use",
        "Captures linguistic and prosodic variation",
        "More ecological validity"
      ],
      "limitations": [
        "More variability in measurements",
        "Difficult to extract clean voiced segments",
        "Confounded by linguistic content"
      ],
      "recommended_text": "Rainbow Passage (standardized text for English speakers)",
      "source": "Baken & Orlikoff, Clinical Protocol"
    }
  ],

  "perceptual_validation": [
    {
      "id": "scale_grbasi",
      "name": "GRBASI Scale (Perceptual Voice Quality)",
      "importance": "Validates acoustic findings with listener perception",
      "components": [
        {
          "letter": "G",
          "meaning": "Grade (overall severity of hoarseness)",
          "scale": "0-3 (0=normal, 3=severely dysphonic)"
        },
        {
          "letter": "R",
          "meaning": "Roughness (irregular vibration)",
          "scale": "0-3 (correlates with jitter)"
        },
        {
          "letter": "B",
          "meaning": "Breathiness (incomplete closure)",
          "scale": "0-3 (correlates with HNR, shimmer)"
        },
        {
          "letter": "A",
          "meaning": "Asthenia (weakness, low power)",
          "scale": "0-3 (correlates with RMS, jitter)"
        },
        {
          "letter": "S",
          "meaning": "Strain (effort, tension)",
          "scale": "0-3 (correlates with F0 elevation, tension)"
        },
        {
          "letter": "I",
          "meaning": "Instability (variability over time)",
          "scale": "0-3 (correlates with shimmer, jitter)"
        }
      ],
      "use_in_app": "Future feature: Ask user 'How would you rate your voice quality?' map to GRBASI scale",
      "validation": "Compare GRBASI ratings to acoustic metrics; should correlate",
      "source": "Baken & Orlikoff, Chapter 8"
    }
  ],

  "clinical_interpretation_guidelines": {
    "when_metrics_are_abnormal": [
      {
        "scenario": "High Jitter + High Shimmer + Low HNR",
        "interpretation": "Strong evidence of vocal pathology (nodules, scar, paralysis, etc.)",
        "recommendation": "User should see SLP/ENT for laryngoscopy"
      },
      {
        "scenario": "High Shimmer + Normal Jitter + Borderline HNR",
        "interpretation": "Incomplete glottal closure or breathy voice (possible bowing, atrophy)",
        "recommendation": "Vocal rest, voice therapy evaluation"
      },
      {
        "scenario": "High Jitter + Normal Shimmer + Normal HNR",
        "interpretation": "Mild irregularity; may be normal variation or early pathology",
        "recommendation": "Monitor over time; recheck in 2 weeks"
      },
      {
        "scenario": "All metrics normal but user reports hoarseness",
        "interpretation": "Perceptual symptoms without acoustic correlate (functional dysphonia?)",
        "recommendation": "Consider psychological factors; refer to SLP"
      }
    ],
    "temporal_interpretation": [
      {
        "pattern": "Metrics degrade over recording session (fatigue)",
        "meaning": "Voice tires quickly; may indicate vocal strain or pathology",
        "user_message": "Your voice is stable at first but fatigues as you speak. Rest helps."
      },
      {
        "pattern": "Metrics improve over multiple days of rest",
        "meaning": "Temporary strain or swelling; not permanent pathology",
        "user_message": "Your voice bounced back with rest. Keep hydration and voice care."
      },
      {
        "pattern": "Metrics persistently abnormal despite rest",
        "meaning": "Chronic pathology; needs professional evaluation",
        "user_message": "Your voice isn't improving with rest. See a specialist."
      }
    ]
  },

  "citations_and_references": {
    "primary_reference": {
      "full_citation": "Baken, R. J., & Orlikoff, R. F. (1999). Clinical Measurement of Speech and Voice (2nd ed.). Singular Publishing Group.",
      "isbn": "978-1597566742",
      "chapters_used": ["2", "3", "4", "5", "6", "7", "8"]
    },
    "supplementary_references": [
      "Kent, R. D., & Read, C. (1992). The Acoustic Analysis of Speech (2nd ed.). Singular Publishing Group.",
      "Titze, I. R. (2000). Principles of Voice Production (2nd ed.). National Center for Voice and Speech.",
      "Behrman, A. (2013). Speech and Voice Science. Plural Publishing."
    ],
    "how_to_cite_in_app": "Based on clinical normative data (Baken & Orlikoff, 1999), Table 6.3: Harmonics-to-Noise Ratio"
  }
}
```

---

## 📌 Key Differences: Kent & Read vs. Baken & Orlikoff

| Aspect | Kent & Read | Baken & Orlikoff |
|--------|------------|-----------------|
| **Focus** | Acoustic theory & methods | Clinical application & validation |
| **Audience** | Engineers, researchers | Clinicians, SLPs, diagnosticians |
| **Emphasis** | "How to measure" | "What normal looks like" |
| **Normative Data** | Mentioned, not detailed | Extensive tables and thresholds |
| **Pathology** | Described, not quantified | Clinical decision thresholds provided |
| **Reliability** | Theory of measurement error | Empirical reliability coefficients |

**For Your App:**
- Use **Kent & Read** for metric definitions and calculation methods
- Use **Baken & Orlikoff** for normative ranges and clinical interpretation
- Combine both for credibility and accuracy

---

## 🎯 Implementation Roadmap (Using This Schema)

**Week 1:**
- Extract normative data tables from Baken & Orlikoff
- Create thresholds for "normal," "borderline," "abnormal" for each metric
- Build validation logic into `brandedMetricsEngine.ts`

**Week 2:**
- Implement measurement protocol guidelines (SNR, recording level, microphone distance)
- Add quality checks to alert users if recording conditions are poor
- Implement error handling for edge cases

**Week 3-4:**
- Write in-app education content using Baken's clinical frameworks
- Create user-facing interpretations of abnormal metrics
- Implement GRBASI-like perceptual validation (future feature)

**Week 5-8:**
- Add temporal tracking (fatigue, improvement, persistence patterns)
- Build clinical interpretation logic (when to recommend SLP/ENT referral)
- Create shareable "voice health report" based on clinical standards

---

## ✅ Quality Assurance Checklist

- [ ] All normative data from Baken & Orlikoff (Tables 3.1, 4.3, 6.2, 6.3)
- [ ] Measurement protocols follow clinical standards
- [ ] Thresholds for "abnormal" are evidence-based
- [ ] Reliability coefficients documented
- [ ] Error handling for poor recording quality
- [ ] User can see why a metric is flagged as abnormal
- [ ] Professional disclaimers included ("Not a diagnostic tool")
- [ ] SLP/ENT referral logic implemented

---

**Version:** 1.0  
**Status:** 🟢 Ready for Implementation  
**Complementary To:** ACOUSTIC_ANALYSIS_SOURCE_SCHEMA.md (Kent & Read)  
**Last Updated:** November 17, 2025
