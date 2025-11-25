# ELEVEN LABS EXTRACTION PLAN

Purpose: capture the voice inventory, tagging scheme, and sentence prompts needed to spin up ElevenLabs voices that match the Voice Analyzer brand voice (calm precision, invitational coaching, premium polish).

## Workflow & Naming Rules
- **Pipeline**
  1. Copy the prompt(s) below for the voice you are synthesizing.
  2. In ElevenLabs Voice Lab, set metadata fields to the values listed (language, accent, gender, age, tone, style, use_case, description).
  3. Paste the sentences as the design prompt text and render a sample at “high similarity” so timbre stays on brief.
  4. Export as 48 kHz WAV and drop into `app/assets/audio/voices/`.
  5. Log the final asset in `assets_manifest.json` with the same filename so engineering can wire it into the notification + microcopy system.
- **File naming convention:** `VA_<usecase>_<language>_<gender>_<age>_<tone>.wav`
  - Example: `VA_guidance_enUS_female_youngAdult_warmconfident.wav`
  - Keep tone compact (no spaces); combine two adjectives if needed.

## Voice Sample Inventory

### 1. VA_guidance_enUS_female_youngAdult_warmconfident.wav
- **Use cases:** Onboarding hero narration, baseline guidance tiles, empty states.
- **Metadata:**  
  - language: `en-US`  
  - accent: `General American`  
  - gender: `female`  
  - age: `young adult`  
  - tone: `warm, confident, invitational`  
  - style: `podcast host / calm guide`  
  - use_case: `onboarding_narration`  
  - description: `Soft-focus narrator who sounds like a trusted vocal coach welcoming you into the lab.`
- **Generator sentences:**  
  1. “Voice Analyzer is ready. Speak at your natural pace and we’ll translate the details into calm, useful insight.”  
  2. “Think of this as a Swiss-watch check-in for your voice—precise, respectful, and always on your schedule.”  
  3. “Baseline recordings are how we learn your natural range; three minutes today keeps every future metric honest.”

### 2. VA_integrity_enUS_male_middleAged_preciseassuring.wav
- **Use cases:** Measurement quality alerts, PCM module onboarding, integrity notices in Recording Details.
- **Metadata:**  
  - language: `en-US`  
  - accent: `Pacific Northwest American`  
  - gender: `male`  
  - age: `middle-aged`  
  - tone: `precise, steady, reassuring`  
  - style: `documentary narrator / lab director`  
  - use_case: `system_status`  
  - description: `Technical lead who can explain measurement constraints without sounding alarmist.`
- **Generator sentences:**  
  1. “We detected a lower sampling rate from your microphone; switch off Bluetooth and re-run the session for the cleanest Voice IQ.”  
  2. “Live PCM streaming is offline, so we’re showing simulated metrics—install the native module when you’re ready for full fidelity.”  
  3. “Hold the phone at six inches, consistent height, and we’ll keep the jitter and shimmer data clinically trustworthy.”

### 3. VA_caretips_enGB_female_mature_gentlecoach.wav
- **Use cases:** Hydration nudges, whisper warnings, post-session care tips.
- **Metadata:**  
  - language: `en-GB`  
  - accent: `London Received Pronunciation`  
  - gender: `female`  
  - age: `mature`  
  - tone: `gentle, empathetic, steady`  
  - style: `wellness coach / speech therapist`  
  - use_case: `health_guidance`  
  - description: `Experienced vocal health mentor who pairs clinical knowledge with warmth.`
- **Generator sentences:**  
  1. “Your Vocal Health metric dipped today—sip water now and give the folds five minutes of quiet.”  
  2. “Skip the whispering when you’re tired; a light hum keeps resonance active without strain.”  
  3. “Consistency beats intensity: a short hydration ritual before every session protects your baseline.”

### 4. VA_momentum_enUS_nonbinary_youngAdult_upliftingsteady.wav
- **Use cases:** Streak celebrations, long-gap nudges, Atomic Habits prompts.
- **Metadata:**  
  - language: `en-US`  
  - accent: `Neutral American with soft West Coast cadence`  
  - gender: `androgynous`  
  - age: `young adult`  
  - tone: `uplifting, steady, lightly playful`  
  - style: `habit coach / supportive friend`  
  - use_case: `progress_notification`  
  - description: `Non-binary companion voice that sounds modern, human, and gently motivating.`
- **Generator sentences:**  
  1. “Seven days strong—your clarity trend is up eight points, so tonight’s check-in locks the streak.”  
  2. “It’s been five days since your last session; want to see what shifted?”  
  3. “Micro wins matter: record for ninety seconds, log it, and let the baseline stay honest.”

### 5. VA_insights_enUS_male_mature_warmanalyst.wav
- **Use cases:** Insights carousel narration, Recording Details highlights, shareable card VO.
- **Metadata:**  
  - language: `en-US`  
  - accent: `Transatlantic / light studio polish`  
  - gender: `male`  
  - age: `mature`  
  - tone: `warm, analytical, composed`  
  - style: `premium news narrator`  
  - use_case: `insight_readout`  
  - description: `Feels like a calmly authoritative analyst translating data into meaning.`
- **Generator sentences:**  
  1. “Voice IQ rose fifteen points week over week; resonance stability did the heavy lifting.”  
  2. “Power is holding at eighty-one, but expressiveness slipped—consider breath pacing tomorrow.”  
  3. “Your baseline is now locked. Every new session compares back to the signature you just defined.”

### 6. VA_relief_enAU_female_middleAged_soothinglow.wav
- **Use cases:** Vocal-nap timer confirmations, post-measurement decompression moments, breathing guides.
- **Metadata:**  
  - language: `en-AU`  
  - accent: `Soft Sydney Australian`  
  - gender: `female`  
  - age: `middle-aged`  
  - tone: `soothing, low, restorative`  
  - style: `mindfulness guide`  
  - use_case: `recovery_prompt`  
  - description: `Helps users downshift after intense sessions without sounding sleepy.`
- **Generator sentences:**  
  1. “Timer set—let the next ten minutes stay quiet, shoulders relaxed, breath low.”  
  2. “When you’re ready to re-engage, start with a gentle descending siren to wake the folds safely.”  
  3. “Your voice thanked you today; hydration, rest, and light resonance resets keep that warmth intact.”

## Next Steps Checklist
1. Approve or edit the six archetypes above; confirm if Spanish or Portuguese variants are needed for v1.
2. Record or render samples in ElevenLabs using the prompts, exporting each as the tagged filename.
3. Drop files into `app/assets/audio/voices/` and update `assets_manifest.json`.
4. Hand back the manifest so engineering can map cues (notifications, screens, timers) to the correct clip IDs.
