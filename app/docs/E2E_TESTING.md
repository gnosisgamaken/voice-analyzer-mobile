# E2E Testing Setup Guide

## Prerequisites

1. **Install Maestro CLI**
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. **Verify Installation**
   ```bash
   maestro --version
   ```

3. **Build the App**
   ```bash
   # Build for iOS Simulator
   npm run ios
   
   # Or for a specific simulator
   react-native run-ios --simulator="iPhone 15 Pro"
   ```

## Running Tests

### Run All Tests
```bash
maestro test .maestro/
```

### Run Individual Tests
```bash
# Core recording flow (recommended to run first)
maestro test .maestro/recording-flow.yaml

# Permissions denial
maestro test .maestro/permissions-denial.yaml

# View details and delete
maestro test .maestro/view-details-delete.yaml

# Baseline establishment (takes ~30 seconds)
maestro test .maestro/baseline-establishment.yaml
```

### Record Test Execution
```bash
# Record video of test execution
maestro test --record .maestro/recording-flow.yaml
```

## Debugging Tests

### Interactive Mode (Maestro Studio)
```bash
maestro studio
```

This opens an interactive UI where you can:
- Step through tests manually
- Inspect the app hierarchy
- Generate new test steps

### Recording Mode
```bash
maestro record
```

This records your manual interactions and generates a Maestro test file.

## Test Coverage

| Test File | Coverage | Duration |
|-----------|----------|----------|
| `recording-flow.yaml` | Record → Pause → Resume → Stop → View Details | ~15s |
| `permissions-denial.yaml` | Microphone permission denial handling | ~5s |
| `view-details-delete.yaml` | Navigate to details → Delete recording | ~10s |
| `baseline-establishment.yaml` | Record 5 sessions to establish baseline | ~30s |

## Troubleshooting

### Test fails with "Element not found"
- Verify the app is running in the simulator
- Check that `testID` props match between the test and component
- Use `maestro studio` to inspect the hierarchy

### Microphone permission tests fail
- Reset simulator permissions: `xcrun simctl privacy <device_id> reset microphone`
- Or reset all: `xcrun simctl erase all`

### App crashes during test
- Check Metro bundler logs for JavaScript errors
- Verify native modules are properly linked
- Run `cd ios && pod install` if needed

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    maestro test .maestro/ --format junit --output test-results/
```

### Upload Results
```yaml
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: maestro-results
    path: test-results/
```

## Next Steps

1. Add more edge case tests (background audio, interruptions)
2. Set up continuous testing on CI/CD
3. Add performance benchmarks using Maestro's `--benchmark` flag
