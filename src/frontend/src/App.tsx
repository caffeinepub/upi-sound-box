import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LogOut, UserCircle } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuthGate } from "./components/AuthGate";
import { ProfileScreen } from "./components/ProfileScreen";
import { SoundBoxDevice } from "./components/SoundBoxDevice";
import { SummaryCard } from "./components/SummaryCard";
import { TransactionList } from "./components/TransactionList";
import {
  useAddTransaction,
  useGetAllTransactions,
  useGetTodaysSummary,
} from "./hooks/useQueries";

export interface Language {
  id: string;
  label: string;
  lang: string;
  getText: (amount: string, senderName: string) => string;
}

export const LANGUAGES: Language[] = [
  {
    id: "en",
    label: "English",
    lang: "en-IN",
    getText: (amount, senderName) =>
      `Payment received of rupees ${amount} from ${senderName}`,
  },
  {
    id: "hi",
    label: "\u0939\u093f\u0902\u0926\u0940",
    lang: "hi-IN",
    getText: (amount, senderName) =>
      `\u0930\u0941\u092a\u092f\u0947 ${amount} \u0915\u093e \u092d\u0941\u0917\u0924\u093e\u0928 \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u0939\u0941\u0906, ${senderName} \u0938\u0947`,
  },
  {
    id: "bn",
    label: "\u09ac\u09be\u0982\u09b2\u09be",
    lang: "bn-IN",
    getText: (amount, senderName) =>
      `${senderName} \u09a5\u09c7\u0995\u09c7 ${amount} \u099f\u09be\u0995\u09be \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u09aa\u09be\u0993\u09df\u09be \u0997\u09c7\u099b\u09c7`,
  },
  {
    id: "mr",
    label: "\u092e\u0930\u093e\u0920\u0940",
    lang: "mr-IN",
    getText: (amount, senderName) =>
      `${senderName} \u0915\u0921\u0942\u0928 ${amount} \u0930\u0941\u092a\u092f\u0947 \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u091d\u093e\u0932\u0947`,
  },
  {
    id: "te",
    label: "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41",
    lang: "te-IN",
    getText: (amount, senderName) =>
      `${senderName} \u0c28\u0c41\u0c02\u0c21\u0c3f ${amount} \u0c30\u0c42\u0c2a\u0c3e\u0c2f\u0c32\u0c41 \u0c1a\u0c46\u0c32\u0c4d\u0c32\u0c3f\u0c02\u0c2a\u0c41 \u0c35\u0c1a\u0c4d\u0c1a\u0c3f\u0c02\u0c26\u0c3f`,
  },
  {
    id: "kn",
    label: "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1",
    lang: "kn-IN",
    getText: (amount, senderName) =>
      `${senderName} \u0c87\u0c82\u0ca6 ${amount} \u0cb0\u0cc2\u0caa\u0cbe\u0caf\u0cbf \u0caa\u0cbe\u0cb5\u0ca4\u0cbf \u0cb8\u0ccd\u0cb5\u0cc0\u0c95\u0cb0\u0cbf\u0cb8\u0cb2\u0cbe\u0c97\u0cbf\u0ca6\u0cc6`,
  },
  {
    id: "ta",
    label: "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd",
    lang: "ta-IN",
    getText: (amount, senderName) =>
      `${senderName} \u0b87\u0b9f\u0bae\u0bbf\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 ${amount} \u0bb0\u0bc2\u0baa\u0bbe\u0baf\u0bcd \u0b95\u0b9f\u0bcd\u0b9f\u0ba3\u0bae\u0bcd \u0baa\u0bc6\u0bb1\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1`,
  },
];

const PAYMENT_AMOUNTS = [
  50, 100, 150, 200, 250, 500, 750, 1000, 1500, 2500, 5000,
];
const PAYMENT_UPIS = [
  { upiId: "rajesh.kumar@paytm", name: "Rajesh Kumar" },
  { upiId: "priya.sharma@ybl", name: "Priya Sharma" },
  { upiId: "9876543210@ybl", name: "Amit Verma" },
  { upiId: "deepak.singh@gpay", name: "Deepak Singh" },
  { upiId: "sunita.devi@paytm", name: "Sunita Devi" },
  { upiId: "mohan.lal@okaxis", name: "Mohan Lal" },
  { upiId: "anita.joshi@upi", name: "Anita Joshi" },
  { upiId: "vikram.patel@ybl", name: "Vikram Patel" },
];

const queryClient = new QueryClient();

function UPISoundBox({
  phone,
  onLogout,
}: { phone: string; onLogout: () => void }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showProfile, setShowProfile] = useState(false);
  const [lastPayment, setLastPayment] = useState<{
    amount: number;
    sender: string;
    upiId: string;
  } | null>(null);
  const [newTxId, setNewTxId] = useState<bigint | null>(null);
  const [selectedLangId, setSelectedLangId] = useState<string>(
    () => localStorage.getItem("upi_lang") ?? "en",
  );
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: transactions = [], isLoading: txLoading } =
    useGetAllTransactions();
  const { data: summary, isLoading: summaryLoading } = useGetTodaysSummary();
  const addTransaction = useAddTransaction();

  const handleLangChange = useCallback((id: string) => {
    setSelectedLangId(id);
    localStorage.setItem("upi_lang", id);
  }, []);

  const announce = useCallback(
    (amount: number, senderName: string) => {
      if (isMuted || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const lang =
        LANGUAGES.find((l) => l.id === selectedLangId) ?? LANGUAGES[0];
      const text = lang.getText(amount.toLocaleString("en-IN"), senderName);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang.lang;
      utterance.rate = 0.9;
      utterance.volume = volume;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted, selectedLangId, volume],
  );

  const triggerFlash = useCallback(
    (amount: number, sender: string, upiId: string) => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      setLastPayment({ amount, sender, upiId });
      setIsFlashing(true);
      flashTimerRef.current = setTimeout(() => {
        setIsFlashing(false);
      }, 3000);
    },
    [],
  );

  const handleSimulate = useCallback(async () => {
    const randomAmount =
      PAYMENT_AMOUNTS[Math.floor(Math.random() * PAYMENT_AMOUNTS.length)];
    const randomPayer =
      PAYMENT_UPIS[Math.floor(Math.random() * PAYMENT_UPIS.length)];

    try {
      const id = await addTransaction.mutateAsync({
        amount: BigInt(randomAmount),
        upiId: randomPayer.upiId,
        senderName: randomPayer.name,
      });
      setNewTxId(id);
      triggerFlash(randomAmount, randomPayer.name, randomPayer.upiId);
      announce(randomAmount, randomPayer.name);
      toast.success(
        `\u20b9${randomAmount.toLocaleString("en-IN")} received from ${randomPayer.name}`,
        { duration: 3000 },
      );
    } catch {
      toast.error("Failed to process payment. Try again.");
    }
  }, [addTransaction, triggerFlash, announce]);

  useEffect(() => {
    if (newTxId === null) return;
    const t = setTimeout(() => setNewTxId(null), 4000);
    return () => clearTimeout(t);
  }, [newTxId]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = Math.random() * 25000 + 15000;
      autoTimerRef.current = setTimeout(async () => {
        await handleSimulate();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [handleSimulate]);

  const maskedPhone = `******${phone.slice(-4)}`;

  if (showProfile) {
    return <ProfileScreen phone={phone} onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.72_0.17_165_/_0.08),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,oklch(0.65_0.15_200_/_0.05),transparent)] pointer-events-none" />

      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/soundbox-logo-transparent.dim_120x120.png"
              alt="UPI Sound Box"
              className="w-7 h-7 object-contain"
            />
            <span className="font-display font-bold text-foreground">
              UPI SoundBox
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-led-pulse inline-block" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <span className="text-xs text-muted-foreground font-mono">
                +91 {maskedPhone}
              </span>
              <button
                type="button"
                data-ocid="header.profile_button"
                onClick={() => setShowProfile(true)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Profile & Premium"
              >
                <UserCircle className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                data-ocid="header.logout_button"
                onClick={onLogout}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <SummaryCard
          totalAmount={Number(summary?.totalAmount ?? 0n)}
          count={Number(summary?.transactionCount ?? 0n)}
          isLoading={summaryLoading}
        />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col items-center py-4"
        >
          <SoundBoxDevice
            isFlashing={isFlashing}
            lastPayment={lastPayment}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((m) => !m)}
            selectedLangId={selectedLangId}
            onLangChange={handleLangChange}
            languages={LANGUAGES}
            volume={volume}
            onVolumeChange={setVolume}
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <TransactionList
            transactions={transactions}
            isLoading={txLoading}
            newTxId={newTxId}
          />
        </motion.section>
      </main>

      <footer className="max-w-md mx-auto px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground/50">
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
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        {(phone, onLogout) => <UPISoundBox phone={phone} onLogout={onLogout} />}
      </AuthGate>
    </QueryClientProvider>
  );
}
