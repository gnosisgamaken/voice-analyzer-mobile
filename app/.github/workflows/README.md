# CI/CD Configuration

This directory contains GitHub Actions workflows for automated testing and deployment.

## Workflows

### `e2e-tests.yml`
**Trigger:** Pull requests and pushes to `main`/`develop`

Runs Maestro E2E tests on iOS Simulator:
- Builds the app for iOS Simulator
- Boots iPhone 15 Pro simulator
- Runs all Maestro test flows
- Uploads test results and screenshots
- Comments on PRs with test status

**Duration:** ~15-20 minutes

### `pr-checks.yml`
**Trigger:** Pull requests to `main`/`develop`

Lightweight checks that run on every PR:
- TypeScript compilation check
- ESLint (if configured)
- Build verification
- Jest unit tests with coverage

**Duration:** ~10 minutes

## Configuration

### Required Secrets
No secrets required for basic functionality. Optional:
- `CODECOV_TOKEN` - For test coverage reporting

### Runner Requirements
- **E2E Tests:** `macos-14` (for iOS simulator)
- **PR Checks:** `ubuntu-latest` for lint/tests, `macos-14` for build

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Test PR checks workflow
act pull_request -W .github/workflows/pr-checks.yml

# Note: E2E tests require macOS and cannot run with act
```

## Optimization Tips

1. **Caching:** Both workflows cache npm and CocoaPods dependencies
2. **Parallel Jobs:** PR checks run lint/test in parallel with build
3. **Conditional Steps:** Screenshots only uploaded on failure
4. **Timeouts:** All jobs have reasonable timeouts to prevent hanging

## Troubleshooting

### Build Fails with "No matching provisioning profiles found"
- This is normal for simulator builds, they don't need provisioning
- Ensure `-sdk iphonesimulator` is specified

### Maestro Tests Timeout
- Increase `timeout-minutes` in the job definition
- Check simulator boot logs in the workflow output

### Pod Install Fails
- Clear CocoaPods cache in repository settings
- Verify `Podfile.lock` is committed to the repository

## Next Steps

- Add deployment workflow for TestFlight
- Set up automatic version bumping
- Add performance benchmarking with Maestro
- Configure Slack/Discord notifications
