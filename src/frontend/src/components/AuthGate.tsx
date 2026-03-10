import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoginScreen } from "./LoginScreen";
import { PremiumGate } from "./PremiumGate";

interface AuthGateProps {
  children: (
    phone: string,
    onLogout: () => void,
    onPlanCancelled: () => void,
  ) => React.ReactNode;
}

function checkAndHandleTrialExpiry() {
  const plan = localStorage.getItem("upi_premium_plan");
  if (plan !== "trial") return;
  const trialStart = localStorage.getItem("upi_trial_start");
  if (!trialStart) return;
  const elapsed = Date.now() - Number(trialStart);
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  if (elapsed >= threeDaysMs) {
    localStorage.setItem("upi_premium_plan", "monthly");
    localStorage.removeItem("upi_trial_start");
    return "expired";
  }
  return null;
}

export function AuthGate({ children }: AuthGateProps) {
  const [phone, setPhone] = useState<string | null>(() =>
    localStorage.getItem("upi_auth_phone"),
  );
  const [hasPlan, setHasPlan] = useState<boolean>(() => {
    checkAndHandleTrialExpiry();
    return !!localStorage.getItem("upi_premium_plan");
  });

  useEffect(() => {
    const result = checkAndHandleTrialExpiry();
    if (result === "expired") {
      toast.info("Trial khatam hua! ₹49/month Autopay shuru ho gaya. 🔄", {
        duration: 6000,
      });
    }
    // Check every hour
    const interval = setInterval(
      () => {
        const r = checkAndHandleTrialExpiry();
        if (r === "expired") {
          toast.info("Trial khatam hua! ₹49/month Autopay shuru ho gaya. 🔄", {
            duration: 6000,
          });
        }
      },
      60 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (p: string) => {
    localStorage.setItem("upi_auth_phone", p);
    setPhone(p);
  };

  const handleLogout = () => {
    localStorage.removeItem("upi_auth_phone");
    localStorage.removeItem("upi_premium_plan");
    localStorage.removeItem("upi_trial_start");
    setPhone(null);
    setHasPlan(false);
  };

  const handlePlanSelected = (plan: string) => {
    localStorage.setItem("upi_premium_plan", plan);
    setHasPlan(true);
  };

  const handlePlanCancelled = () => {
    setHasPlan(false);
  };

  if (!phone) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!hasPlan) {
    return <PremiumGate onPlanSelected={handlePlanSelected} />;
  }

  return <>{children(phone, handleLogout, handlePlanCancelled)}</>;
}
