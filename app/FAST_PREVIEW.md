# Fast Preview Guide

Quick ways to preview and develop the app with hot reload.

## 🚀 Fastest Options (Ranked by Speed)

### 1. **iOS Simulator** ⚡⚡ VERY FAST
**Best for:** Full native testing without physical device

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Launch iOS Simulator (or use Xcode)
npm run ios
# or open Xcode and run in simulator
```

**Pros:**
- ⚡ Fast builds (~30-60 seconds first time, ~5-10 seconds after)
- 🔥 Hot reload enabled
- 📱 Full native iOS experience
- 🎤 Simulated microphone (for testing)
- 🛠️ Full debugging tools

**Cons:**
- 💻 Requires Xcode installed
- 🖥️ Mac only
- ⚠️ Simulator has limitations (no real microphone)

**When to use:**
- Testing native features
- iOS-specific development
- Full app testing without device

### 2. **Physical Device (Development Mode)** ⚡⚡⚡ FAST
**Best for:** Real audio testing, final verification

```bash
# Terminal 1: Start Metro bundler
npm start

# In Xcode: Build in Debug mode (Cmd + R)
# App will connect to Metro automatically
```

**Pros:**
- ⚡ Fast reload (after initial build)
- 🔥 Hot reload enabled
- 📱 Real device testing
- 🎤 Real microphone access
- ✅ Production-like environment

**Cons:**
- 🏗️ Initial build takes 1-2 minutes
- 📱 Requires physical device connected
- 🔌 Needs to be on same WiFi network

**When to use:**
- Testing real audio recording
- Final verification before release
- Performance testing

---

## 📊 Comparison Table

| Method | Startup Time | Reload Speed | Native Features | Best For |
|--------|-------------|--------------|-----------------|----------|
| **iOS Simulator** | ~30-60 sec | ~1-2 sec | Full | Native testing |
| **Physical Device** | ~1-2 min | ~1-2 sec | Full | Real audio testing |

---

## 🎯 Recommended Workflow

### For UI Development / Native Iteration:
```bash
npm start
# Then in Xcode: Cmd + R (Debug mode)
```
→ Make changes → Save → Auto-reloads

### For Quick Testing:
```bash
npm run ios
```
→ Opens simulator automatically

---

## 🔧 Tips for Faster Development

### 1. **Keep Metro Running**
- Leave `npm start` running in background
- Just rebuild in Xcode when needed

### 2. **Use Fast Refresh**
- Enabled by default in React Native
- Saves state during hot reload
- Faster than full reload

### 3. **Clear Cache When Needed**
```bash
npm run start:clean
```

### 4. **Development vs Release**
- **Debug mode:** Hot reload, dev tools, slower
- **Release mode:** No hot reload, faster, production-like
- Use Debug for development, Release for final testing

---

## 🐛 Troubleshooting

**Simulator not connecting?**
- Ensure Metro bundler is running
- Check network connection
- Try: `npm start -- --reset-cache`

**Physical device not connecting?**
- Ensure same WiFi network
- Check Metro bundler URL
- Shake device → "Reload" option

---

## 📝 Quick Commands Reference

```bash
# Start Metro only
npm start

# iOS Simulator quick launch
npm run ios

# Clean Metro cache
npm run start:clean
```

---
**💡 Pro Tip:** Keep Metro running in one terminal and Xcode (or `npm run ios`) ready in another for the fastest edit → refresh loop!
