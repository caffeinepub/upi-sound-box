# UPI Sound Box

## Current State
A UPI Sound Box simulator with:
- Simulate Payment button that triggers random payment amounts and senders
- Audio announcement via Web Speech API
- Flashing LED/device animation on payment
- Transaction list and today's summary
- Hardcoded merchant name "Ravi Kirana Store" in SoundBoxDevice
- No QR code display
- No multi-app support (transactions just show UPI IDs)

## Requested Changes (Diff)

### Add
- Merchant settings panel (accessible via a settings icon in header): editable merchant name and UPI ID
- QR code display tab/section on the device showing a scannable UPI payment QR (generated from upi:// URI using `qrcode` npm package)
- Payment app badges on transactions: detect app from UPI suffix (@gpay = Google Pay, @ybl/@ibl = PhonePe, @paytm = Paytm, @okaxis/@okicici = others) and show colored badge/icon
- App filter chips on transaction list (All, PhonePe, Google Pay, Paytm, Others)
- Merchant name persisted in localStorage

### Modify
- SoundBoxDevice: replace hardcoded "Ravi Kirana Store" with dynamic merchant name prop
- SoundBoxDevice: add a toggle between "Payment" view and "QR Code" view
- TransactionList: show payment app badge per transaction
- App.tsx: manage merchant settings state, pass to components

### Remove
- Nothing removed

## Implementation Plan
1. Install `qrcode` npm package (or use `qrcode.react`)
2. Add MerchantSettings component: dialog with name + UPI ID inputs, save to localStorage
3. Update App.tsx to load/save merchant settings from localStorage
4. Update SoundBoxDevice to accept merchantName prop and show it dynamically
5. Add QR code view toggle in SoundBoxDevice using qrcode.react
6. Add getPaymentApp() utility that maps UPI suffix to app name + color
7. Update TransactionList to show app badges
8. Add filter chips to transaction list section in App.tsx
