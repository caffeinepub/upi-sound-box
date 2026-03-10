import type { Language } from "@/App";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Battery, Play, Volume2, VolumeX, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface PaymentFlash {
  amount: number;
  sender: string;
  upiId: string;
}

interface SoundBoxDeviceProps {
  isFlashing: boolean;
  lastPayment: PaymentFlash | null;
  isMuted: boolean;
  onToggleMute: () => void;
  selectedLangId: string;
  onLangChange: (id: string) => void;
  languages: Language[];
  volume: number;
  onVolumeChange: (v: number) => void;
}

const SPEAKER_DOTS = Array.from({ length: 48 }, (_, i) => `dot-${i}`);

function previewLanguage(lang: Language, volume: number) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const text = lang.getText("500", "Demo");
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang.lang;
  utterance.rate = 0.9;
  utterance.volume = volume;
  window.speechSynthesis.speak(utterance);
}

export function SoundBoxDevice({
  isFlashing,
  lastPayment,
  isMuted,
  onToggleMute,
  selectedLangId,
  onLangChange,
  languages,
  volume,
  onVolumeChange,
}: SoundBoxDeviceProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Device body */}
      <motion.div
        data-ocid="soundbox.device_card"
        className={`device-surface relative w-64 rounded-3xl border border-white/8 shadow-device overflow-hidden ${
          isFlashing ? "animate-payment-flash" : ""
        }`}
        animate={isFlashing ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top bar — branding */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <p className="font-display text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              UPI Sound Box
            </p>
            <p className="font-display text-sm font-semibold text-foreground/90 mt-0.5">
              Ravi Kirana Store
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={12} className="text-muted-foreground" />
            <Battery size={14} className="text-primary" />
          </div>
        </div>

        {/* LED + Status row */}
        <div className="px-5 pb-3 flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full bg-primary animate-led-pulse inline-block"
            title="Active"
          />
          <span className="text-[11px] text-muted-foreground">
            Ready to receive
          </span>
        </div>

        {/* Payment display area */}
        <div className="mx-4 mb-4 rounded-2xl bg-background/60 border border-white/5 min-h-[100px] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle scanline */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,oklch(1_0_0_/_0.015)_2px,oklch(1_0_0_/_0.015)_4px)] pointer-events-none" />

          <AnimatePresence mode="wait">
            {isFlashing && lastPayment ? (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center px-4 py-3"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  Payment Received
                </p>
                <p className="font-display text-3xl font-black text-primary amount-glow">
                  ₹{lastPayment.amount.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-foreground/70 mt-1 truncate max-w-[170px]">
                  {lastPayment.sender}
                </p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[170px]">
                  {lastPayment.upiId}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center px-4 py-3"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">₹</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Waiting for payment…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Speaker grille */}
        <div className="px-5 pb-4">
          <div className="speaker-grid">
            {SPEAKER_DOTS.map((dotId) => (
              <div
                key={dotId}
                className="speaker-dot"
                style={{
                  opacity: isFlashing ? Math.random() * 0.4 + 0.6 : 1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom brand strip */}
        <div className="bg-primary/10 border-t border-primary/20 px-5 py-2 flex items-center justify-between">
          <span className="font-display text-[10px] tracking-widest text-primary/80 uppercase font-semibold">
            BharatPay
          </span>
          <span className="text-[9px] text-muted-foreground">v2.1</span>
        </div>

        {/* Flash overlay */}
        <AnimatePresence>
          {isFlashing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-primary pointer-events-none rounded-3xl"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Language selector pills */}
      <div className="w-full max-w-xs">
        <p className="text-[10px] text-muted-foreground text-center mb-2 tracking-wider uppercase">
          Announcement Language
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
          {languages.map((lang, index) => (
            <div
              key={lang.id}
              className="flex-shrink-0 snap-start flex items-center gap-0.5"
            >
              <button
                type="button"
                data-ocid={`soundbox.lang_tab.${index + 1}`}
                onClick={() => onLangChange(lang.id)}
                className={`px-3 py-1.5 rounded-l-full text-xs font-medium transition-all duration-200 border-y border-l ${
                  selectedLangId === lang.id
                    ? "bg-primary text-primary-foreground border-primary shadow-glow"
                    : "bg-card/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {lang.label}
              </button>
              <button
                type="button"
                data-ocid={`soundbox.lang_preview_button.${index + 1}`}
                onClick={() => previewLanguage(lang, isMuted ? 0 : volume)}
                title={`Preview ${lang.label}`}
                className={`px-2 py-1.5 rounded-r-full text-xs transition-all duration-200 border-y border-r ${
                  selectedLangId === lang.id
                    ? "bg-primary/80 text-primary-foreground border-primary hover:bg-primary"
                    : "bg-card/60 text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-card"
                }`}
              >
                <Play size={10} className="fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Controls — mute + volume */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        {/* Mute button */}
        <Button
          data-ocid="soundbox.mute_toggle"
          variant="outline"
          size="icon"
          onClick={onToggleMute}
          className="rounded-full w-11 h-11 border-border bg-card hover:bg-muted hover:border-primary/50 transition-all"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX size={16} className="text-muted-foreground" />
          ) : (
            <Volume2 size={16} className="text-primary" />
          )}
        </Button>

        {/* Volume slider */}
        <div
          className={`w-full flex items-center gap-3 px-1 transition-opacity duration-200 ${isMuted ? "opacity-40 pointer-events-none" : "opacity-100"}`}
        >
          <Volume2 size={12} className="text-muted-foreground flex-shrink-0" />
          <Slider
            data-ocid="soundbox.volume_slider"
            min={0}
            max={100}
            step={1}
            value={[Math.round(volume * 100)]}
            onValueChange={([val]) => onVolumeChange(val / 100)}
            disabled={isMuted}
            className="flex-1"
          />
          <span className="text-[11px] text-muted-foreground w-8 text-right flex-shrink-0">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
