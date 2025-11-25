# 🧪 Voice Analyzer - Testing Guide

This guide helps you verify the latest updates, specifically the **Loading Spinners** and **Testing Logs**.

## 1. Verifying Loading States

### Recordings List
1. **Action:** Launch the app.
2. **Observation:** You should briefly see a **Loading Spinner** and the text "Loading recordings..." in the center of the screen before the list appears.
   - *Note: If the app loads too fast, you might miss it. You can artificially delay the load in `RecordingsListScreen.tsx` to test.*

### Insights Generation
1. **Action:** Tap on a recording to view details.
2. **Observation:** Scroll down to the "Insights" section.
3. **Observation:** If insights are being generated, you should see a **Loading Spinner** inside the card with "Generating insights...".

## 2. Verifying Testing Logs

We've added a special `[TEST_LOG]` tag to help you track key app events in the console.

### How to View Logs
- **iOS Simulator:** Open the Metro bundler terminal or use Console.app filtering for `[TEST_LOG]`.
- **Command Line:** Run `npx react-native log-ios` (or `log-android`).

### Key Logs to Watch For

| Action | Log Message | Expected Data |
|--------|-------------|---------------|
| **App Launch** | `[TEST_LOG] Finished loading recordings` | None |
| **Load Error** | `[TEST_LOG] Failed to load recordings` | Error details |
| **View Recording** | `[TEST_LOG] Insights generated` | `{ count: N }` |

## 3. Feedback Checklist

Please report back on the following:

- [ ] **Spinners:** Did you see the spinners appear correctly? Are they sized appropriately?
- [ ] **Smoothness:** Did the list animate in smoothly after the spinner disappeared?
- [ ] **Logs:** Were you able to see the `[TEST_LOG]` messages in your console?
- [ ] **Crashes:** Did you encounter any errors or white screens?

## 4. Troubleshooting

**If you don't see logs:**
- Ensure you are running in Development mode (`__DEV__` is true).
- Check that your Metro bundler is connected.

**If spinners stick:**
- This means the async operation failed or hung. Check the logs for errors.
