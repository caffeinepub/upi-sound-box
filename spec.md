# UPI Sound Box

## Current State
App has phone OTP login, UPI sound box with auto payments, transaction list, summary card, language toggle, volume slider. Header has logo, live indicator, masked phone, and logout button.

## Requested Changes (Diff)

### Add
- Profile tab/screen accessible from header (user icon button)
- Profile screen shows: user phone number, member since date
- Premium subscription section on profile screen:
  - Trial plan: ₹1 for 3 days
  - Monthly plan: ₹49/month with Autopay badge
  - Plan selection cards with CTA button (simulated, no real payment)
  - Active plan indicator once selected (stored in localStorage)

### Modify
- Header: add profile icon button next to logout button that opens profile screen
- App navigation: toggle between main soundbox view and profile screen

### Remove
- Nothing

## Implementation Plan
1. Create `ProfileScreen.tsx` component with user info and premium plan cards
2. Add profile icon button to header in `App.tsx`
3. Add state to toggle between main view and profile view
4. Store selected plan in localStorage (`upi_premium_plan`)
5. Show active plan badge in header or profile screen
