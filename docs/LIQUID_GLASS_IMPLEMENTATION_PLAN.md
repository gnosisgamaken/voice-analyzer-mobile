# 🪟 Liquid Glass Design Implementation Plan

**Project:** Voice Analyzer Mobile  
**Design System:** Apple iOS 26 Liquid Glass  
**Status:** Analysis & Planning Phase  
**Date:** November 2025

---

## 📊 Executive Summary

This plan transforms the Voice Analyzer app to fully embrace Apple's Liquid Glass design language for iOS 26, balancing visual spectacle with functional clarity. The strategy: **use Liquid Glass for structure and navigation, keep voice metrics and data on solid, high-contrast surfaces.**

### Design Philosophy

**"The OS provides spectacle; our app provides clarity."**

We'll create a tiered material hierarchy where:
- **Tier 1 (Liquid Glass):** Navigation, chrome, discovery surfaces
- **Tier 2 (Semi-translucent):** Cards, sheets, secondary containers  
- **Tier 3 (Solid):** Critical data, metrics, recording controls, text entry

This creates visual contrast between the system's expressiveness and our app's focused, premium voice-analysis experience.

---

## 🎯 Current State Analysis

### Existing Material Usage (Audit Results)

**Current Implementation:**
```typescript
// MaterialCard.tsx - Uses @react-native-community/blur
- BlurView with 3 variants (thin: 16, regular: 22, ultra: 28)
- Fallback to opaque backgrounds when Reduce Transparency is on
- Manual tint colors (COLORS.surface)
```

**Screens Analysis:**

| Screen | Current Material | Surface Type | Liquid Glass Candidate? |
|--------|------------------|--------------|------------------------|
| **MainRecordingScreen** | Solid backgrounds | Primary content | ❌ No - keep solid |
| Top bar / "Recordings" button | Semi-transparent white | Navigation chrome | ✅ Yes - Regular Glass |
| Waveform container | Solid | Primary visualization | ❌ No - keep solid |
| VoiceMetrics cards | MaterialCard (BlurView) | Data display | ⚠️ Partial - solid with glass borders |
| RecordingControls | Solid buttons | Critical controls | ❌ No - keep solid |
| BrandedMetricsOverview | MaterialCard | Data cards | ⚠️ Partial - see above |
| **RecordingsListScreen** | Solid background | Content list | ❌ No - keep solid |
| Recording cards | Solid cards | Data cards | ⚠️ Partial - glass container, solid content |
| Voice IQ badge | Solid | Critical metric | ❌ No - keep solid |
| **RecordingDetailsScreen** | Mixed | Content + controls | ⚠️ Mixed approach |
| Playback controls | Solid | Critical controls | ❌ No - keep solid |

**Key Findings:**
1. ✅ Already using blur effects via MaterialCard component
2. ⚠️ Using manual BlurView, not iOS 26 native Liquid Glass APIs
3. ❌ No navigation bar/tab bar yet (using custom top bar)
4. ✅ Good accessibility handling (Reduce Transparency fallback)
5. ⚠️ Mixing glass and solid in inconsistent ways

---

## 🏗️ Liquid Glass Design Strategy

### Tier 1: Liquid Glass (Chrome & Navigation)

**Where to apply Regular Liquid Glass:**

1. **Navigation Bar** (new)
   - Top navigation across all screens
   - Contains: Screen title, back button, action buttons
   - Material: `.glassEffect(.regular, in: .rect)`
   - Auto-adapts to light/dark mode and wallpaper

2. **Tab Bar** (future enhancement)
   - Bottom navigation: Record / Recordings / Insights / Settings
   - Material: System tab bar with Liquid Glass style
   - Badge support for "Processing" status

3. **Search/Filter Bar** (future)
   - On RecordingsListScreen
   - Material: Regular glass with solid search field inside

4. **Floating Action Button** (FAB)
   - Quick-record button overlaying RecordingsListScreen
   - Material: Regular glass pill shape
   - Solid icon inside

**Where to apply Clear Liquid Glass:**

1. **Media Overlays** (when waveform is full-screen)
   - When user taps waveform to go full-screen
   - Overlay controls use Clear glass + dimming layer
   - Ensures waveform remains visible behind controls

2. **Tutorial Overlays** (onboarding)
   - First-time user tooltips
   - Clear glass with extra opacity on background

### Tier 2: Semi-Translucent (Cards & Containers)

**Upgraded MaterialCard component:**

```typescript
// New variants:
'glass-regular'     // For most cards, uses iOS 26 Liquid Glass
'glass-clear'       // For media overlays
'solid-elevated'    // For critical data (metrics, Voice IQ)
'solid-flat'        // For primary content areas
```

**Application:**

1. **Recording Cards (RecordingsListScreen)**
   - Outer container: `glass-regular`
   - Inner content area: `solid-elevated` (white card inside glass)
   - Voice IQ badge: `solid-elevated` with brand color
   - Creates "card floating in glass" effect

2. **Voice Metrics Cards (MainRecordingScreen)**
   - Container: `glass-regular`
   - Metric content: Solid with high contrast
   - Progress bars: Solid colors on solid background
   - Ensures legibility during recording

3. **Branded Metrics Overview**
   - 6-metric grid container: `glass-regular`
   - Individual metric cells: `solid-elevated`
   - Voice IQ display: `solid-elevated` (hero treatment)

### Tier 3: Solid (Critical Elements)

**Always solid, never glass:**

1. **Recording Controls**
   - Record/Pause/Stop buttons
   - Solid with SF Symbols icons
   - Clear affordances, no transparency

2. **Voice IQ Display**
   - Large score number
   - Qualitative label
   - Solid card with brand color accent

3. **Waveform Visualization**
   - Primary content, needs 100% clarity
   - Solid black background
   - Pitch-colored waveform (blue→red→yellow)

4. **Text Entry / Forms** (future)
   - Recording naming
   - Search fields
   - Settings inputs

5. **Error Messages / Alerts**
   - System alerts use default iOS style
   - In-app errors on solid backgrounds

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Goal:** Upgrade MaterialCard to support iOS 26 Liquid Glass API

#### Task 1.1: Create LiquidGlassView Component

**New file:** `src/components/LiquidGlassView.tsx`

```typescript
import { Platform } from 'react-native';

// iOS 26+ native Liquid Glass
// Falls back to BlurView on older iOS
// Uses solid backgrounds on Android

type GlassVariant = 'regular' | 'clear';

interface LiquidGlassViewProps {
  variant: GlassVariant;
  children: ReactNode;
  style?: ViewStyle;
  shape?: 'rect' | 'roundedRect' | 'circle';
  cornerRadius?: number;
  dimming?: number; // 0-1, for Clear variant
}

export function LiquidGlassView({
  variant,
  children,
  style,
  shape = 'roundedRect',
  cornerRadius = 16,
  dimming = 0,
}: LiquidGlassViewProps) {
  const reduceTransparency = useReduceTransparency();
  const reduceMotion = useReduceMotion();
  
  // iOS 26+ path
  if (Platform.OS === 'ios' && Platform.Version >= 26 && !reduceTransparency) {
    return (
      <View style={style}>
        <NativeGlassEffect
          variant={variant}
          shape={shape}
          cornerRadius={cornerRadius}
          dimming={dimming}
          disableMotion={reduceMotion}
        />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }
  
  // Fallback: BlurView (iOS < 26)
  if (Platform.OS === 'ios' && !reduceTransparency) {
    return (
      <View style={style}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurAmount={variant === 'clear' ? 12 : 22}
          blurType="light"
        />
        {dimming > 0 && (
          <View style={[styles.dimming, { opacity: dimming }]} />
        )}
        <View style={styles.content}>{children}</View>
      </View>
    );
  }
  
  // Reduce Transparency / Android: solid fallback
  return (
    <View style={[styles.solidFallback, style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}
```

**Accessibility:**
- Respects Reduce Transparency
- Respects Reduce Motion (disables glass animations)
- Respects Increase Contrast (uses semantic colors)

#### Task 1.2: Update MaterialCard

**Modify:** `src/components/MaterialCard.tsx`

```typescript
type MaterialVariant = 
  | 'glass-regular'
  | 'glass-clear'
  | 'solid-elevated'
  | 'solid-flat';

export function MaterialCard({
  variant = 'solid-elevated',
  children,
  ...
}: MaterialCardProps) {
  if (variant === 'glass-regular' || variant === 'glass-clear') {
    return (
      <LiquidGlassView
        variant={variant === 'glass-regular' ? 'regular' : 'clear'}
        style={style}
        cornerRadius={cornerRadius}
        dimming={variant === 'glass-clear' ? 0.2 : 0}
      >
        {children}
      </LiquidGlassView>
    );
  }
  
  // solid-elevated or solid-flat
  return (
    <View style={[
      styles.solidCard,
      variant === 'solid-elevated' && styles.elevated,
      style
    ]}>
      {children}
    </View>
  );
}
```

#### Task 1.3: Create Design Tokens

**New file:** `src/constants/liquidGlass.ts`

```typescript
export const LIQUID_GLASS = {
  variants: {
    regular: {
      blur: 22,
      tint: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.3)',
    },
    clear: {
      blur: 12,
      tint: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.15)',
      dimming: 0.2, // default
    },
  },
  
  // Safe zones for text on glass
  textContrast: {
    minimum: 4.5, // WCAG AA
    preferred: 7.0, // WCAG AAA
  },
  
  // Transitions
  transitions: {
    standard: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    emphasized: {
      duration: 500,
      easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    },
  },
};
```

**Deliverables:**
- [ ] `LiquidGlassView.tsx` component
- [ ] Updated `MaterialCard.tsx`
- [ ] `liquidGlass.ts` tokens
- [ ] Unit tests for accessibility fallbacks
- [ ] Storybook examples (optional)

---

### Phase 2: Navigation & Chrome (Week 2)

**Goal:** Add proper navigation structure with Liquid Glass

#### Task 2.1: Implement Navigation Bar

**New component:** `src/components/NavigationBar.tsx`

```typescript
interface NavigationBarProps {
  title: string;
  leftButton?: {
    icon: string;
    onPress: () => void;
    label?: string;
  };
  rightButtons?: Array<{
    icon: string;
    onPress: () => void;
    label?: string;
  }>;
  transparent?: boolean; // for full-screen waveform mode
}

export function NavigationBar({
  title,
  leftButton,
  rightButtons,
  transparent = false,
}: NavigationBarProps) {
  return (
    <LiquidGlassView
      variant="regular"
      style={[
        styles.navBar,
        transparent && styles.transparent
      ]}
      shape="rect"
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.content}>
          {/* Left button (back or menu) */}
          {leftButton && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={leftButton.onPress}
              accessibilityLabel={leftButton.label}
            >
              <SFSymbol name={leftButton.icon} size={22} />
            </TouchableOpacity>
          )}
          
          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          
          {/* Right buttons (actions) */}
          <View style={styles.rightButtons}>
            {rightButtons?.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={styles.navButton}
                onPress={btn.onPress}
                accessibilityLabel={btn.label}
              >
                <SFSymbol name={btn.icon} size={22} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LiquidGlassView>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  transparent: {
    // Clear variant for full-screen modes
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: SPACING.md,
  },
  title: {
    flex: 1,
    ...TYPOGRAPHY.title2,
    color: COLORS.label,
    textAlign: 'center',
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
  },
});
```

#### Task 2.2: Update Screen Layouts

**MainRecordingScreen:**
```typescript
// Before: custom top bar
<View style={styles.topBar}>
  <TouchableOpacity onPress={...}>
    <Text>Recordings</Text>
  </TouchableOpacity>
</View>

// After: NavigationBar with Liquid Glass
<NavigationBar
  title="Voice Session"
  leftButton={{
    icon: 'mic.fill',
    onPress: () => {}, // placeholder
    label: 'Main menu'
  }}
  rightButtons={[
    {
      icon: 'list.bullet',
      onPress: () => navigation.navigate('RecordingsList'),
      label: 'View recordings'
    }
  ]}
/>
```

**RecordingsListScreen:**
```typescript
<NavigationBar
  title="Recordings"
  leftButton={{
    icon: 'chevron.left',
    onPress: () => navigation.goBack(),
    label: 'Back'
  }}
  rightButtons={[
    {
      icon: 'plus',
      onPress: () => navigation.navigate('MainRecording'),
      label: 'New recording'
    }
  ]}
/>
```

#### Task 2.3: Add Tab Bar (Future)

**Placeholder for future navigation enhancement**

```typescript
// When we expand to 4+ top-level screens:
// Record | Recordings | Insights | Settings

<TabBar variant="glass-regular">
  <TabButton icon="waveform" label="Record" />
  <TabButton icon="folder" label="Recordings" badge={processingCount} />
  <TabButton icon="chart.bar" label="Insights" />
  <TabButton icon="gearshape" label="Settings" />
</TabBar>
```

**Deliverables:**
- [ ] `NavigationBar.tsx` component
- [ ] Update all 3 screens with NavigationBar
- [ ] Remove old top bar code
- [ ] Test navigation gestures
- [ ] Verify safe area handling

---

### Phase 3: Cards & Containers (Week 3)

**Goal:** Apply tiered material strategy to cards

#### Task 3.1: Update Recording Cards

**RecordingsListScreen - Card Redesign:**

```typescript
// New structure: Glass container → Solid content

function RecordingCard({ item }: { item: StoredRecording }) {
  return (
    <MaterialCard variant="glass-regular" style={styles.glassContainer}>
      {/* Inner solid card */}
      <View style={styles.solidContent}>
        {/* Recording name */}
        <Text style={styles.name}>{item.name}</Text>
        
        {/* Voice IQ - Hero metric, always solid */}
        {item.averageBrandedMetrics?.voiceIQ && (
          <View style={styles.voiceIqPill}>
            <Text style={styles.voiceIqLabel}>Voice IQ™</Text>
            <Text style={styles.voiceIqScore}>
              {item.averageBrandedMetrics.voiceIQ.value}
            </Text>
            <Text style={styles.voiceIqDescriptor}>
              {item.averageBrandedMetrics.voiceIQ.label}
            </Text>
          </View>
        )}
        
        {/* Metadata */}
        <Text style={styles.metadata}>
          {formatDate(item.timestamp)} • {formatTime(item.duration)}
        </Text>
        
        {/* Mini metrics preview - solid pills */}
        <View style={styles.metricsRow}>
          <MetricPill label="Clarity" value={item.averageMetrics?.clarity} />
          <MetricPill label="Power" value={item.averageMetrics?.power} />
          <MetricPill label="Warmth" value={item.averageMetrics?.warmth} />
        </View>
      </View>
      
      {/* Delete button - outside solid card, on glass */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <SFSymbol name="trash" size={18} color={COLORS.destructive} />
      </TouchableOpacity>
    </MaterialCard>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    overflow: 'visible', // for shadows
  },
  solidContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  voiceIqPill: {
    backgroundColor: COLORS.blue,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  // ... rest
});
```

**Visual hierarchy:**
```
┌─────────────────────────────────┐
│ Liquid Glass Regular (container)│
│  ┌───────────────────────────┐  │
│  │ Solid White (content)     │  │
│  │  Recording Name           │  │
│  │  ┌──────────────────┐     │  │
│  │  │ Voice IQ™ Pill   │     │  │ ← Solid, brand color
│  │  └──────────────────┘     │  │
│  │  Date • Duration          │  │
│  │  [Clarity][Power][Warmth] │  │ ← Solid pills
│  └───────────────────────────┘  │
│  🗑️ (on glass)                  │
└─────────────────────────────────┘
```

#### Task 3.2: Update Voice Metrics

**MainRecordingScreen - VoiceMetrics Component:**

```typescript
function MetricCard({ metric }: { metric: BrandedMetric }) {
  return (
    <MaterialCard variant="glass-regular">
      <View style={styles.metricSolidCard}>
        {/* Icon + Name */}
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>{metric.icon}</Text>
          <Text style={styles.metricName}>{metric.name}</Text>
        </View>
        
        {/* Score - large, high contrast */}
        <Text style={styles.metricScore}>{metric.value}</Text>
        
        {/* Label */}
        <Text style={[styles.metricLabel, { color: metric.color }]}>
          {metric.label}
        </Text>
        
        {/* Progress bar - solid */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${metric.value}%`,
                backgroundColor: metric.color,
              },
            ]}
          />
        </View>
      </View>
    </MaterialCard>
  );
}
```

**Before/After Comparison:**

| Before | After |
|--------|-------|
| BlurView card → text directly on blur | Glass container → solid card → text on white |
| Single material layer | Two-tier material (glass + solid) |
| Lower contrast | High contrast for readability |
| Good | Better (follows HIG) |

#### Task 3.3: Branded Metrics Overview

**6-metric grid + Voice IQ:**

```typescript
export function BrandedMetricsOverview({ metrics }: Props) {
  return (
    <View style={styles.container}>
      {/* Voice IQ - Hero, always solid */}
      <MaterialCard variant="solid-elevated" style={styles.voiceIqCard}>
        <View style={styles.voiceIqContent}>
          <Text style={styles.voiceIqLabel}>Voice IQ™</Text>
          <Text style={styles.voiceIqScore}>{metrics.voiceIQ.value}</Text>
          <Text style={styles.voiceIqDescriptor}>
            {metrics.voiceIQ.label}
          </Text>
          {/* Circular progress indicator */}
          <CircularProgress
            value={metrics.voiceIQ.value}
            size={120}
            strokeWidth={12}
          />
        </View>
      </MaterialCard>
      
      {/* 6 metrics in 2x3 grid */}
      <MaterialCard variant="glass-regular" style={styles.metricsGrid}>
        <View style={styles.grid}>
          {METRICS.map(key => (
            <View key={key} style={styles.metricCell}>
              <Text style={styles.cellIcon}>{metrics[key].icon}</Text>
              <Text style={styles.cellScore}>{metrics[key].value}</Text>
              <Text style={styles.cellLabel}>{metrics[key].name}</Text>
            </View>
          ))}
        </View>
      </MaterialCard>
    </View>
  );
}
```

**Deliverables:**
- [ ] Update RecordingCard with tiered materials
- [ ] Update VoiceMetrics cards
- [ ] Update BrandedMetricsOverview
- [ ] Create MetricPill component
- [ ] Test contrast ratios (WCAG AA minimum)
- [ ] Snapshot tests for visual regression

---

### Phase 4: Motion & Transitions (Week 4)

**Goal:** Add subtle Liquid Glass motion while respecting Reduce Motion

#### Task 4.1: Card Transitions

**Entrance animations for recording cards:**

```typescript
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

function AnimatedRecordingCard({ item, index }: Props) {
  const reduceMotion = useReduceMotion();
  
  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: 1, transform: [] };
    }
    
    return {
      opacity: withTiming(1, { duration: 300 }),
      transform: [
        {
          translateY: withSpring(0, {
            damping: 20,
            stiffness: 90,
            mass: 1,
          }),
        },
      ],
    };
  }, []);
  
  return (
    <Animated.View
      style={[animatedStyle, { marginBottom: SPACING.sm }]}
      entering={reduceMotion ? undefined : FadeIn.delay(index * 50)}
    >
      <RecordingCard item={item} />
    </Animated.View>
  );
}
```

#### Task 4.2: Glass Shimmer Effect

**Subtle highlight animation on glass surfaces (respects Reduce Motion):**

```typescript
function GlassShimmer() {
  const reduceMotion = useReduceMotion();
  const shimmerAnim = useSharedValue(0);
  
  useEffect(() => {
    if (reduceMotion) return;
    
    shimmerAnim.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reduceMotion]);
  
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerAnim.value, [0, 0.5, 1], [0.0, 0.15, 0.0]),
  }));
  
  if (reduceMotion) return null;
  
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.shimmer, shimmerStyle]}
    />
  );
}
```

#### Task 4.3: Navigation Transitions

**Screen transitions (system handles most of this):**

```typescript
// Just ensure we're using the standard iOS curves
const TRANSITIONS = {
  push: {
    animation: 'slide_from_right',
    config: {
      duration: 350,
      easing: 'ease-in-out',
    },
  },
  modal: {
    animation: 'slide_from_bottom',
    config: {
      duration: 300,
      easing: 'ease-out',
    },
  },
};
```

**Deliverables:**
- [ ] Card entrance animations
- [ ] Glass shimmer effect (optional, subtle)
- [ ] Navigation transitions
- [ ] Reduce Motion testing
- [ ] Performance profiling (60fps target)

---

### Phase 5: Accessibility & Testing (Week 5)

**Goal:** Ensure app works beautifully in all accessibility modes

#### Task 5.1: Accessibility Testing Matrix

**Test configurations:**

| Setting | Expected Behavior | Test Cases |
|---------|------------------|------------|
| **Reduce Transparency ON** | All glass → solid fallbacks | Screenshots of all screens |
| **Increase Contrast ON** | Borders thicker, colors saturated | Contrast ratio measurements |
| **Reduce Motion ON** | No shimmer, simple fades | Recording card list |
| **Dark Mode** | Glass adapts, maintains contrast | All screens in dark mode |
| **Dynamic Type (XL)** | Text scales, glass expands | Metric cards, Voice IQ |
| **VoiceOver ON** | All glass surfaces accessible | Full user flow |

#### Task 5.2: Contrast Validation

**Automated contrast checking:**

```typescript
// Test utility
function validateContrast(
  foreground: string,
  background: string,
  minRatio: number = 4.5
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  if (ratio < minRatio) {
    console.warn(
      `Low contrast: ${ratio.toFixed(2)} (min: ${minRatio}) 
       FG: ${foreground}, BG: ${background}`
    );
    return false;
  }
  return true;
}

// In component tests:
describe('VoiceMetrics', () => {
  it('maintains WCAG AA contrast on glass', () => {
    const fg = COLORS.label;
    const bg = computeEffectiveBackgroundColor('glass-regular');
    expect(validateContrast(fg, bg, 4.5)).toBe(true);
  });
});
```

#### Task 5.3: User Testing Script

**Test with 5-10 users:**

1. **Setup:**
   - Half use default settings
   - Half use Reduce Transparency + Increase Contrast
   
2. **Tasks:**
   - Record a 30-second voice sample
   - Find and play back a specific recording
   - Identify their Voice IQ score
   - Delete a recording
   
3. **Questions:**
   - Can you read all text easily? (1-5 scale)
   - Do the glass surfaces help or distract? (1-5 scale)
   - Does the app feel "calm" or "noisy"? (open-ended)
   - Any confusion about what's clickable? (yes/no + explain)

**Success criteria:**
- Average readability: ≥ 4/5
- Glass helpfulness: ≥ 3/5
- Zero confusion about clickable areas
- No users report "too busy" or "distracting"

**Deliverables:**
- [ ] Accessibility test suite
- [ ] Contrast validation tests
- [ ] User testing script
- [ ] User testing results report
- [ ] Bug fixes from testing

---

### Phase 6: Polish & Refinement (Week 6)

**Goal:** Final touches to make glass feel premium

#### Task 6.1: Haptic Feedback

**Coordinate haptics with glass interactions:**

```typescript
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

// Light haptic when tapping glass surfaces
function onGlassCardPress() {
  impactAsync(ImpactFeedbackStyle.Light);
  // navigate or perform action
}

// Medium haptic for primary actions
function onRecordPress() {
  impactAsync(ImpactFeedbackStyle.Medium);
  startRecording();
}

// Heavy haptic for destructive actions
function onDeleteConfirm() {
  impactAsync(ImpactFeedbackStyle.Heavy);
  deleteRecording();
}
```

#### Task 6.2: Loading States

**Glass-aware loading indicators:**

```typescript
function LoadingCard() {
  return (
    <MaterialCard variant="glass-regular">
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Analyzing audio…</Text>
      </View>
    </MaterialCard>
  );
}

// Skeleton screens on glass
function RecordingCardSkeleton() {
  return (
    <MaterialCard variant="glass-regular">
      <View style={styles.skeleton}>
        <SkeletonPlaceholder>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonMetrics} />
        </SkeletonPlaceholder>
      </View>
    </MaterialCard>
  );
}
```

#### Task 6.3: Edge Cases

**Handle special states:**

1. **Empty states:**
   - "No recordings yet" on glass card
   - Illustration + CTA on solid background

2. **Error states:**
   - Recording failed → solid red card with retry button
   - Network error (future) → solid orange card

3. **Processing states:**
   - "Analyzing..." badge on glass
   - Progress indicator on solid card inside

4. **Full-screen waveform:**
   - Switch to Clear glass for overlays
   - Dimming layer behind controls
   - Back button on clear glass

**Deliverables:**
- [ ] Haptic feedback integrated
- [ ] Loading states on glass
- [ ] Empty states designed
- [ ] Error states designed
- [ ] Full-screen mode with Clear glass

---

## 🎨 Design Specifications

### Material Hierarchy Reference

**Quick decision tree:**

```
Is this element...
├─ Navigation/Chrome? 
│  └─ YES → Liquid Glass Regular
├─ Over media/waveform?
│  └─ YES → Liquid Glass Clear + dimming
├─ Critical data/metric?
│  └─ YES → Solid elevated card
├─ Primary content?
│  └─ YES → Solid flat background
└─ Secondary container?
   └─ YES → Glass Regular container + Solid content inside
```

### Glass Usage Map (Final State)

```
App Structure:
├─ Navigation Bar (all screens)              → Liquid Glass Regular
├─ Tab Bar (future)                          → Liquid Glass Regular
├─ MainRecordingScreen
│  ├─ Background                             → Solid (gradient)
│  ├─ Waveform container                     → Solid black
│  ├─ Session info card                      → Glass Regular → Solid content
│  ├─ Voice Metrics grid                     → Glass Regular → Solid cells
│  ├─ Recording controls                     → Solid buttons
│  └─ Branded metrics overview               → Glass Regular + Solid Voice IQ
├─ RecordingsListScreen
│  ├─ Background                             → Solid
│  ├─ Search bar (future)                    → Glass Regular
│  ├─ Recording cards                        → Glass Regular → Solid content
│  ├─ FAB (future)                           → Glass Regular pill
│  └─ Empty state                            → Solid card
├─ RecordingDetailsScreen
│  ├─ Background                             → Solid
│  ├─ Header card                            → Glass Regular → Solid content
│  ├─ Playback controls                      → Solid
│  ├─ Metrics cards                          → Glass Regular → Solid cells
│  └─ Waveform (full-screen mode)            → Clear glass overlays
└─ Settings (future)
   ├─ Background                             → Solid
   └─ Section cards                          → Glass Regular → Solid rows
```

### Color & Contrast Guidelines

**On Liquid Glass Regular:**
- Primary text: `COLORS.label` (≥ 7:1 contrast)
- Secondary text: `COLORS.secondaryLabel` (≥ 4.5:1 contrast)
- Icons: `COLORS.label` or semantic colors
- Avoid: Custom low-contrast colors

**On Liquid Glass Clear:**
- Always use solid pills/cards for text
- Dimming layer: 0.2-0.4 opacity
- Ensure text on pills has ≥ 7:1 contrast

**On Solid Elevated:**
- Standard contrast rules apply
- Use semantic colors from system
- Test in both light and dark mode

### Motion Guidelines

**Spring animations (when not Reduce Motion):**
```typescript
const springConfig = {
  damping: 20,
  stiffness: 90,
  mass: 1,
  overshootClamping: false,
};
```

**Timing animations:**
```typescript
const timingConfig = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
};
```

**Never animate:**
- Critical feedback (errors, success)
- Text content
- Important state changes (when Reduce Motion is on)

---

## 🔬 Technical Considerations

### Performance

**Target metrics:**
- 60fps on glass surfaces
- < 16ms frame time
- < 100ms interaction response

**Optimization strategies:**
1. Use `shouldRasterizeIOS` for static glass surfaces
2. Avoid nesting multiple glass layers
3. Cache glass effect views when possible
4. Profile with Instruments (Time Profiler)

### Compatibility

**iOS versions:**
- iOS 26+: Native Liquid Glass
- iOS 25: BlurView fallback (same visual, less physics)
- iOS 24-: BlurView fallback

**Android:**
- No Liquid Glass (platform-specific)
- Use solid elevated cards
- Respect Material Design 3

### Bundle Size

**Impact estimate:**
- Native Liquid Glass: 0 KB (system API)
- BlurView fallback: ~50 KB (already included)
- Animation libraries: Already using Reanimated

**No significant size increase expected.**

---

## 📊 Success Metrics

### Qualitative Goals

- [ ] App feels "cohesive with iOS 26" (user feedback)
- [ ] Voice metrics are "easy to read" (user feedback)
- [ ] Glass doesn't "distract from data" (user feedback)
- [ ] App feels "premium but calm" (user feedback)

### Quantitative Goals

- [ ] WCAG AA contrast met on 100% of text
- [ ] 60fps maintained on all glass surfaces
- [ ] Zero accessibility regressions
- [ ] ≤ 5% user preference for "Reduce Transparency" due to app
- [ ] App Store rating maintains or improves

### A/B Test Ideas (Future)

1. **Glass density:**
   - A: Current plan (glass + solid tiers)
   - B: More aggressive glass everywhere
   - Measure: User engagement, readability scores

2. **Voice IQ placement:**
   - A: Solid elevated card (current)
   - B: Large glass hero card
   - Measure: Metric visibility, screenshot shares

---

## 🚀 Launch Strategy

### Phased Rollout

**Week 1-6:** Development (following roadmap above)

**Week 7:** Internal testing
- Team dogfooding
- Fix critical bugs
- Performance optimization

**Week 8:** Beta testing (TestFlight)
- 50-100 beta testers
- Accessibility users (10+)
- Diverse devices (iPhone 12-16)

**Week 9:** Staged rollout
- 10% of users (monitor crash rate)
- 50% of users (if metrics good)
- 100% of users (if all clear)

**Week 10:** Post-launch optimization
- Monitor analytics
- Collect feedback
- Plan iteration

---

## 📚 References & Resources

### Apple Documentation
- [Human Interface Guidelines - Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Adopting Liquid Glass (iOS 26)](https://developer.apple.com/documentation/uikit/adopting-liquid-glass)
- [Accessibility - Reduce Transparency](https://developer.apple.com/documentation/uikit/accessibility/reduce-transparency)

### Design Inspiration
- Apple Music (iOS 26): Glass navigation + solid content cards
- Apple Maps (iOS 26): Clear glass overlays on map
- Health app: Solid metrics on subtle backgrounds

### Implementation Examples
- [react-native-blur GitHub](https://github.com/Kureev/react-native-blur)
- [Reanimated Shared Element Transitions](https://docs.swmansion.com/react-native-reanimated/)

---

## ✅ Pre-Implementation Checklist

Before starting development:

- [ ] Stakeholder approval on tiered material strategy
- [ ] Design mockups created (Figma/Sketch)
- [ ] iOS 26 SDK access confirmed
- [ ] Team familiar with Liquid Glass HIG
- [ ] Accessibility testing plan approved
- [ ] Performance benchmarks established
- [ ] User testing plan ready
- [ ] Rollback plan if metrics drop

---

## 🎯 North Star Vision

**6 Months from Now:**

"Our Voice Analyzer app is the most visually refined voice analysis tool on iOS. Users love how the Liquid Glass navigation feels 'pure iOS 26' while our solid Voice IQ cards and metrics feel 'focused and premium.' Accessibility users praise us for readable text and graceful fallbacks. When users screenshot their Voice IQ, they share it on social media because it looks *beautiful* – the glass framing makes the solid metric cards feel like precious gems. We've mastered the balance: the system provides spectacle, we provide clarity."

**The app doesn't compete with iOS for attention – it rests on iOS like a precision instrument on a glass table.** 🪟

---

**Document Version:** 1.0  
**Status:** 📋 Ready for Stakeholder Review  
**Next Update:** After Phase 1 completion

**Created by:** GitHub Copilot CLI  
**Date:** November 16, 2025
