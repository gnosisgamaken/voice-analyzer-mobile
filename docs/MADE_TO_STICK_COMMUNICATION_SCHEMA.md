# Book Source Schema: Made to Stick (Communication Toolkit)

**Book:** Made to Stick — Chip & Dan Heath  
**Primary Use:** Translating complex vocal metrics and health advice into sticky, memorable, actionable content  
**Status:** 📘 Reference Schema v1.0  
**Date:** November 17, 2025  

---

## 🧠 SUCCESs Framework → Voice Analyzer Schema

```json
{
  "metadata": {
    "book_title": "Made to Stick",
    "primary_use": "Behavioral communication playbook for presenting acoustic metrics, insights, and health guidance",
    "priority_level": "🟡 HIGH (content & engagement layer)",
    "implementation_priority": "Week 5-7 (parallel with microcopy + insights work)",
    "unique_value": "Ensures every explanation, insight, and notification is concise, surprising, concrete, credible, emotional, and story-driven",
    "target_audience_in_app": "All end users; especially cohorts who need complex science translated into plain language",
    "complements": [
      "ATOMIC_HABITS_NUDGE_PATTERNS_SCHEMA (behavior scaffolding)",
      "BRANDED_METRICS_ENGINE (raw inputs to be made sticky)",
      "INSIGHTS_ENGINE_SPEC (delivery channel for sticky content)"
    ]
  },
  "principles": [
    {
      "name": "Simple",
      "definition": "Find the essential core (Commander’s Intent) and communicate it compactly—like a proverb, not a sound bite.",
      "key_rules": [
        "Strip away everything non-essential so the most important idea shines.",
        "Be ruthlessly compact (two bullets instead of five).",
        "Lead with a single, clear purpose statement that guides decisions."
      ],
      "voice_app_examples": [
        "Rename 'vocal intensity (dB SPL)' as 'Voice Power.'",
        "Explain F0 in one sentence: 'This is your current musical pitch.'",
        "Use visual proverbs (e.g., 'Vocal folds = Sponges') to convey hydration."
      ]
    },
    {
      "name": "Unexpected",
      "definition": "Grab and hold attention by breaking expectations, then sustain curiosity (Gap Theory).",
      "key_rules": [
        "Break predictable patterns to spark attention.",
        "Ensure every surprise is post-dictable (makes sense afterward).",
        "Exploit curiosity gaps so users need the next piece of info."
      ],
      "voice_app_examples": [
        "“Did you know whispering can stress your cords more than gentle speech?”",
        "Mystery flow: “We spotted a performer-only fatigue pattern—let’s investigate before revealing the cause.”"
      ]
    },
    {
      "name": "Concrete",
      "definition": "Use sensory details and human actions so everyone shares the same mental model (Velcro Theory).",
      "key_rules": [
        "Explain using tangible sensory references.",
        "Avoid abstraction; stick to observable actions.",
        "Provide concrete contexts to coordinate behavior."
      ],
      "voice_app_examples": [
        "Clarity: “How easily your voice cuts through a noisy room.”",
        "Jitter: “Vocal folds vibrating like a jump rope hitting uneven ground.”",
        "Breath imagery: “Let your sound float on your breath.”"
      ]
    },
    {
      "name": "Credible",
      "definition": "Messages must carry their own credentials (stats, human-scale analogies, testable claims).",
      "key_rules": [
        "Use stats to illustrate relationships, not just report numbers.",
        "Translate data into human-scale comparisons.",
        "Encourage testable credentials (“see for yourself”).",
        "Use antiauthorities when real voices matter more than experts."
      ],
      "voice_app_examples": [
        "“Your instability is 3× higher than users who report fatigue.”",
        "“You’re speaking at 80 dB; if fatigue hits at 30 minutes, the volume is too high.”",
        "Show normative MPT ranges for the user’s profile."
      ]
    },
    {
      "name": "Emotional",
      "definition": "People act when they care—appeal to self-interest, identity, and personal stories.",
      "key_rules": [
        "WIIFY: focus on benefits, not features.",
        "Appeal to identity (“Texans don’t litter”).",
        "Use the Mother Teresa principle—spotlight one personal scenario.",
        "Reframe “have to” as “get to.”"
      ],
      "voice_app_examples": [
        "Frame clarity training as “Your ideas land the first time—no repeats needed.”",
        "Identity prompts: “You’re a resilient vocal athlete.”",
        "Hydration reframed as a “vocal facial.”"
      ]
    },
    {
      "name": "Stories",
      "definition": "Stories act as mental flight simulators (simulation + inspiration).",
      "key_rules": [
        "Stories must teach how to act (simulation) or inspire action.",
        "Prefer narratives over bullet lists.",
        "Use Challenge, Connection, or Creativity plots."
      ],
      "voice_app_examples": [
        "Simulation story: “A teacher avoided Friday hoarseness by adding a 10-minute cooldown—try it now.”",
        "Challenge plot: share recovery journeys from fatigue to resilience.",
        "Springboard: “A performer cut strain immediately after switching to an amp—here’s how you can too.”"
      ]
    }
  ],
  "copy_templates": [
    {
      "use_case": "Metric Explanation (Simple + Concrete + Emotional)",
      "template": "Explain the metric in one concrete sentence + emotional benefit.",
      "example": "“Clarity shows how sharply your voice cuts through noise. High clarity means your ideas land exactly as intended.”"
    },
    {
      "use_case": "Corrective Feedback (Concrete + Simple + Credible)",
      "template": "Describe the issue with a concrete analogy, then give a simple physics-based instruction.",
      "example": "“Your jitter behaves like unbalanced tires—smooth airflow to stabilize the ride.”"
    },
    {
      "use_case": "Call to Action / Reminder (Emotional + Identity)",
      "template": "Frame the action as a vote for the user’s identity; reference streaks/wins.",
      "example": "“Don’t break the chain—this 5-minute cooldown is another vote for your resilient Vocal Athlete identity.”"
    }
  ]
}
```

---

## 🛠 Implementation Notes

1. **Insight & Metric Cards**
   - Each metric explanation → single sticky sentence following the templates above.
   - Add “Did You Know?” slots for Unexpected principles in insights feed.

2. **Notification/Microcopy Library**
   - Tag strings by SUCCESs principle so future writers know which lever each message pulls.
   - Use Emotional + Identity templates for streak reminders and milestone celebrations.

3. **Story Modules**
   - Build a “Playbook” section with short Challenge/Connection stories (teachers, performers, recovery patients) to prime behavior.
   - Link each story to a CTA (“Run the cooldown she used”).

4. **Design Cues**
   - Concreteness and Unpredictability should guide iconography/illustrations (e.g., sponge visuals for hydration).
   - Keep the Commander’s Intent visible on screens (single-sentence purpose above content blocks).

---

**Next Steps**
1. Integrate these SUCCESs templates into the existing `microcopy.ts` so metrics/insights notifications pull from them.
2. Expand the insights engine output to flag which SUCCESs principle each card uses (metadata for experimentation).
3. Align the Liquid Glass design content sections with SUCCESs (Simple hero statement, Unexpected insight slots, etc.).
