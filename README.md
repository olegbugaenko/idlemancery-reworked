# IdleMancery Reworked

Idle RPG game with magic and crafting system built with React and Web Workers.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `src/components/` - React UI components
- `src/worker/modules/` - Game logic (Web Worker)
- `src/context/` - React contexts
- `public/icons/` - Game assets and icons

## For Developers

See `AI_CONTEXT.md` for detailed technical documentation and development guidelines. 

## Unlock Notifications: How it works

This project has a generic “New” notification system used across tabs (Furniture, Spells, Actions, Inventory, Workshop, Social, etc.). Below is a short, practical guide.

### 1) Module overview

- Worker-side module: `src/worker/shared/modules/unlock-notifications.module.js`
- Responsibilities:
  - Tracks a registry of potential notification paths (scope → category → [optional subcategory] → id)
  - Stores per-id flags: `isUnlocked`, `isViewed`
  - Exposes APIs to register notifications and mark them as viewed
  - Aggregates “what’s new” and sends payloads to the UI on request
  - Triggers regeneration hooks on feature modules

### 2) Registering new notifications

From any worker module (e.g., property, shop, actions, workshop, social), when you have a list of entities/items:

```js
gameCore.getModule('unlock-notifications').registerNewNotification(
  'scope',      // e.g., 'property', 'spellbook', 'actions', 'workshop', 'social'
  'category',   // e.g., 'furniture', 'spellbook', 'all', 'plantations', 'events'
  'subcategory',// optional: use when you have an extra level (or pass 'all')
  entity.id,    // unique id to track
  entity.isUnlocked && !entity.isCapped // isUnlocked flag
);
```

Notes:
- If you have a 3-level hierarchy (scope/category/id), pass `null` or omit subcategory.
- If you need 4 levels, pass a subcategory string. The registry handles both forms.
- Call this during module initialization or refresh hooks (e.g., after unlocking, list rebuilds).

### 3) Generating and sending notifications to UI

- The notifications module exposes an event API:
  - `query-new-unlocks-notifications` with `{ suffix, scope, category, subcategory, id }` → responds with `new-unlocks-notifications[-suffix]` payload
  - Many tabs poll this periodically; when game state changes, modules may also call `generateNotifications()` to refresh the registry
- Typical worker-side usage when something changes:

```js
gameCore.getModule('unlock-notifications').generateNotifications();
```

This calls `regenerateNotifications()` hooks in feature modules, which re-register current items into the registry.

### 4) UI consumption pattern

- Each tab requests its unlocks bundle on an interval, for example in `src/components/property/index.jsx`:

```js
sendData('query-new-unlocks-notifications', { suffix: 'property', scope: 'property' });
```

- The worker responds with a nested structure:

```js
{
  property: {
    items: {
      furniture: { hasNew: true, items: { furniture_id: { hasNew: true }, ... } },
      ...
    },
    hasNew: true
  }
}
```

- UI wraps each card with `NewNotificationWrap` to display a “New” badge and to mark viewed on hover:

```jsx
import {NewNotificationWrap} from '../shared/new-notification-wrap.jsx';

<NewNotificationWrap id={entity.id}
  className={'narrow-wrapper'}
  isNew={newUnlocks?.[scope]?.items?.[category]?.items?.[entity.id]?.hasNew}
>
  <Card .../>
</NewNotificationWrap>
```

### 5) Marking as viewed

- `NewNotificationWrap` sends `set-new-notification-viewed-by-id` after a short hover debounce:

```jsx
sendData('set-new-notification-viewed-by-id', { id });
```

- Worker marks the id as viewed across all registered paths and future polls will hide the badge.

### 6) Social tab specifics

- Social events register notifications on worker init in `social-events.module.js`:

```js
const eventEntities = gameEntity.listEntitiesByTags(['event-hall']);
eventEntities.forEach(evt => {
  if (evt.attributes?.isEvent) {
    gameCore.getModule('unlock-notifications').registerNewNotification(
      'social', 'events', 'all', evt.id, evt.isUnlocked && !evt.isCapped
    );
  }
});
```

- UI `event-hall.jsx` subscribes to `social-events-data` and uses `newUnlocks` from the worker response to wrap each `EventCard` with `NewNotificationWrap`.
