# Android Autolinking Path Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent Windows Android builds from reusing stale Expo/React Native autolinking cache files generated under WSL paths.

**Architecture:** Add a small guard in `app_end/android/settings.gradle` before Expo/RN autolinking runs. The guard checks whether the cached `autolinking.json` root path matches the current filesystem root and deletes the generated autolinking directory when it does not.

**Tech Stack:** Gradle Groovy, Expo SDK 54, React Native 0.81, Android autolinking

---

### Task 1: Guard stale autolinking cache

**Files:**
- Modify: `app_end/android/settings.gradle`

**Step 1: Confirm the failing cache shape**

Inspect: `app_end/android/build/generated/autolinking/autolinking.json`
Expected: cached `root` points to `/mnt/...` while the Windows build runs from `E:\...`.

**Step 2: Add the minimal guard**

Implement a helper in `app_end/android/settings.gradle` that:
- reads `build/generated/autolinking/autolinking.json` when present
- computes the expected project root from the current Gradle settings location
- deletes `build/generated/autolinking` if the cached `root` does not match the current root

**Step 3: Verify behavior**

Run a Windows-side Android build after one cross-environment cache mismatch.
Expected: the stale directory is removed once, autolinking is regenerated for the current root, and dependency resolution proceeds past `No matching variant`.

### Task 2: Persist the troubleshooting rule

**Files:**
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

**Step 1: Record the reusable conclusion**

Add short notes covering:
- Android builds should stick to one filesystem/runtime per native cache cycle
- `android/build/generated/autolinking` can poison Windows builds if generated under WSL
- settings-level root-path guard is the preferred minimal fix
