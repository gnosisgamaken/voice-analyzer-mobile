# E2E Testing with Maestro

This directory contains end-to-end tests written in Maestro for the Voice Analyzer app.

## Setup

1. Install Maestro CLI:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

2. Ensure the iOS Simulator is running or a physical device is connected.

## Running Tests

```bash
# Run all tests
maestro test .maestro/

# Run a specific test
maestro test .maestro/recording-flow.yaml

# Run with video recording
maestro test --record .maestro/recording-flow.yaml
```

## Test Coverage

- **recording-flow.yaml**: Core recording flow (record → pause → resume → stop → save)
- **permissions-denial.yaml**: Microphone permissions denial flow
- **view-details-delete.yaml**: View recording details and delete

## Tips

- Use `maestro studio` for interactive debugging
- Use `maestro record` to generate test steps interactively
- Tests use accessibility labels (testID in React Native)
