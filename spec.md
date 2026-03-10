# UPI Sound Box

## Current State
App has a UPI sound box simulator with payment announcements using Web Speech API in English (en-IN) only. The announce function produces: "Payment received of rupees {amount} from {senderName}".

## Requested Changes (Diff)

### Add
- Language selector with 7 options: Hindi, English, Bengali, Marathi, Telugu, Kannada, Tamil
- Language-specific announcement text and speech synthesis lang codes
- Persist selected language in localStorage

### Modify
- `announce()` function in App.tsx to use selected language's text and lang code
- SoundBoxDevice or header to show a language picker (flag/label chips or a dropdown)

### Remove
- Nothing

## Implementation Plan
1. Add a LANGUAGES config with: label, lang code (BCP-47), and announcement template function
   - English: en-IN, "Payment received of rupees {amount} from {senderName}"
   - Hindi: hi-IN, "रुपये {amount} का भुगतान प्राप्त हुआ, {senderName} से"
   - Bengali: bn-IN, "{senderName} থেকে {amount} টাকা পেমেন্ট পাওয়া গেছে"
   - Marathi: mr-IN, "{senderName} कडून {amount} रुपये प्राप्त झाले"
   - Telugu: te-IN, "{senderName} నుండి {amount} రూపాయలు చెల్లింపు వచ్చింది"
   - Kannada: kn-IN, "{senderName} ಇಂದ {amount} ರೂಪಾಯಿ ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ"
   - Tamil: ta-IN, "{senderName} இடமிருந்து {amount} ரூபாய் கட்டணம் பெறப்பட்டது"
2. Add `selectedLang` state in App.tsx, initialized from localStorage
3. Pass `selectedLang` and `onLangChange` to SoundBoxDevice (or add a language selector in the header)
4. Render language selector as compact chips/pills in the header or above the device
5. Update `announce()` to use the selected language config
