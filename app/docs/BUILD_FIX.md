# Build Fix: react-native-safe-area-context Issue

**Date:** November 24, 2025  
**Issue:** Peer dependency conflict causing build failures  
**Status:** ✅ RESOLVED

---

## Problem

`react-native-safe-area-context` was causing compilation errors:
```
fatal error: 'react/renderer/components/safeareacontext/Props.h' file not found
```

**Root Cause:**  
- Library is a peer dependency of `@react-navigation/native`
- Version auto-installed (4.0.0+) has New Architecture code incompatible with RN 0.81.5
- We use React Native's built-in `SafeAreaView` instead

---

## Solution

### Clean Rebuild Process
```bash
# 1. Clean everything
rm -rf node_modules package-lock.json ios/Pods ios/Podfile.lock ios/build

# 2. Install without peer deps
npm install --legacy-peer-deps

# 3. Install dev dependencies
npm install --include=dev

# 4. Reinstall pods
cd ios && pod install && cd ..

# 5. Build
npx react-native run-ios --device
```

---

## Result

**Pods Installed:** 83 (no safe-area-context)  
**Build:** ✅ Clean compilation  
**Functionality:** Using React Native built-in SafeAreaView

### Update (Haptic Feedback Fix)
`react-native-haptic-feedback` was missing files (`DeviceUtils.mm`).
**Fix:** Reinstalled package:
```bash
npm uninstall react-native-haptic-feedback
npm install react-native-haptic-feedback
cd ios && pod install
```
Verified `DeviceUtils.mm` exists and build proceeds.

### Update (Hermes Build Fix)
**Issue:** `HermesExecutorFactory.cpp` failed to compile with `no member named 'thread' in namespace 'std'`.
**Cause:** Missing `#include <thread>` in React Native 0.81.5 source.
**Fix:** Manually patched `node_modules/react-native/ReactCommon/hermes/executor/HermesExecutorFactory.cpp` to include `<thread>`.
```bash
sed -i '' 's/#include "HermesExecutorFactory.h"/#include "HermesExecutorFactory.h"\n#include <thread>/' node_modules/react-native/ReactCommon/hermes/executor/HermesExecutorFactory.cpp
```
