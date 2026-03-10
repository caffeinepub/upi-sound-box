# UPI Sound Box

## Current State
App has a NotificationPanel (bell icon in header) as a slide-out sheet showing payment notifications with read/unread state, mark all read, and battery save toggle. Notifications are stored in localStorage.

## Requested Changes (Diff)

### Add
- Dedicated "Notifications" tab in the main app navigation
- Full-page NotificationsView component with:
  - Filter tabs: All / Unread / Read
  - Clear all notifications button
  - Per-notification read/unread toggle with tap-to-mark-read
  - Empty states per filter
- Notification access count badge on the tab itself when unread notifications exist

### Modify
- App.tsx: add Notifications tab alongside existing content, wire notification state to NotificationsView
- NotificationPanel header bell: keep as quick-access overlay, badge stays

### Remove
- Nothing removed

## Implementation Plan
1. Create `NotificationsView.tsx` with filter tabs (All/Unread/Read), notification list, clear all, mark all read
2. Update `App.tsx` to add a bottom tab bar or top tabs with Notifications as a dedicated tab
3. Wire existing notification state and handlers to new view
