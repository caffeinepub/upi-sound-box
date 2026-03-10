import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  BellRing,
  CheckCircle2,
  Crown,
  HeadphonesIcon,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileScreenProps {
  phone: string;
  onBack: () => void;
}

type Plan = "trial" | "monthly" | null;

const FEATURES = [
  { id: "ad-free", icon: ShieldCheck, label: "Ad-free experience" },
  { id: "alerts", icon: BellRing, label: "Priority sound alerts" },
  { id: "analytics", icon: BarChart3, label: "Earnings analytics" },
  { id: "support", icon: HeadphonesIcon, label: "24/7 Support" },
];

export function ProfileScreen({ phone, onBack }: ProfileScreenProps) {
  const [activePlan, setActivePlan] = useState<Plan>(
    () => (localStorage.getItem("upi_premium_plan") as Plan) ?? null,
  );

  const memberSince = (() => {
    let d = localStorage.getItem("upi_member_since");
    if (!d) {
      d = new Date().toISOString().split("T")[0];
      localStorage.setItem("upi_member_since", d);
    }
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  const maskedPhone = `******${phone.slice(-4)}`;
  const initials = phone.slice(-2).toUpperCase();

  const handleActivate = (plan: "trial" | "monthly") => {
    localStorage.setItem("upi_premium_plan", plan);
    setActivePlan(plan);
    toast.success(
      plan === "trial"
        ? "3 \u0926\u093f\u0928 \u0915\u093e Free Trial activate \u0939\u094b \u0917\u092f\u093e! \ud83c\udf89"
        : "Monthly Plan Autopay activate \u0939\u094b \u0917\u092f\u093e! \u26a1",
    );
  };

  const handleCancel = () => {
    localStorage.removeItem("upi_premium_plan");
    setActivePlan(null);
    toast.success("Plan cancel \u0939\u094b \u0917\u092f\u093e");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.72_0.17_165_/_0.07),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_90%,oklch(0.75_0.18_60_/_0.04),transparent)] pointer-events-none" />

      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            data-ocid="profile.close_button"
            onClick={onBack}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-foreground">
            Profile &amp; Premium
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Avatar & Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 bg-card border border-border rounded-2xl px-5 py-4"
        >
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-display"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.17 165), oklch(0.65 0.15 200))",
                color: "oklch(0.1 0.01 165)",
              }}
            >
              {initials}
            </div>
            {activePlan && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground font-mono text-sm">
              +91 {maskedPhone}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Member since {memberSince}
            </p>
            {activePlan && (
              <span
                className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.72 0.17 165 / 0.15)",
                  color: "oklch(0.72 0.17 165)",
                }}
              >
                <Crown className="w-2.5 h-2.5" />
                {activePlan === "trial" ? "Trial Active" : "Premium Member"}
              </span>
            )}
          </div>
        </motion.div>

        {/* Premium Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Premium Plans
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {/* Trial Card */}
            <motion.div
              data-ocid="profile.card"
              whileHover={{ scale: 1.01 }}
              className="relative rounded-2xl p-[1.5px] overflow-hidden"
              style={{
                background:
                  activePlan === "trial"
                    ? "linear-gradient(135deg, oklch(0.75 0.18 60), oklch(0.68 0.2 45), oklch(0.72 0.17 30))"
                    : "linear-gradient(135deg, oklch(0.75 0.18 60 / 0.6), oklch(0.68 0.2 45 / 0.4))",
              }}
            >
              <div className="relative rounded-[14px] bg-card px-4 py-4">
                <div className="absolute -top-2 left-4">
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: "oklch(0.72 0.2 45)", color: "white" }}
                  >
                    \ud83d\udd25 Most Popular
                  </span>
                </div>

                <div className="flex items-start justify-between mt-2">
                  <div>
                    <p className="font-display font-bold text-foreground text-base">
                      3 \u0926\u093f\u0928 \u0915\u093e Trial
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try \u0915\u0930\u0947\u0902, risk-free
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-display font-bold text-2xl"
                      style={{ color: "oklch(0.75 0.18 60)" }}
                    >
                      \u20b91
                    </p>
                    <p className="text-xs text-muted-foreground">3 days only</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {activePlan === "trial" ? (
                    <motion.div
                      key="trial-active"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: "oklch(0.72 0.2 45 / 0.12)",
                        color: "oklch(0.75 0.18 60)",
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Current Plan \u00b7 Active \u2713
                    </motion.div>
                  ) : (
                    <motion.div
                      key="trial-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        data-ocid="profile.primary_button"
                        onClick={() => handleActivate("trial")}
                        disabled={activePlan === "monthly"}
                        className="w-full mt-3 font-semibold"
                        style={{
                          background:
                            "linear-gradient(90deg, oklch(0.72 0.2 45), oklch(0.75 0.18 60))",
                          color: "white",
                          border: "none",
                        }}
                      >
                        Activate \u2014 \u20b91 \u092e\u0947\u0902
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Monthly Card */}
            <motion.div
              data-ocid="profile.card"
              whileHover={{ scale: 1.01 }}
              className="relative rounded-2xl p-[1.5px] overflow-hidden"
              style={{
                background:
                  activePlan === "monthly"
                    ? "linear-gradient(135deg, oklch(0.65 0.17 165), oklch(0.55 0.15 180), oklch(0.62 0.14 200))"
                    : "linear-gradient(135deg, oklch(0.65 0.17 165 / 0.5), oklch(0.55 0.15 180 / 0.4))",
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
                    \u26a1 Autopay
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
                      \u20b949
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {activePlan === "monthly" ? (
                    <motion.div
                      key="monthly-active"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: "oklch(0.65 0.17 165 / 0.12)",
                        color: "oklch(0.65 0.17 165)",
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Current Plan \u00b7 Active \u2713
                    </motion.div>
                  ) : (
                    <motion.div
                      key="monthly-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        data-ocid="profile.secondary_button"
                        onClick={() => handleActivate("monthly")}
                        disabled={activePlan === "trial"}
                        className="w-full mt-3 font-semibold"
                        style={{
                          background:
                            "linear-gradient(90deg, oklch(0.62 0.17 165), oklch(0.55 0.15 180))",
                          color: "white",
                          border: "none",
                        }}
                      >
                        Activate Autopay \u2014 \u20b949/mo
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {activePlan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <Button
                  data-ocid="profile.delete_button"
                  variant="ghost"
                  onClick={handleCancel}
                  className="w-full text-xs text-muted-foreground hover:text-destructive"
                >
                  Cancel Plan
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
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
      </main>
    </div>
  );
}
