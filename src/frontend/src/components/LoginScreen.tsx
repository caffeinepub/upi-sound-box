import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, MessageSquare, Phone, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface LoginScreenProps {
  onLogin: (phone: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleSendOtp = () => {
    setPhoneError("");
    if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setStep("otp");
    setOtp("");
    setError("");
  };

  const handleVerify = () => {
    if (otp !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }
    localStorage.setItem("upi_auth_phone", phone);
    onLogin(phone);
  };

  const handleChangeNumber = () => {
    setStep("phone");
    setOtp("");
    setError("");
    setGeneratedOtp("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.72_0.17_165_/_0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,oklch(0.65_0.15_200_/_0.06),transparent)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <img
              src="/assets/generated/soundbox-logo-transparent.dim_120x120.png"
              alt="UPI SoundBox"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            UPI SoundBox
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Secure login with your mobile number
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Enter Mobile Number
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      We'll send an OTP to verify
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-1">
                  <div className="flex items-center px-3 bg-muted border border-border rounded-lg text-sm font-medium text-foreground shrink-0">
                    +91
                  </div>
                  <Input
                    data-ocid="login.phone_input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    className="flex-1"
                  />
                </div>
                {phoneError && (
                  <p
                    data-ocid="login.error_state"
                    className="text-xs text-destructive mt-1.5 mb-3"
                  >
                    {phoneError}
                  </p>
                )}

                <Button
                  data-ocid="login.send_otp_button"
                  className="w-full mt-4"
                  onClick={handleSendOtp}
                  disabled={phone.length !== 10}
                >
                  Send OTP
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Verify OTP
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Sent to +91 {phone}
                    </p>
                  </div>
                </div>

                {/* OTP Display Box */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-5 flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Your OTP is:
                    </p>
                    <p className="text-2xl font-bold text-primary font-display tracking-widest">
                      {generatedOtp}
                    </p>
                  </div>
                </div>

                <div
                  data-ocid="login.otp_input"
                  className="flex justify-center mb-4"
                >
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      setError("");
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-10 h-12 text-base" />
                      <InputOTPSlot index={1} className="w-10 h-12 text-base" />
                      <InputOTPSlot index={2} className="w-10 h-12 text-base" />
                      <InputOTPSlot index={3} className="w-10 h-12 text-base" />
                      <InputOTPSlot index={4} className="w-10 h-12 text-base" />
                      <InputOTPSlot index={5} className="w-10 h-12 text-base" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p
                    data-ocid="login.error_state"
                    className="text-xs text-destructive text-center mb-3"
                  >
                    {error}
                  </p>
                )}

                <Button
                  data-ocid="login.verify_button"
                  className="w-full"
                  onClick={handleVerify}
                  disabled={otp.length !== 6}
                >
                  Verify OTP
                </Button>

                <button
                  type="button"
                  data-ocid="login.change_number_button"
                  onClick={handleChangeNumber}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Change Number
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-muted-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
