# Navigation Strategy – November 2025

## Goals
- Deliver a first-party-quality navigation experience (large-title headers, gestures, deep links, accessibility) that scales beyond the three current tabs.
- Minimize tech debt created by our interim custom navigator now that Liquid Glass and design tokens are in place.

## Options Evaluated

### Option A – Adopt React Navigation (Stack + Tabs)
**Pros**
- Battle-tested gestures, transitions, focus handling, and deep linking already solved.
- Built-in support for header configuration per screen so our new `LargeTitleHeader` can hook into `headerLargeTitle` APIs.
- Easy integration with React Native Reanimated for shared element/more complex transitions later.
- Community ecosystem (devtools, types, deep-link helpers) we can leverage immediately.

**Cons**
- Migration effort: need to wrap all screens and update navigation props, replace our custom tab shell, and re-test state persistence.
- Adds dependency weight (`@react-navigation/native` + stack/tabs + gesture handler + reanimated) with some Android-specific setup.

### Option B – Extend Custom `AppNavigator`
**Pros**
- No new dependencies; keep full control over look/feel.
- We already have tab stacks per tab and the Liquid Glass tab bar.

**Cons**
- Must hand-roll gestures, deep linking, back-behavior, and state persistence (time sink + risk).
- Harder to integrate with external tooling (analytics screen names, linking).  
- Accessibility edge cases (screen readers, focus) become our responsibility.

## Decision
Adopt **React Navigation (Option A)** for the main stack + tabs. It accelerates gestures/deep linking and lets us focus on audio + metrics instead of reinventing navigation. We will:
1. Install `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-gesture-handler`, and `react-native-reanimated` (already partially included by RN 0.81.5).
2. Replace `AppNavigator` gradually:
   - Step 1: Introduce a new `NavigationContainer` in `App.tsx` with a `createBottomTabNavigator` replicating Recorder/History/Notifications.
   - Step 2: Wrap each tab in a native stack so `RecordingDetails`/`BrandedMetricsDemo` push with standard gestures.
   - Step 3: Inject our custom `LargeTitleHeader` via `headerLargeTitle` options and preserve the Liquid Glass tab visuals using `tabBar` customization.
3. Keep the current tab stacks temporarily to prevent blocking Gemini’s work. Once React Navigation is stable, delete `AppNavigator.tsx`.

## Next Steps
- [ ] Install navigation dependencies + update Babel config for Reanimated.
- [ ] Prototype Recorder tab in React Navigation, ensuring the new Large Title header renders and haptics still fire.
- [ ] Port History/Notifications tabs, then remove the custom navigator.
- [ ] Update docs/IOS_NATIVE_INTERFACE_SPEC.md with any header/tab tweaks discovered during implementation.

This document will track migration progress; update checkboxes as tasks complete.
