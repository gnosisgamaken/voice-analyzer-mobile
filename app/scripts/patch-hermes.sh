#!/bin/bash
# Patch hermes-engine.podspec to fix REACT_NATIVE_PATH issue
# This script is run automatically after npm install

PODSPEC="node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec"

if [ -f "$PODSPEC" ]; then
  echo "Patching hermes-engine.podspec..."
  # Check if already patched
  if grep -q "export REACT_NATIVE_PATH" "$PODSPEC"; then
    echo "✅ Hermes podspec already patched"
  else
    # Add export REACT_NATIVE_PATH before the first occurrence of with-environment.sh
    # Using SRCROOT which points to the Pods directory during build
    sed -i '' 's/\. "\$REACT_NATIVE_PATH\/scripts\/xcode\/with-environment.sh"/export REACT_NATIVE_PATH="$SRCROOT\/..\/..\/node_modules\/react-native"\n        . "\$REACT_NATIVE_PATH\/scripts\/xcode\/with-environment.sh"/' "$PODSPEC"
    echo "✅ Hermes podspec patched successfully"
  fi
else
  echo "⚠️  Warning: hermes-engine.podspec not found at $PODSPEC"
fi
