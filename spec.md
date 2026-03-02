# BP Bunk Sales Manager

## Current State

The app has Internet Identity login (Step 1) and delete-with-password for day sales (Step 2). The backend stores bunk setup (name/location), all day sales, and credit settlements per Principal (caller identity), so data is already account-specific. However:
- `getSetup()` is called independently in `AppHeader` and `PrintSalesPage`, causing redundant canister calls and no shared state.
- There is no centralized context for bunk setup data -- it's fetched in isolation by each component.
- No confirmation/welcome indicator that the account's bunk data was successfully restored after login on a new device.

## Requested Changes (Diff)

### Add
- `BunkSetupContext` (React context + provider): loads bunk setup once after login, shares `{ bunkName, location, loading, reload }` across the whole app tree.
- Welcome banner/toast on `HomePage` on first load (per login session) confirming the station name and location were loaded from the user's account, so they can visually confirm data portability across devices.

### Modify
- `AppHeader`: remove its own `getSetup()` call; consume `BunkSetupContext` instead.
- `PrintSalesPage`: remove its own `getSetup()` call; consume `BunkSetupContext` instead.
- `App.tsx`: wrap the authenticated app tree with `BunkSetupProvider` (placed inside `SetupGuard` so it only loads once setup exists).
- `SetupPage`: after saving setup, trigger a `reload` from context so the header updates immediately.

### Remove
- Duplicate `getSetup()` calls in `AppHeader` and `PrintSalesPage`.

## Implementation Plan

1. Create `src/frontend/src/contexts/BunkSetupContext.tsx` with a provider that calls `actor.getSetup()` once and exposes `{ setup, loading, reload }`.
2. Wrap the authenticated app tree in `App.tsx` with `BunkSetupProvider` inside `SetupGuard`.
3. Update `AppHeader` to read from `useBunkSetup()` instead of calling `actor.getSetup()` directly.
4. Update `PrintSalesPage` to read `setup` from `useBunkSetup()` instead of local state + actor call.
5. Update `SetupPage` to call `reload()` from `useBunkSetupContext` after successful save (so header refreshes without page reload).
6. Add a session-once welcome toast in `HomePage` that shows the bunk name/location when loaded, confirming the data was restored from the user's account.
7. Validate (typecheck + build).
