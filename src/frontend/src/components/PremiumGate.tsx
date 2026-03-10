import { Button } from "@/components/ui/button";
import { RAZORPAY_KEY_ID } from "@/config/razorpay";
import { openRazorpayCheckout } from "@/utils/razorpayCheckout";
import {
  BarChart3,
  BellRing,
  CheckCircle2,
  Crown,
  HeadphonesIcon,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface PremiumGateProps {
  onPlanSelected: (plan: string) => void;
}

const FEATURES = [
  { id: "ad-free", icon: ShieldCheck, label: "Ad-free experience" },
  { id: "alerts", icon: BellRing, label: "Priority sound alerts" },
  { id: "analytics", icon: BarChart3, label: "Earnings analytics" },
  { id: "support", icon: HeadphonesIcon, label: "24/7 Support" },
];

export function PremiumGate({ onPlanSelected }: PremiumGateProps) {
  const [activating, setActivating] = useState<string | null>(null);

  const handleActivate = async (plan: "trial" | "monthly") => {
    setActivating(plan);

    const amount = plan === "trial" ? 100 : 4900;
    const description =
      plan === "trial"
        ? "3 din Trial - UPI SoundBox"
        : "Monthly Plan - UPI SoundBox";

    openRazorpayCheckout(RAZORPAY_KEY_ID, {
      amount,
      name: "UPI SoundBox Premium",
      description,
      theme: { color: "#d97706" },
      onSuccess: () => {
        localStorage.setItem("upi_premium_plan", plan);
        if (plan === "trial") {
          localStorage.setItem("upi_trial_start", String(Date.now()));
        }
        toast.success("Payment successful! Plan activated.");
        onPlanSelected(plan);
      },
      onFailure: () => {
        setActivating(null);
        toast.error("Payment cancelled or failed. Please try again.");
      },
    });
  };

  return (
    <div
      data-ocid="premium_gate.section"
      className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4 py-10"
    >
      {/* Background gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,oklch(0.72_0.17_165_/_0.12),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_90%,oklch(0.68_0.2_45_/_0.07),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_40%_40%_at_10%_80%,oklch(0.65_0.15_200_/_0.05),transparent)] pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.2 45), oklch(0.65 0.18 55))",
              boxShadow: "0 8px 32px oklch(0.72 0.2 45 / 0.35)",
            }}
          >
            <Crown className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Premium Activate Karein
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              App use karne ke liye ek plan choose karein
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.72 0.2 45)" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.72 0.2 45)" }}
            >
              Unlimited access with any plan
            </span>
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.72 0.2 45)" }}
            />
          </div>
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          {/* Trial Card */}
          <motion.div
            data-ocid="premium_gate.card"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            className="relative rounded-2xl p-[1.5px] overflow-hidden cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.18 60), oklch(0.68 0.2 45), oklch(0.72 0.17 30))",
            }}
          >
            <div className="relative rounded-[14px] bg-card px-4 py-4">
              <div className="absolute -top-2 left-4">
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: "oklch(0.72 0.2 45)", color: "white" }}
                >
                  🔥 Most Popular
                </span>
              </div>

              <div className="flex items-start justify-between mt-2">
                <div>
                  <p className="font-display font-bold text-foreground text-base">
                    3 दिन का Trial
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Try करें, risk-free
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-display font-bold text-2xl"
                    style={{ color: "oklch(0.75 0.18 60)" }}
                  >
                    ₹1
                  </p>
                  <p className="text-xs text-muted-foreground">3 days only</p>
                </div>
              </div>

              {/* Autopay Notice */}
              <div
                className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-xl text-xs"
                style={{
                  background: "oklch(0.72 0.2 45 / 0.08)",
                  color: "oklch(0.55 0.15 45)",
                  border: "1px solid oklch(0.72 0.2 45 / 0.2)",
                }}
              >
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  3 din baad <strong>₹49/month Autopay</strong> apne aap shuru
                  ho jayega. Kabhi bhi cancel kar sakte hain.
                </span>
              </div>

              <Button
                data-ocid="premium_gate.trial_button"
                onClick={() => handleActivate("trial")}
                disabled={activating !== null}
                className="w-full mt-3 font-semibold"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.72 0.2 45), oklch(0.75 0.18 60))",
                  color: "white",
                  border: "none",
                }}
              >
                <AnimatePresence mode="wait">
                  {activating === "trial" ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" />
                      Processing...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Pay ₹1 — 3 din Trial Activate Karein
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </motion.div>

          {/* Monthly Card */}
          <motion.div
            data-ocid="premium_gate.card"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            className="relative rounded-2xl p-[1.5px] overflow-hidden cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.17 165), oklch(0.55 0.15 180), oklch(0.62 0.14 200))",
            }}
          >
            <div className="relative rounded-[14px] bg-card px-4 py-4">
              <div className="absolute -top-2 left-4">
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.62 0.17 165)",
                    color: "white",
                  }}
                >
                  ⚡ Autopay
                </span>
              </div>

              <div className="flex items-start justify-between mt-2">
                <div>
                  <p className="font-display font-bold text-foreground text-base">
                    Monthly Plan
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Auto-renews every month
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-display font-bold text-2xl"
                    style={{ color: "oklch(0.65 0.17 165)" }}
                  >
                    ₹49
                  </p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>

              <Button
                data-ocid="premium_gate.monthly_button"
                onClick={() => handleActivate("monthly")}
                disabled={activating !== null}
                className="w-full mt-3 font-semibold"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.62 0.17 165), oklch(0.55 0.15 180))",
                  color: "white",
                  border: "none",
                }}
              >
                <AnimatePresence mode="wait">
                  {activating === "monthly" ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" />
                      Processing...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Pay ₹49 — Monthly Autopay Activate Karein
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl px-5 py-4"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Premium Benefits
          </h3>
          <div className="space-y-3">
            {FEATURES.map(({ id, icon: Icon, label }) => (
              <div key={id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.72 0.17 165 / 0.1)",
                    color: "oklch(0.72 0.17 165)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-foreground">{label}</span>
                <CheckCircle2
                  className="w-3.5 h-3.5 ml-auto flex-shrink-0"
                  style={{ color: "oklch(0.65 0.17 165)" }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground/60">
          Secure payment via Razorpay 🔒
        </p>
      </div>
    </div>
  );
}
