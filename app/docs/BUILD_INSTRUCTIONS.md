# iOS Build Instructions

## Quick Build

From the `app` directory:

```bash
npx react-native run-ios --device
```

## Clean Build (if issues occur)

```bash
# 1. Clean npm dependencies
rm -rf node_modules
npm install  # This will auto-run the postinstall script to patch Hermes

# 2. Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock build
pod install
cd ..

# 3. Build and run
npx react-native run-ios --device
```

## Important Fixes Applied

### Hermes REACT_NATIVE_PATH Fix

The Hermes build script requires `REACT_NATIVE_PATH` to be set, but it's not available in the script execution environment. We've implemented a **permanent fix** that survives `npm install`:

1. **Podspec Patch**: `node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec` is patched to export `REACT_NATIVE_PATH` before running the build script.

2. **Postinstall Script**: `scripts/patch-hermes.sh` automatically applies the patch after every `npm install`.

3. **Package.json Hook**: The `postinstall` script in `package.json` ensures the patch runs automatically.

### C++ Standard

All pods compile with C++20 via the `post_install` hook in `ios/Podfile`:

```ruby
config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
```

This fixes Hermes compilation errors related to `std::thread` and `std::unordered_set::contains()`.

### Dependencies

- **React Native**: `0.81.5`
- **iOS Deployment Target**: `15.1`
- **Hermes**: Enabled (legacy architecture)
- **Fabric**: Disabled (using legacy architecture)
- **react-native-safe-area-context**: `4.5.3` (compatible with RN 0.81.5)

## Troubleshooting

### Build fails with "No such file or directory: with-environment.sh"

This means the Hermes podspec patch is missing. Run:

```bash
./scripts/patch-hermes.sh
cd ios && pod install && cd ..
```

### Build fails with C++ errors

Ensure C++20 is set in the Podfile's `post_install` hook and run:

```bash
cd ios && pod install && cd ..
```

### CLI not found errors

Reinstall npm dependencies:

```bash
rm -rf node_modules && npm install
```
