import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
    label: "हिंदी",
    lang: "hi-IN",
    getText: (amount, senderName) =>
      `रुपये ${amount} का भुगतान प्राप्त हुआ, ${senderName} से`,
  },
  {
    id: "bn",
    label: "বাংলা",
    lang: "bn-IN",
    getText: (amount, senderName) =>
      `${senderName} থেকে ${amount} টাকা পেমেন্ট পাওয়া গেছে`,
  },
  {
    id: "mr",
    label: "मराठी",
    lang: "mr-IN",
    getText: (amount, senderName) =>
      `${senderName} कडून ${amount} रुपये प्राप्त झाले`,
  },
  {
    id: "te",
    label: "తెలుగు",
    lang: "te-IN",
    getText: (amount, senderName) =>
      `${senderName} నుండి ${amount} రూపాయలు చెల్లింపు వచ్చింది`,
  },
  {
    id: "kn",
    label: "ಕನ್ನಡ",
    lang: "kn-IN",
    getText: (amount, senderName) =>
      `${senderName} ಇಂದ ${amount} ರೂಪಾಯಿ ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ`,
  },
  {
    id: "ta",
    label: "தமிழ்",
    lang: "ta-IN",
    getText: (amount, senderName) =>
      `${senderName} இடமிருந்து ${amount} ரூபாய் கட்டணம் பெறப்பட்டது`,
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

function UPISoundBox() {
  const [isMuted, setIsMuted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
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
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted, selectedLangId],
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
        `₹${randomAmount.toLocaleString("en-IN")} received from ${randomPayer.name}`,
        {
          duration: 3000,
        },
      );
    } catch {
      toast.error("Failed to process payment. Try again.");
    }
  }, [addTransaction, triggerFlash, announce]);

  // Clear newTxId highlight after a bit
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

  return (
    <div className="min-h-screen bg-background">
      {/* Background texture */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.72_0.17_165_/_0.08),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,oklch(0.65_0.15_200_/_0.05),transparent)] pointer-events-none" />

      {/* Header */}
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
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-led-pulse inline-block" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <SummaryCard
          totalAmount={Number(summary?.totalAmount ?? 0n)}
          count={Number(summary?.transactionCount ?? 0n)}
          isLoading={summaryLoading}
        />

        {/* Sound Box Device */}
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
            onSimulate={handleSimulate}
            isSimulating={addTransaction.isPending}
            selectedLangId={selectedLangId}
            onLangChange={handleLangChange}
            languages={LANGUAGES}
          />
        </motion.section>

        {/* Transaction list */}
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

      {/* Footer */}
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
      <UPISoundBox />
    </QueryClientProvider>
  );
}
