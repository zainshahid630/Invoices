# Subscription Header Badge - Visual Guide

## Header Placement

### Before (Without Badge)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Dashboard                                          John Doe     │
│  ABC Company - ABC Business                            admin    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### After (With Badge)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Dashboard              📋 245 days remaining      John Doe     │
│  ABC Company - ABC Business                            admin    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Badge States - Visual Examples

### 1. Healthy Subscription (>30 days)
```
┌────────────────────────┐
│ 📋 245 days remaining  │  ← Green background
└────────────────────────┘
```
**When:** More than 30 days until expiration
**Color:** Green (#f0fdf4 background, #166534 text)
**Message:** "X days remaining"

### 2. Warning - Expiring Soon (1-30 days)
```
┌────────────────────────┐
│ ⏰ Expires in 15 days  │  ← Yellow background
└────────────────────────┘
```
**When:** 1 to 30 days until expiration
**Color:** Yellow (#fefce8 background, #854d0e text)
**Message:** "Expires in X days"

### 3. Critical - Expired
```
┌────────────────────────┐
│ ⚠️ Expired 5 days ago  │  ← Red background
└────────────────────────┘
```
**When:** Past the end date
**Color:** Red (#fef2f2 background, #991b1b text)
**Message:** "Expired X days ago"

## Full Page Examples

### Example 1: Dashboard with Active Subscription
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
│ Dashboard              📋 180 days remaining      John Doe      │
│ ABC Company - ABC Business                            admin     │
└─────────────────────────────────────────────────────────────────┘
│                                                                  │
│ Welcome back, John Doe!                                         │
│ Here's what's happening with your business today.              │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ 📋 Subscription Status              ▼ Details           │   │
│ │    [Active] [Paid]                                       │   │
│ │    Valid until December 15, 2025                         │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ [Stats Cards]                                                   │
│                                                                  │
```

### Example 2: Products Page with Expiring Subscription
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
│ Products               ⏰ Expires in 20 days      John Doe      │
│ ABC Company - ABC Business                            admin     │
└─────────────────────────────────────────────────────────────────┘
│                                                                  │
│ Products                                    [+ Add Product]     │
│                                                                  │
│ [Product List Table]                                            │
│                                                                  │
```

### Example 3: Settings Page with Expired Subscription
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
│ Settings               ⚠️ Expired 10 days ago     John Doe     │
│ ABC Company - ABC Business                            admin     │
└─────────────────────────────────────────────────────────────────┘
│                                                                  │
│ Settings                                                        │
│ Manage your company settings and preferences                   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ 📋 Subscription Status              ▼ Details           │   │
│ │    [Expired] [Overdue]                                   │   │
│ │    ⚠️ Subscription expired                               │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
```

## Timeline Visualization

### Subscription Lifecycle
```
Start Date                                                End Date
    │                                                         │
    ├─────────────────────────────────────────────────────────┤
    │                                                         │
    │◄────────── 📋 Green Zone (>30 days) ──────────►│       │
    │                                                 │       │
    │                                    ⏰ Yellow Zone│       │
    │                                    (1-30 days)  │       │
    │                                                 │       │
    └─────────────────────────────────────────────────┴───────┴──►
                                                              │
                                                              │
                                                    ⚠️ Red Zone
                                                    (Expired)
```

### Day-by-Day Example (Last 35 Days)
```
Day 35: 📋 35 days remaining     (Green)
Day 30: 📋 30 days remaining     (Green)
Day 29: ⏰ Expires in 29 days    (Yellow) ← Warning starts
Day 15: ⏰ Expires in 15 days    (Yellow)
Day 7:  ⏰ Expires in 7 days     (Yellow)
Day 1:  ⏰ Expires in 1 day      (Yellow)
Day 0:  ⚠️ Expired 0 days ago    (Red)    ← Expiration
Day -1: ⚠️ Expired 1 day ago     (Red)
Day -7: ⚠️ Expired 7 days ago    (Red)
Day -30: ⚠️ Expired 30 days ago  (Red)
```

## Responsive Behavior

### Desktop (1920px)
```
┌──────────────────────────────────────────────────────────────────────────┐
│  Dashboard                    📋 245 days remaining           John Doe   │
│  ABC Company - ABC Business                                      admin   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Laptop (1366px)
```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard              📋 245 days remaining      John Doe    │
│  ABC Company - ABC Business                           admin    │
└────────────────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌──────────────────────────────────────────────────┐
│  Dashboard        📋 245 days remaining          │
│  ABC Company                          John Doe   │
└──────────────────────────────────────────────────┘
```

### Mobile (375px)
```
┌────────────────────────────────┐
│  Dashboard                     │
│  📋 245 days remaining         │
│  John Doe                      │
└────────────────────────────────┘
```

## Color Palette

### Green (Active)
```
Background: #f0fdf4  ████████
Text:       #166534  ████████
Border:     #86efac  ████████
```

### Yellow (Warning)
```
Background: #fefce8  ████████
Text:       #854d0e  ████████
Border:     #fde047  ████████
```

### Red (Expired)
```
Background: #fef2f2  ████████
Text:       #991b1b  ████████
Border:     #fca5a5  ████████
```

## Icon Reference

| State | Icon | Meaning |
|-------|------|---------|
| Active (>30 days) | 📋 | Subscription document |
| Warning (1-30 days) | ⏰ | Time running out |
| Expired | ⚠️ | Alert/Warning |

## User Journey

### New User (Day 1)
```
Login → See: 📋 365 days remaining → Feel secure → Continue working
```

### Mid-term User (Day 180)
```
Login → See: 📋 185 days remaining → No concern → Continue working
```

### Approaching Expiry (Day 350)
```
Login → See: ⏰ Expires in 15 days → Notice yellow → Check dashboard → Contact admin
```

### Expired User (Day 370)
```
Login → See: ⚠️ Expired 5 days ago → See red alert → Still can work → Contact admin urgently
```

## Comparison with Dashboard Card

### Header Badge
```
┌────────────────────────┐
│ ⏰ Expires in 15 days  │  ← Compact, always visible
└────────────────────────┘
```

### Dashboard Card
```
┌──────────────────────────────────────────────────────────┐
│ 📋 Subscription Status                      ▼ Details    │
│    [Active] [Pending]                                    │
│    ⏰ Expires in 15 days                                 │
│                                                           │
│ ─────────────────────────────────────────────────────── │
│                                                           │
│ Start Date          End Date           Amount            │
│ Jan 15, 2025        Dec 15, 2025       PKR 12,000       │
└──────────────────────────────────────────────────────────┘
```

**Together they provide:**
- Badge: Quick status on every page
- Card: Detailed info on dashboard

## Edge Cases

### Case 1: Subscription Ends Today
```
⏰ Expires in 0 days
```

### Case 2: Subscription Ended Yesterday
```
⚠️ Expired 1 day ago
```

### Case 3: Very Long Subscription (5 years)
```
📋 1825 days remaining
```

### Case 4: Very Old Expiration (1 year ago)
```
⚠️ Expired 365 days ago
```

### Case 5: No Subscription
```
(Badge doesn't appear)
```

## Testing Checklist

- [ ] Badge appears on all seller pages
- [ ] Green color for >30 days
- [ ] Yellow color for 1-30 days
- [ ] Red color for expired
- [ ] Correct day count calculation
- [ ] Singular "day" vs plural "days"
- [ ] No badge when no subscription
- [ ] Responsive on mobile
- [ ] Readable text size
- [ ] Proper icon display
- [ ] No console errors
- [ ] Fast load time (<100ms)

## Summary

The subscription header badge provides a persistent, at-a-glance view of subscription status across all seller pages. With clear color coding and precise day counts, users always know their subscription status without needing to navigate to a specific page.

**Key Benefits:**
- ✅ Always visible
- ✅ Clear messaging
- ✅ Color-coded urgency
- ✅ Exact day counts
- ✅ Non-blocking
- ✅ Responsive design
