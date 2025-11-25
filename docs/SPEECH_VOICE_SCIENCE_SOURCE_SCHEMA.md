# Book Source Schema: Speech and Voice Science

**Book:** Speech and Voice Science: Anatomy, Physiology, Acoustics & Perception  
**Author:** Alison Behrman  
**Edition:** 2nd (2013)  
**Primary Use:** User education, lay language explanations, subsystem understanding, clinical case patterns  
**Status:** 📋 Reference Schema v1.0  
**Date:** November 17, 2025

---

## 📊 Complete Speech and Voice Science Schema

```json
{
  "metadata": {
    "book_title": "Speech and Voice Science: Anatomy, Physiology, Acoustics & Perception",
    "author": "Alison Behrman",
    "publication_year": 2013,
    "edition": "2nd",
    "publisher": "Plural Publishing",
    "relevance_to_app": "Translating technical metrics into understandable user education, bridging anatomy-acoustics-perception",
    "priority_level": "🟡 HIGH",
    "chapters_count": 10,
    "key_chapters": ["3", "4", "5", "6", "7", "8", "9"],
    "estimated_read_time_hours": 30,
    "implementation_priority": "Week 3-4 (after metrics are calculated)",
    "unique_value": "Best source for user-facing explanations and non-technical analogies",
    "complements": [
      "Kent & Read: Technical foundations",
      "Baken & Orlikoff: Clinical validation",
      "Behrman: User understanding"
    ]
  },

  "core_concepts": [
    {
      "id": "concept_pitch",
      "name": "Pitch",
      "lay_definition": "How high or low a voice sounds to the listener. The 'note' your voice is hitting.",
      "technical_definition": "The **perceptual correlate of frequency**. Frequency is the physical rate of vibration of the vocal folds, measured as cycles per second (Hertz, Hz).",
      "physiological_basis": "The **rate of oscillation (F0)** of the vocal folds, controlled primarily by:",
      "controlling_factors": [
        "Vocal fold tissue stiffness (higher stiffness → higher pitch)",
        "Vocal fold tension (increased tension → higher pitch)",
        "Vocal fold mass/density (higher mass → lower pitch)",
        "Vocal fold length (longer folds → lower pitch)"
      ],
      "acoustic_correlates": [
        "Fundamental Frequency (F0) in Hz",
        "Harmonic spacing (regularly spaced overtones)",
        "Pitch contour (F0 over time)"
      ],
      "perceptual_characteristics": {
        "frequency_perception_is_logarithmic": "Doubling frequency doesn't sound like double the pitch to human ears",
        "influenced_by_context": "Pitch perception depends on loudness and timbre too, not just frequency"
      },
      "common_misconceptions": [
        "❌ Pitch IS frequency (they're correlated but not identical)",
        "❌ Higher pitch always means higher F0 (intensity and spectral shape matter too)",
        "✅ Correct: Pitch is what the EAR perceives; frequency is what we MEASURE"
      ],
      "user_facing_explanation": "Your Confidence metric measures pitch stability. A steady pitch (low variability in F0) signals confident, controlled voice production. When your confidence dips, it often means vocal fatigue or excessive effort.",
      "app_metric_connection": "Confidence",
      "chapter_reference": "3, 4"
    },

    {
      "id": "concept_loudness",
      "name": "Loudness",
      "lay_definition": "How intense or soft a sound is perceived. Like turning the volume dial on a radio.",
      "technical_definition": "The **perceptual correlate of intensity**. Intensity is the relative power of a sound, measured logarithmically in decibels of sound pressure level (dB SPL).",
      "physiological_basis": "Primarily dependent on the amount of **air pressure (subglottal pressure)** underneath the vocal folds. Also involves:",
      "controlling_factors": [
        "Subglottal pressure (lung support)",
        "Glottal adduction (how tightly vocal folds close)",
        "Airflow rate (how fast air moves through)",
        "Vocal fold length and thickness (affect vibration efficiency)"
      ],
      "acoustic_correlates": [
        "Intensity (dB SPL, Sound Pressure Level)",
        "RMS amplitude (magnitude of vibration)",
        "Peak amplitude (highest point of waveform)"
      ],
      "perception_is_nonlinear": {
        "key_fact": "For a sound to be perceived as TWICE as loud, intensity must increase by a factor of 10 (10 dB)",
        "implication": "Small acoustic changes in dB can feel like big loudness changes to your ears"
      },
      "common_misconceptions": [
        "❌ Loudness grows linearly with intensity (it doesn't—it's logarithmic)",
        "❌ Shouting = just more air pushed out (effort matters more than volume)",
        "✅ Correct: Efficient loudness comes from breath support + vocal fold control"
      ],
      "efficiency_vs_economy_note": "Behrman emphasizes balancing aerodynamic efficiency with vocal economy: extremely high intensity per cmH₂O increases collision/shear stress and reduces longevity.",
      "user_facing_explanation": "Your Power metric measures vocal projection ability. High power reflects efficient breath support and vocal fold engagement. If power drops during a session, it signals fatigue or reduced breath support.",
      "app_metric_connection": "Power",
      "chapter_reference": "4, 5"
    },

    {
      "id": "concept_resonance",
      "name": "Resonance",
      "lay_definition": "The full, warm, resonant quality that makes a voice sound attractive and project efficiently. The 'amplifier' effect.",
      "technical_definition": "A **large increase in amplitude of vibration** when energy is applied at a natural frequency (Formant) of an acoustic space (the vocal tract).",
      "physiological_basis": "The vocal tract (air column above the vocal folds) acts as a **dynamic acoustic filter**. Changing vocal tract shape (via articulation) changes its natural resonant frequencies, selectively amplifying specific parts of the sound.",
      "the_filter_analogy": {
        "description": "Imagine the raw voice from your vocal folds as 'white noise.' The vocal tract is like a graphic equalizer that boosts some frequencies and cuts others.",
        "visual": "Source (vocal folds) → Raw buzz | Filter (vocal tract) → Shaped sound"
      },
      "acoustic_correlates": [
        "Formant frequencies (F1, F2, F3, F4, etc.)",
        "Spectral peaks (visible as bright spots in spectrogram)",
        "Singer's formant: Energy clustering around 2500-3000 Hz (aids projection in singers)"
      ],
      "what_affects_resonance": [
        "Vowel quality (different vowels = different formant patterns)",
        "Mouth opening (wider opening → different resonance)",
        "Jaw position and tension (affects tract shape)",
        "Nasal coupling (affects spectral shape)",
        "Overall vocal tract length and shape"
      ],
      "common_misconceptions": [
        "❌ Resonance = just 'opening your throat' (it's more complex—vocal tract shape matters)",
        "❌ Resonance is only for singers (all speakers benefit from efficient resonance)",
        "✅ Correct: Good resonance = efficient amplification of vocal fold vibration"
      ],
      "user_facing_explanation": "Your Warmth and Clarity metrics measure resonance quality. Warmth reflects formant positioning (lower F1 = rounder, warmer vowels). Clarity reflects formant definition (sharp, well-defined peaks = clear vowels). Together, they tell you if your vocal tract is optimally shaped for efficient projection.",
      "app_metric_connection": ["Warmth", "Clarity"],
      "chapter_reference": "5, 6"
    },

    {
      "id": "concept_prosody",
      "name": "Prosody",
      "lay_definition": "The rhythm, melody, and emphasis patterns that convey meaning, emotion, and attitude. The 'punctuation' of speech.",
      "technical_definition": "Features superimposed on individual sounds (vowels and consonants) encoded by variations in **F0 (pitch contour)**, **intensity (loudness)**, and **duration (timing)**.",
      "components_of_prosody": [
        {
          "component": "Intonation",
          "definition": "Pitch rises and falls (F0 contour) over an utterance",
          "function": "Signals questions, emphasis, emotion",
          "example": "'I'm FINE.' (statement) vs. 'I'm fine?' (question)"
        },
        {
          "component": "Stress",
          "definition": "Emphasis on specific syllables via increased loudness/duration",
          "function": "Distinguishes word meaning",
          "example": "'PREsent' (noun) vs. 'preSENT' (verb)"
        },
        {
          "component": "Tempo/Rate",
          "definition": "Speed of speech (syllables per second)",
          "function": "Affects emotional perception and understanding",
          "example": "Fast speech = excitement/anxiety; slow speech = emphasis/sadness"
        }
      ],
      "physiological_basis": "Requires complex coordination of three subsystems: breathing, phonation, and articulation—all integrated at the central nervous system level.",
      "acoustic_correlates": [
        "F0 contour (pitch movements)",
        "Intensity contour (loudness changes)",
        "Duration patterns (vowel length, pause timing)",
        "Spectral changes (formant shifts)"
      ],
      "clinical_significance": "Loss of prosody (monotone) is diagnostic indicator of neurological disorders (Parkinson's, dysarthria, cerebellar ataxia).",
      "common_misconceptions": [
        "❌ Prosody is just 'inflection' (it's a complex system involving pitch, loudness, and timing)",
        "❌ Prosody is optional (it's essential for meaning, emotion, and listener engagement)",
        "✅ Correct: Prosody is how we communicate BEYOND words"
      ],
      "user_facing_explanation": "Your Expressiveness metric captures prosodic variation—how much your pitch, loudness, and timing vary throughout your speech. High expressiveness = engaging, emotional delivery. Low expressiveness = monotone (which may signal fatigue or neurological changes).",
      "app_metric_connection": "Expressiveness",
      "chapter_reference": "3, 7"
    },

    {
      "id": "concept_respiratory_support",
      "name": "Respiratory Support (Breath Management)",
      "lay_definition": "The control of breath that provides the pressure and airflow necessary to sustain and power your voice.",
      "role_in_voice": "The respiratory system is the **power generator** for speech. It supplies the aerodynamic energy (subglottal pressure and airflow) that drives vocal fold vibration.",
      "physiological_basis": "Lungs generate pressure; the diaphragm (primary breathing muscle) provides control.",
      "signs_of_poor_support": [
        "Cannot sustain conversations without running out of breath",
        "Reduced loudness/power (insufficient breath pressure)",
        "Voice breaks or phonation cutoffs mid-utterance",
        "Excessive tension compensating for weak breath support",
        "Speaking while breathing IN (gasping sounds)",
        "Short Maximum Phonation Time (MPT < 15 seconds)"
      ],
      "efficient_breathing_for_voice": {
        "recommended": "Low breathing (diaphragmatic/abdominal)",
        "why": "Larger lung capacity, more expandable, provides stable, consistent pressure",
        "avoid": "High breathing (clavicular/shoulder breathing)",
        "why_avoid": "Limited capacity, tension-prone, less stable"
      },
      "relationship_to_voice_metrics": {
        "power_metric": "Directly reflects breath support efficiency",
        "clarity_metric": "Poor support → increased tension → reduced clarity",
        "health_metric": "Compensatory tension → instability (jitter, shimmer)"
      },
      "user_facing_explanation": "If your Power metric is consistently low or dropping during sessions, check your breath support. Try this: Place hand on belly. Take a slow breath, feeling your belly expand (not your chest). This efficient breathing provides steady pressure for strong, healthy voice production.",
      "app_metric_connection": ["Power", "Health"],
      "chapter_reference": "2, 3, 4"
    }
  ],

  "subsystem_explanations": [
    {
      "id": "subsystem_respiration",
      "subsystem_name": "Respiration (Breathing System)",
      "lay_explanation": "The structures (lungs, trachea, diaphragm, rib cage) that provide the foundation of speech by generating controlled airflow and pressure.",
      "role_in_voice": "**The power generator.** Converts chemical energy (oxygen consumption) into mechanical energy (air pressure).",
      "key_structures": [
        "Lungs: primary reservoir of air",
        "Diaphragm: primary breathing muscle (dome-shaped, under lungs)",
        "Rib cage: protects lungs, assists in pressure generation",
        "Trachea: windpipe, carries air to larynx"
      ],
      "key_physiological_outcomes": [
        "Subglottal pressure (air pressure pushing up on vocal folds)",
        "Airflow rate (volume of air per second)",
        "Breath group duration (how long you can sustain phonation)"
      ],
      "acoustic_outcomes": [
        "Intensity (loudness) directly correlates with subglottal pressure",
        "Maximum Phonation Time (MPT) reflects breath capacity and efficiency",
        "Sustained phonation duration reflects respiratory control"
      ],
      "clinical_relevance": {
        "what_we_measure": "Maximum Phonation Time (MPT) on a single breath",
        "normal_mpt": "15-30 seconds for adults",
        "short_mpt": "May indicate: weak breath support, vocal tension, or laryngeal pathology",
        "implications": "MPT is often low in dysarthria, Parkinson's, or functional voice disorders"
      },
      "connection_to_app_metrics": [
        "Power: Reflects breath support efficiency",
        "Health: Poor support → compensatory tension → instability"
      ],
      "chapter_reference": "2, 3"
    },

    {
      "id": "subsystem_phonation",
      "subsystem_name": "Phonation (Voice Production at the Larynx)",
      "lay_explanation": "The process in the larynx (voice box) where **vocal folds** vibrate due to lung pressure and airflow, converting a steady stream of air into a complex, periodic **raw sound source** (laryngeal buzz).",
      "role_in_voice": "**The sound generator.** Creates the fundamental frequency (pitch) and raw acoustic energy.",
      "key_structures": [
        "Larynx (voice box): sits atop trachea in the neck",
        "Vocal folds (vocal cords): two muscular structures that vibrate",
        "Glottis: the opening between vocal folds",
        "Arytenoid cartilages: control vocal fold positioning and tension"
      ],
      "how_it_works_the_bernoulli_effect": {
        "step_1": "Lungs push air up through the trachea",
        "step_2": "Air encounters closed (or nearly closed) vocal folds",
        "step_3": "Air pressure builds up below the folds (subglottal pressure)",
        "step_4": "Pressure overcomes folds' stiffness; folds are pushed open",
        "step_5": "Air rushes through the opening (the Bernoulli effect: fast-moving air = lower pressure)",
        "step_6": "Lower pressure pulls folds back together",
        "step_7": "Cycle repeats 80-250 times per second (for adults)"
      },
      "key_physiological_outcomes": [
        "Fundamental Frequency (F0): rate of vocal fold vibration",
        "Periodicity: regularity of the vibration cycle",
        "Voice Onset: quality of the sound start (breathy, hard attack, soft)"
      ],
      "acoustic_outcomes": [
        "Periodic (quasiperiodic) waveform with fundamental frequency and harmonics",
        "Spectral energy concentrated in harmonic peaks",
        "Voice quality (rough, breathy, clear)"
      ],
      "what_affects_phonation": [
        "Vocal fold tension (stiffness) → affects F0",
        "Vocal fold mass → affects F0",
        "Glottal adduction (how tightly folds close) → affects voice quality",
        "Subglottal pressure → affects intensity"
      ],
      "pathology_indicators": [
        "Irregular periodicity (jitter) → suggests vocal fold stiffness, swelling, or scar",
        "Aperiodicity (noise) → suggests incomplete glottal closure or breathiness",
        "High F0 with strain → suggests excessive tension",
        "Low F0 with breathy quality → suggests vocal fold weakness or bowing"
      ],
      "connection_to_app_metrics": [
        "Confidence: F0 stability (low jitter = confident, steady pitch)",
        "Health: HNR and jitter/shimmer (high HNR = healthy periodic vibration)",
        "Power: Intensity (driven by subglottal pressure)"
      ],
      "chapter_reference": "3, 4, 5"
    },

    {
      "id": "subsystem_resonance",
      "subsystem_name": "Resonance (Vocal Tract Filtering)",
      "lay_explanation": "The air-filled cavities above the larynx (throat, mouth, nasal cavity) that act as an **acoustic filter** to modify and amplify the raw sound, creating the unique qualities (timbre) of vowels and consonants.",
      "role_in_voice": "**The amplifier and shaper.** Takes raw laryngeal buzz and transforms it into recognizable speech sounds.",
      "key_structures": [
        "Pharynx (throat): muscular tube above larynx",
        "Oral cavity (mouth): shaped by jaw, lips, tongue",
        "Nasal cavity: connected to mouth via soft palate",
        "Soft palate (velum): can open/close nasal coupling"
      ],
      "how_it_works_the_filter": {
        "analogy": "Think of vocal tract as a graphic equalizer on stereo equipment",
        "the_source": "Larynx produces 'white noise' (energy at all frequencies)",
        "the_filter": "Vocal tract has natural resonant frequencies (Formants)",
        "the_result": "Some frequencies amplified (Formants), others dampened → unique vowel sound"
      },
      "key_concept_formants": {
        "definition": "Spectral peaks (resonances) of the vocal tract",
        "terminology": "F1, F2, F3, etc. (First, Second, Third Formant)",
        "what_affects_formants": {
          "vowel_identity": "Different vowels have characteristic formant patterns",
          "vocal_tract_shape": "Opening mouth → lower F1; moving tongue forward → higher F2",
          "speaker_characteristics": "Longer tract → lower formants; shorter tract → higher formants"
        }
      },
      "typical_formant_values_english_vowels": {
        "male_adult": {
          "vowel_ee": {"f1": 270, "f2": 2290},
          "vowel_ay": {"f1": 400, "f2": 1960},
          "vowel_ah": {"f1": 560, "f2": 1040},
          "vowel_oh": {"f1": 590, "f2": 920},
          "vowel_oo": {"f1": 330, "f2": 635}
        },
        "female_adult": {
          "vowel_ee": {"f1": 310, "f2": 2790},
          "vowel_ay": {"f1": 430, "f2": 2330},
          "vowel_ah": {"f1": 640, "f2": 1370},
          "vowel_oh": {"f1": 760, "f2": 1160},
          "vowel_oo": {"f1": 370, "f2": 950}
        }
      },
      "clinical_significance": {
        "reduced_vowel_space": "If vowels cluster together on F1-F2 plot → suggests dysarthria or imprecise articulation",
        "formant_clarity": "Sharp, well-defined formant peaks → clear articulation; blurry peaks → unclear"
      },
      "connection_to_app_metrics": [
        "Clarity: Sharp formant peaks + high spectral centroid = clear voice",
        "Warmth: Lower F1 frequencies = warm, rounded vowels"
      ],
      "chapter_reference": "5, 6"
    },

    {
      "id": "subsystem_articulation",
      "subsystem_name": "Articulation (Mouth & Tongue Movements)",
      "lay_explanation": "The rapid, coordinated movements of movable structures (tongue, lips, jaw, soft palate) that shape the vocal tract to produce consonants and modify vowels.",
      "role_in_voice": "**The sculptor.** Shapes the vocal tract to create distinct speech sounds.",
      "key_structures": [
        "Tongue: most important articulator (changes vocal tract shape dramatically)",
        "Lips: create closures for /p/, /b/, /m/; shape for vowels",
        "Jaw: opens and closes; affects vocal tract volume",
        "Soft palate (velum): controls nasal coupling",
        "Teeth and alveolar ridge: provide contact points for consonants"
      ],
      "how_articulation_works": {
        "principle": "Articulation 'rides' on phonation. You're modulating the vocal tract shape while air and voicing flow through.",
        "vowel_production": "Vocal tract remains relatively open; shape determines vowel quality",
        "consonant_production": "Vocal tract is constricted or completely blocked; release creates acoustic events"
      },
      "types_of_consonants": [
        {
          "type": "Stops/Plosives (/p/, /b/, /t/, /d/, /k/, /g/)",
          "articulation": "Complete closure, pressure buildup, sudden release",
          "acoustic_feature": "Burst of noise, followed by aspiration or voicing"
        },
        {
          "type": "Fricatives (/f/, /v/, /s/, /z/, /sh/, /th/)",
          "articulation": "Narrow constriction; air forced through turbulently",
          "acoustic_feature": "Continuous frication noise (aperiodic)"
        },
        {
          "type": "Affricates (/ch/, /j/)",
          "articulation": "Stop release into fricative",
          "acoustic_feature": "Burst followed by frication"
        },
        {
          "type": "Nasals (/m/, /n/, /ng/)",
          "articulation": "Oral closure + nasal coupling (soft palate down)",
          "acoustic_feature": "Nasal formants (lower frequency resonances)"
        }
      ],
      "clinical_relevance": {
        "dysarthria_signature": "Imprecise articulation → consonants sound weak or distorted",
        "vowel_space_compression": "All vowels sound alike (limited articulation)",
        "rate_changes": "Too fast → consonants blur; too slow → sounds artificial"
      },
      "connection_to_app_metrics": [
        "Clarity: Precise articulation → sharp acoustic contrasts",
        "Expressiveness: Articulation rate and variation → prosodic variation",
        "Warmth: Tongue positioning → resonance characteristics"
      ],
      "chapter_reference": "6, 7"
    }
  ],

  "clinical_case_patterns": [
    {
      "id": "case_vocal_nodules",
      "case_label": "Vocal Fold Nodules (Chronic Phonotrauma)",
      "anatomy": "Small, benign growths on vocal folds caused by repeated forceful voice use (shouting, chronic coughing, crying)",
      "prevalence": "Common in children, teachers, singers",
      "salient_acoustic_features": [
        "Increased roughness and breathiness",
        "Irregular mucosal wave movement",
        "**Increased jitter and shimmer** (vocal fold vibration becomes irregular)",
        "**Reduced HNR** (more noise component due to incomplete closure around nodule)",
        "Possible F0 changes (often slightly elevated due to mass effect)"
      ],
      "physiology_explanation": "The nodule acts as a mass on the vocal fold, disrupting the smooth vibratory pattern. The folds cannot close completely around the nodule, causing air leak (breathiness). The irregular closure pattern → irregular vibration (perturbation).",
      "symptoms_user_feels": [
        "Vocal fatigue (especially after extensive voice use)",
        "Strain or increased effort with voice use",
        "Difficulty with high, soft singing, or loss of singing range",
        "Hoarseness or roughness, especially at end of day",
        "May have no pain (unlike acute laryngitis)"
      ],
      "how_app_should_speak_non_diagnostically": "Your acoustic analysis shows **increased sound instability (high jitter/shimmer) and noise energy (low HNR)**. This acoustic signature suggests your vocal folds may not be closing completely or vibrating regularly. This pattern is often associated with benign tissue changes caused by chronic, forceful voice use (shouting, heavy coughing, extended talking). **What you can do:** Reduce vocal strain, practice gentle voice use, stay hydrated. **If symptoms persist:** Consulting a voice specialist (ENT or SLP) is recommended for laryngeal imaging to determine the physical status.",
      "what_metrics_show": {
        "jitter": "↑ Elevated (irregular vibration)",
        "shimmer": "↑ Elevated (amplitude variability)",
        "hnr": "↓ Reduced (noise component)",
        "f0": "→ May be normal or slightly elevated"
      },
      "recommended_actions_in_app": [
        "Alert user to elevated perturbation + noise pattern",
        "Suggest vocal rest and gentle voice use",
        "Provide voice care tips (hydration, warm-up, avoid shouting)",
        "If pattern persists > 2 weeks: suggest SLP/ENT referral",
        "Track metrics over time; improvement = healing"
      ],
      "recovery_pattern": "With voice rest and therapy, metrics normalize as nodule shrinks. Jitter and shimmer decrease; HNR improves.",
      "chapter_reference": "7, 8, 9"
    },

    {
      "id": "case_muscle_tension_dysphonia",
      "case_label": "Muscle Tension Dysphonia (MTD) / Hyperfunction",
      "anatomy": "Excessive muscular tension in larynx and surrounding structures (neck, jaw, shoulders). Not a structural problem—a functional one.",
      "prevalence": "Common in high-stress individuals, public speakers, anxious people",
      "salient_acoustic_features": [
        "**Marked restriction in both speaking F0 range and loudness (intensity) range**",
        "Pitch may be elevated or lowered depending on tension pattern",
        "May show irregular F0 and intensity due to hyperadduction (folds squeezed too tightly)",
        "Potential increase in spectral noise due to disturbed vibration mode",
        "Reduced vocal flexibility (limited pitch/loudness control)"
      ],
      "physiology_explanation": "Excessive tension → vocal folds adduct (close) too tightly → vibration becomes irregular and strained → inefficient phonation. Energy is wasted on tension rather than producing sound. Also compensates for underlying anxiety or stress.",
      "symptoms_user_feels": [
        "Pain or discomfort in throat, neck, or shoulders (especially after voice use)",
        "Vocal fatigue and reduced endurance (voice deteriorates through the day)",
        "Feeling of 'tightness' or 'lump' in throat (globus sensation)",
        "Strained-strangled or squeezed vocal quality",
        "Difficulty with smooth pitch/loudness changes (restricted range)",
        "Often worse when stressed or anxious"
      ],
      "how_app_should_speak_non_diagnostically": "Your acoustic analysis shows signs that your vocal system is working with **excessive muscular effort or tension**. This hyperfunctional pattern restricts your natural pitch and loudness flexibility, and often accompanies throat discomfort or fatigue. **Root cause:** Often linked to stress, anxiety, or compensation for other voice problems. **What you can do:** Practice gentle voice production, reduce speaking in noisy environments, manage stress. Relaxation exercises (neck stretches, deep breathing) may help. **If symptoms persist:** Voice therapy is highly effective for MTD and can teach more efficient voice production techniques.",
      "what_metrics_show": {
        "f0_range": "↓ Restricted (pitch stuck in narrow range)",
        "loudness_range": "↓ Restricted (cannot vary loudness easily)",
        "jitter": "↑ Elevated (irregular vibration from tension)",
        "expressiveness": "↓ Low (limited prosodic variation)",
        "confidence": "↓ Low (unstable, strained quality)"
      },
      "recommended_actions_in_app": [
        "Alert user to restricted F0 and loudness ranges",
        "Suggest: neck/shoulder stretches, stress reduction, gentle voice use",
        "Provide relaxation breathing exercises",
        "If accompanied by pain: recommend voice therapy (SLP) as first step (before ENT laryngoscopy, as no structural pathology)"
      ],
      "recovery_pattern": "With voice therapy, tension reduces, ranges expand. Metrics normalize as efficiency improves.",
      "key_difference_from_nodules": "MTD is functional (no visible structural pathology); nodules are structural (visible tissue changes). MTD responds well to therapy; nodules often need voice rest ± laser surgery.",
      "chapter_reference": "7, 8, 9"
    },

    {
      "id": "case_laryngitis_acute",
      "case_label": "Laryngitis (Acute Infection/Inflammation)",
      "anatomy": "Inflammation and swelling of vocal fold mucosa (outer layer) due to infection (viral, bacterial), irritation (smoking, shouting), or drainage from upper respiratory infection",
      "prevalence": "Very common, especially during cold and flu season",
      "typical_duration": "3-7 days (viral); longer if bacterial or continued irritation",
      "salient_acoustic_features": [
        "**Reduced or hoarse voice** (inflammation → irregular vibration)",
        "**Speaking F0 may change:** Often lowered in men (swelling = increased mass); variable in women",
        "**Increased aperiodic energy (noise):** Inflammation and stiffness disrupt smooth vibration",
        "**Increased jitter and shimmer** (swollen, stiff tissue vibrates irregularly)",
        "**Reduced HNR** (significant noise component)"
      ],
      "physiology_explanation": "Inflammation → mucosal swelling → increased vocal fold mass and stiffness → irregular vibration → hoarseness. The folds cannot vibrate smoothly; air leaks through incomplete closure (breathiness). Aperiodic energy (noise) increases significantly.",
      "symptoms_user_feels": [
        "Hoarseness or 'losing your voice' (sometimes complete voice loss)",
        "Throat pain and scratchiness",
        "Sensation of low-grade fever or malaise (if viral)",
        "Nasal drainage and cough (if upper respiratory infection)",
        "Voice may crack or break",
        "Discomfort worse in the morning",
        "Difficulty with projection (voice tires quickly)"
      ],
      "typical_progression": {
        "day_1_2": "Onset of hoarseness, pain, voice fatigue",
        "day_3_5": "Peak hoarseness; F0 may be lowest; most noise in signal",
        "day_6_7": "Gradual improvement if treated/rested",
        "recovery": "With rest and hydration, usually resolves within 1-2 weeks"
      },
      "how_app_should_speak_non_diagnostically": "Your recent voice measurements show a pattern of **high acoustic instability and potential changes in average pitch**. When accompanied by symptoms like hoarseness, throat pain, or drainage, this pattern suggests **acute vocal fold inflammation**, likely from viral infection or irritation. **What you can do:** Vocal rest (minimize talking), stay hydrated (drinks warm water, avoid caffeine/alcohol), use humidifier, avoid shouting. **Recovery timeline:** Usually improves within 3-7 days with rest. **When to see a doctor:** If symptoms persist > 3 weeks, worsen dramatically, or include severe pain or difficulty swallowing.",
      "what_metrics_show": {
        "hoarseness_signature": {
          "jitter": "↑ High (irregular vibration from swelling)",
          "shimmer": "↑ High (amplitude variability)",
          "hnr": "↓ Low (substantial noise)",
          "f0": "↓ Often lowered (increased mass from swelling)"
        },
        "day_by_day_progression": "Worst on days 3-5, gradual improvement after"
      },
      "recommended_actions_in_app": [
        "Alert user to acute dysphonia pattern",
        "Recommend: Complete vocal rest if possible, hydration, warm steam inhalation",
        "Provide voice care tips for acute phase",
        "Suggest recheck in 1 week (should show improvement)",
        "If no improvement after 3 weeks: recommend medical evaluation"
      ],
      "differential_diagnosis": {
        "vs_nodules": "Acute onset + pain (laryngitis); gradual onset, no pain (nodules)",
        "vs_mtd": "Pain present (laryngitis); pain optional (MTD); symptoms fluctuate with health (laryngitis)"
      },
      "red_flags_for_urgent_care": [
        "Severe pain or difficulty swallowing",
        "Symptoms persist > 3 weeks",
        "Symptoms worsen despite rest",
        "Breathing difficulty",
        "Hoarseness in context of smoking history (rule out malignancy)"
      ],
      "chapter_reference": "8, 9"
    },

    {
      "id": "case_presbylarynx_aging",
      "case_label": "Presbylarynx (Age-Related Voice Changes)",
      "anatomy": "Gradual changes in laryngeal structure and function with aging: vocal fold thinning, loss of elasticity, laryngeal muscle atrophy, structural changes",
      "typical_age_onset": "65+ years; more pronounced in 75+",
      "sex_differences": {
        "men": "Often show F0 lowering (relaxation, loss of tension)",
        "women": "Often show F0 lowering post-menopause (hormonal)",
        "both": "Reduced loudness capacity, increased breathiness, fatigue with sustained use"
      },
      "salient_acoustic_features": [
        "**Reduced Speaking F0** (vocal fold atrophy → reduced tension/stiffness)",
        "**Increased breathiness** (incomplete glottal closure from bowing)",
        "**Reduced loudness/power** (weakened vocal fold muscles, reduced breath support)",
        "**Increased jitter** (irregular, weakened vibration)",
        "**Increased noise (reduced HNR)** (incomplete closure → air leak)",
        "**Reduced pitch range** (limited vocal fold control)"
      ],
      "physiology_explanation": "Vocal folds thin and lose elasticity with age. Muscle atrophy → incomplete glottal closure (bowing). Stiffness decreases → F0 may lower. Overall: voice becomes breathy, weak, and higher-pitched than expected for age (especially in men).",
      "symptoms_user_feels": [
        "Voice feels tired and weak (especially after extended talking)",
        "Reduced volume (harder to project, especially in groups)",
        "Breathy quality, lack of 'punch'",
        "Reduced singing voice range and power",
        "Frequent throat clearing or coughing",
        "May have accompanying swallowing changes"
      ],
      "how_app_should_speak_non_diagnostically": "Your voice metrics show a pattern consistent with **natural age-related changes in the vocal system**. With aging, vocal folds gradually lose elasticity and muscle tone, resulting in reduced power, increased breathiness, and less vocal flexibility. This is normal aging, but voice therapy and voice exercises can help maintain vocal strength and clarity. **What you can do:** Regular voice warm-ups, breathing exercises, stay hydrated, avoid smoking/excessive shouting. **Consider:** Voice therapy focused on vocal strengthening can significantly improve your voice quality and endurance.",
      "what_metrics_show": {
        "power": "↓ Reduced (weakened vocal fold muscles)",
        "clarity": "↓ May be reduced (incomplete closure)",
        "health": "↓ Reduced HNR (breathiness indicator)",
        "f0": "↓ Lowered (especially in men; females may be stable or lower)",
        "confidence": "↓ Reduced stability and range"
      },
      "recommended_actions_in_app": [
        "Normalize age-related changes (not pathological)",
        "Suggest vocal exercises (voice strengthening)",
        "Recommend voice therapy if significant impact on quality of life",
        "Encourage hydration, voice care, avoid irritants"
      ],
      "intervention_outcomes": "Voice therapy can slow presbylarynx progression and improve function. Exercises targeting laryngeal strength and breath support show measurable improvement in metrics.",
      "chapter_reference": "9, 10"
    }
  ],

  "user_education_translation_guide": {
    "how_to_explain_each_metric_to_users": [
      {
        "metric": "Clarity",
        "lay_explanation": "How clear and easy to understand your voice is. Clear voices cut through noise and are easy to listen to.",
        "technical_details_if_user_asks": "Clarity is based on your spectral centroid (where your voice energy is concentrated in frequencies) and harmonic-to-noise ratio (how much pure tone vs. noise). Clear voices have energy in distinct peaks (harmonics), not spread as noise.",
        "what_affects_it": "Articulation, mouth opening, hydration, tension",
        "how_to_improve": "Speak more deliberately, open your mouth more when talking, stay hydrated, relax tension"
      },
      {
        "metric": "Power",
        "lay_explanation": "How much vocal projection and strength you have. High power means you can be heard easily in groups; low power means you sound weak or fade away.",
        "technical_details_if_user_asks": "Power is your RMS (Root Mean Square) energy level, which reflects subglottal pressure (breath support) and how efficiently your vocal folds are vibrating.",
        "what_affects_it": "Breath support, vocal fold engagement, loudness you're using",
        "how_to_improve": "Practice diaphragmatic breathing, support from your belly, avoid whispering, speak with confidence"
      },
      {
        "metric": "Health",
        "lay_explanation": "How stable and efficient your vocal fold vibration is. Healthy voices vibrate smoothly and regularly; unhealthy voices show irregular patterns suggesting strain or pathology.",
        "technical_details_if_user_asks": "Health combines jitter (F0 stability), shimmer (amplitude stability), and HNR (how much noise in your voice). High values indicate smooth, regular vibration; low values suggest irregular patterns associated with pathology or strain.",
        "what_affects_it": "Vocal fatigue, strain, inflammation, chronic voice abuse, lack of hydration",
        "how_to_improve": "Vocal rest, hydration, reduce strain, voice therapy if needed"
      },
      {
        "metric": "Warmth",
        "lay_explanation": "How rounded, rich, and resonant your voice sounds. Warm voices sound pleasant and attractive; thin voices sound strained or incomplete.",
        "technical_details_if_user_asks": "Warmth is based on your formant frequencies, particularly F1 (first formant). Lower F1 values (rounder vowels) sound warmer; higher F1 values sound thinner.",
        "what_affects_it": "Vocal tract shape, jaw position, throat openness, resonance tuning",
        "how_to_improve": "Practice open throat singing/speaking, lower jaw slightly, feel resonance in chest"
      },
      {
        "metric": "Confidence",
        "lay_explanation": "How steady and controlled your pitch is. Confident voices maintain steady pitch; uncertain voices waver and break, especially under stress.",
        "technical_details_if_user_asks": "Confidence reflects pitch stability (low jitter/perturbation) and how controlled your F0 is. Steady pitch signals strong laryngeal control.",
        "what_affects_it": "Vocal fatigue, stress, breathing control, laryngeal tension",
        "how_to_improve": "Reduce stress, practice breathing exercises, speak from a centered place, avoid extreme emotion in voice"
      },
      {
        "metric": "Expressiveness",
        "lay_explanation": "How much variation and emotion you bring to your voice. Expressive voices are engaging and convey emotion; monotone voices are boring and hard to follow.",
        "technical_details_if_user_asks": "Expressiveness measures F0 range (pitch variation), intensity variation, and rate changes (tempo). High expressiveness = engaging prosody; low = monotone.",
        "what_affects_it": "Emotional engagement, fatigue, speech rate, dialect/accent",
        "how_to_improve": "Emphasize key words, vary pitch up and down, change speaking pace, bring emotion to your message"
      }
    ]
  },

  "citations_and_references": {
    "primary_reference": {
      "full_citation": "Behrman, A. (2013). Speech and Voice Science: Anatomy, Physiology, Acoustics & Perception (2nd ed.). Plural Publishing.",
      "isbn": "978-0323530613",
      "chapters_used": ["3", "4", "5", "6", "7", "8", "9"]
    },
    "supplementary_references": [
      "Kent, R. D., & Read, C. (1992). The Acoustic Analysis of Speech (2nd ed.). Singular Publishing Group.",
      "Baken, R. J., & Orlikoff, R. F. (1999). Clinical Measurement of Speech and Voice (2nd ed.). Singular Publishing Group.",
      "Titze, I. R. (2000). Principles of Voice Production (2nd ed.). National Center for Voice and Speech."
    ],
    "how_to_cite_in_app": "Based on voice science principles (Behrman, 2013), Chapter 5: Resonance and the Vocal Tract Filter"
  }
}
```

---

## 🔗 Three-Book Integration Strategy

**Kent & Read** (Theory)  
→ How to calculate each metric mathematically

**Baken & Orlikoff** (Validation)  
→ What normal, abnormal, and pathological ranges are

**Behrman** (Education)  
→ How to explain what's happening in plain language

---

## 📌 Implementation Timeline

| Phase | Primary Source | Tasks |
|-------|---|---|
| Week 1-2 | Kent & Read + Baken | Build `brandedMetricsEngine.ts` with formulas & thresholds |
| Week 3-4 | Behrman | Write in-app education ("Learn More" sections) |
| Week 5-6 | Behrman + Baken | Implement clinical case patterns (alerts, suggestions) |
| Week 7-8 | All three | Refine user messaging, clinical interpretation |

---

## ✅ What This Schema Enables

- User-facing explanations for every metric (Behrman)
- Clinical case patterns with acoustic signatures (what to look for)
- Subsystem explanations (respiration, phonation, resonance, articulation)
- Non-diagnostic but informative messaging ("What this pattern suggests...")
- Actionable guidance ("What you can do to improve...")
- Red flag detection ("When to see a specialist...")

---

**Version:** 1.0  
**Status:** 🟢 Ready for Implementation  
**Complementary To:** ACOUSTIC_ANALYSIS_SOURCE_SCHEMA.md + CLINICAL_MEASUREMENT_SOURCE_SCHEMA.md  
**Last Updated:** November 17, 2025
