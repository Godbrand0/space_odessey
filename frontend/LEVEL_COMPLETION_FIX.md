# Level Completion Bug Fix

## The Problem

**Transaction was reverting** with "execution reverted" error when trying to complete a level.

### Root Cause

The bug was in `GameUI.tsx` line 65:

```typescript
// ❌ WRONG - currentLevel already incremented!
await completeLevel(
  gameState.sessionId,
  gameState.currentLevel,  // This is LEVEL 2 after completing Level 1!
  ...
)
```

**What was happening:**
1. Player completes Level 1
2. Game loop calls `onLevelComplete(1)`
3. `useGameState` immediately sets `currentLevel = 2`
4. Player clicks "CLAIM REWARD" button
5. Frontend sends `completeLevel(sessionId, 2, ...)` ← **WRONG!**
6. Contract checks: "Session is on level 1, why are you completing level 2?"
7. Contract reverts with `InvalidLevel()` error

## The Fix

Changed to use the **previous level** (currentLevel - 1):

```typescript
// ✅ CORRECT - use the level we just completed
const completedLevel = gameState.currentLevel - 1
await completeLevel(
  gameState.sessionId,
  completedLevel,  // This is LEVEL 1 (the one we just finished)
  100 * completedLevel,
  11 * completedLevel,
  proof
)
```

## UI Improvements

Also updated button labels to be clearer:

### Before
- Button 1: "CLAIM REWARD" (misleading - doesn't actually send CELO)
- Button 2: "CONTINUE"

### After
- Button 1: "RECORD LEVEL" (accurate - records completion on blockchain)
- Button 2: "NEXT LEVEL" (clearer intent)
- Added hint: "CLAIM ALL REWARDS AFTER GAME ENDS"

## Game Flow Clarification

### After Each Level (1-4):
1. **"RECORD LEVEL"** button → Signs transaction to `completeLevel()`
   - Records level completion on blockchain
   - Adds 2 CELO to `totalRewardsEarned` (tracked, not sent)
   - No CELO transferred yet

2. **"NEXT LEVEL"** button → Continues game locally
   - No blockchain transaction
   - Just starts next level

### After Level 5 or Game Over:
1. Game ends → `isActive = false`
2. **"CLAIM PRIZE!"** button → Signs transaction to `claimRewards()`
   - **NOW** the CELO is actually transferred to wallet
   - Receives all accumulated rewards (2 CELO × levels completed)

## Files Changed

- `frontend/components/GameUI.tsx`
  - Fixed `handleCompleteLevel()` to use `currentLevel - 1`
  - Updated button labels and added clarifying text
