# Agent A (Gemini 2.5 Pro) - Design & UI Tasks

**Role:** Lead Designer / UI Engineer
**Focus:** "Liquid Glass" Design System, Components, Animations
**Context:** You are responsible for making the app look like a premium iOS 26 experience.

## 📋 Task List

### 1. Foundation: Liquid Glass Components
- [ ] **Create `LiquidGlassView` Component**
    - Path: `app/src/components/LiquidGlassView.tsx`
    - Specs:
        - Wraps native blur view (use `react-native-community/blur` or Expo equivalent if available, abstracting for future native module).
        - Props: `variant` ('regular', 'clear', 'thin', 'ultra'), `style`, `children`.
        - Behavior: Respects `ReduceTransparency` (falls back to solid color).
- [ ] **Update `MaterialCard` Component**
    - Path: `app/src/components/MaterialCard.tsx`
    - Specs:
        - Add variants: `glass-regular`, `glass-clear`, `solid-elevated`, `solid-flat`.
        - Ensure consistent padding and border radius (use design tokens).

### 2. Navigation: The Glass Bar
- [ ] **Create `NavigationBar` Component**
    - Path: `app/src/components/NavigationBar.tsx`
    - Specs:
        - Background: `LiquidGlassView` (regular).
        - Layout: Left slot (Back/Menu), Center slot (Title), Right slot (Action).
        - Height: Adaptive (handle Safe Area).
- [ ] **Integrate into Screens**
    - Replace current headers in `RecordingsListScreen` and `RecordingDetailsScreen`.

### 3. Polish: Animations & Interactions
- [ ] **Card Entrance Animations**
    - Implement staggered fade-in/slide-up for lists.
    - Respect `ReduceMotion` preference.
