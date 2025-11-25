# Voice Analyzer - CI/CD Pipeline

## ✅ What's Automated

### Pull Request Checks (`pr-checks.yml`)
Every PR automatically runs:
- ✅ TypeScript compilation check
- ✅ Build verification (iOS)
- ✅ Jest unit tests with coverage
- ⏱️ **Duration:** ~10 minutes

### E2E Tests (`e2e-tests.yml`)
Automatically runs on PR and main branch:
- ✅ Builds iOS app for simulator
- ✅ Runs all 4 Maestro test flows
- ✅ Uploads test results (JUnit format)
- ✅ Screenshots on failure
- ✅ PR comments with test status
- ⏱️ **Duration:** ~15-20 minutes

### Security (`dependency-review.yml`)
Scans for vulnerable dependencies:
- ✅ Checks for moderate+ severity CVEs
- ✅ Blocks GPL/AGPL licenses
- ⏱️ **Duration:** ~2 minutes

## 🚀 Quick Start

### Enable Actions
1. Push to GitHub repository
2. Navigate to **Actions** tab
3. Enable workflows if prompted

### Manual Trigger
```bash
# Trigger E2E tests manually
gh workflow run e2e-tests.yml
```

### View Results
- Check **Actions** tab for workflow runs
- Test results appear as PR comments
- Download artifacts (screenshots, JUnit reports)

## 📊 Workflow Status Badges

Add to README.md:
```markdown
![E2E Tests](https://github.com/{owner}/{repo}/workflows/E2E%20Tests/badge.svg)
![PR Checks](https://github.com/{owner}/{repo}/workflows/PR%20Checks/badge.svg)
```

## 🔧 Configuration

### Customize Test Runs
Edit `.github/workflows/e2e-tests.yml`:
```yaml
- name: Run Maestro Tests
  run: |
    # Run specific test
    maestro test .maestro/recording-flow.yaml
    
    # Or run with different options
    maestro test .maestro/ --include-tags smoke
```

### Change Trigger Events
```yaml
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

## 📈 Next Steps

- [ ] Add TestFlight deployment workflow
- [ ] Set up Slack/Discord notifications
- [ ] Add performance benchmarking
- [ ] Configure branch protection rules
- [ ] Add automatic version bumping

## 🐛 Troubleshooting

**Build fails with CocoaPods error:**
- Clear cache in repository settings > Actions > Caches
- Verify `Podfile.lock` is committed

**E2E tests timeout:**
- Increase `timeout-minutes` in job
- Check simulator boot logs in workflow output

**No test results uploaded:**
- Verify `maestro test --format junit` is working locally
- Check file permissions in `test-results/` directory
