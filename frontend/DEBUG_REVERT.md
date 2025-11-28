# Debugging Transaction Revert

## Possible Causes

The contract `completeLevel()` function has several validation checks that could cause a revert:

### 1. **Invalid Level** (Line 139)
```solidity
if (level != session.currentLevel || level > MAX_LEVELS) {
    revert InvalidLevel();
}
```
**Checks:**
- The level you're trying to complete must match the blockchain's `session.currentLevel`
- Level must be ≤ 5

**Possible Issue:**
- If blockchain thinks you're on level 2, but you're trying to complete level 1 → REVERT

### 2. **Level Time Expired** (Line 144)
```solidity
if (block.timestamp > session.levelStartTime + LEVEL_DURATION) {
    revert LevelTimeExpired();
}
```
**Checks:**
- Must complete level within 60 seconds

**Possible Issue:**
- If more than 60 seconds passed since level started → REVERT
- **NOTE:** Client-side timer might not match blockchain time!

### 3. **Wrong Alien Count** (Line 150)
```solidity
uint256 expectedAliens = getAlienCountForLevel(level);
if (aliensDestroyed != expectedAliens) {
    revert InvalidLevelHash();
}
```
**Checks:**
- Level 1: Must destroy exactly 11 aliens
- Level 2: Must destroy exactly 22 aliens
- etc.

**Possible Issue:**
- If sending wrong alien count → REVERT

### 4. **Session Not Active** (Modifier Line 134)
```solidity
onlyActiveSession(sessionId)
```
**Checks:**
- `session.isActive` must be `true`

**Possible Issue:**
- If session was abandoned or completed → REVERT

## Most Likely Cause

Based on the code, I suspect **#2: Level Time Expired** is the issue because:

1. ✅ We're sending correct level number (`currentLevel - 1`)
2. ✅ We're sending correct alien count (`11 * level`)
3. ❓ **Client-side timer might not match blockchain time**

The client-side timer uses `Date.now()` but the blockchain uses `block.timestamp`. These can drift!

## How to Debug

Run the game and when you click "RECORD LEVEL", check the console output:

```
🎯 === LEVEL COMPLETION DEBUG ===
📊 Session ID: ...
📊 Completed Level: 1
📊 Current Level (in state): 2
📊 Levels Completed: 0
📊 Aliens Destroyed: 11
📊 Score: 100
📊 Time Remaining: XX seconds  ← Check this!
🎯 ============================
```

**If "Time Remaining" is 0 or negative** → That's the issue!

## Potential Fix

If time expiry is the issue, we need to either:
1. Increase `LEVEL_DURATION` in the contract
2. Sync `levelStartTime` from blockchain instead of using client-side timer
3. Add a buffer (complete level before timer hits 0)
