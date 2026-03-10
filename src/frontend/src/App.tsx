import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Bell, Home, LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuthGate } from "./components/AuthGate";
import type { NotificationEntry } from "./components/NotificationPanel";
import { NotificationsView } from "./components/NotificationsView";
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

const MAX_NOTIFICATIONS = 50;

function loadNotifications(): NotificationEntry[] {
  try {
    const raw = localStorage.getItem("upi_notifications");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifs: NotificationEntry[]) {
  localStorage.setItem(
    "upi_notifications",
    JSON.stringify(notifs.slice(-MAX_NOTIFICATIONS)),
  );
}

const queryClient = new QueryClient();

type ActiveTab = "home" | "notifications" | "profile";

function UPISoundBox({
  phone,
  onLogout,
  onPlanCancelled,
}: { phone: string; onLogout: () => void; onPlanCancelled: () => void }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [volume, setVolume] = useState(1);
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [lastPayment, setLastPayment] = useState<{
    amount: number;
    sender: string;
    upiId: string;
  } | null>(null);
  const [newTxId, setNewTxId] = useState<bigint | null>(null);
  const [selectedLangId, setSelectedLangId] = useState<string>(
    () => localStorage.getItem("upi_lang") ?? "en",
  );
  const [notifications, setNotifications] = useState<NotificationEntry[]>(() =>
    loadNotifications(),
  );
  const [batteryOptimized, setBatteryOptimized] = useState<boolean>(
    () => localStorage.getItem("upi_battery_save") === "true",
  );

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: transactions = [], isLoading: txLoading } =
    useGetAllTransactions();
  const { data: summary, isLoading: summaryLoading } = useGetTodaysSummary();
  const addTransaction = useAddTransaction();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLangChange = useCallback((id: string) => {
    setSelectedLangId(id);
    localStorage.setItem("upi_lang", id);
  }, []);

  const _handleToggleBatterySave = useCallback((val: boolean) => {
    setBatteryOptimized(val);
    localStorage.setItem("upi_battery_save", String(val));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
    toast.success("All notifications cleared");
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
        `₹${randomAmount.toLocaleString("en-IN")} received from ${randomPayer.name}`,
        { duration: 3000 },
      );

      // Push notification
      setNotifications((prev) => {
        const newNotif: NotificationEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          amount: randomAmount,
          sender: randomPayer.name,
          upiId: randomPayer.upiId,
          timestamp: Date.now(),
          read: false,
        };
        const updated = [...prev, newNotif].slice(-MAX_NOTIFICATIONS);
        saveNotifications(updated);
        return updated;
      });
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
      const minDelay = batteryOptimized ? 60000 : 15000;
      const maxDelay = batteryOptimized ? 120000 : 40000;
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      autoTimerRef.current = setTimeout(async () => {
        await handleSimulate();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [handleSimulate, batteryOptimized]);

  const maskedPhone = `******${phone.slice(-4)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-led-pulse inline-block" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <div className="pl-3 border-l border-border">
              <span className="text-xs text-muted-foreground font-mono">
                +91 {maskedPhone}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto px-4 py-6 space-y-6 overflow-y-auto h-full pb-24"
            >
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

              <footer className="pt-4 text-center">
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
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto h-full flex flex-col pb-20"
            >
              <NotificationsView
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                onClearAll={handleClearAll}
              />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              className="overflow-y-auto pb-20"
            >
              {/* Logout button row */}
              <div className="max-w-md mx-auto px-4 pt-3 flex justify-end">
                <button
                  type="button"
                  data-ocid="profile.delete_button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1.5 rounded-md hover:bg-destructive/10"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
              <ProfileScreen
                phone={phone}
                onBack={() => setActiveTab("home")}
                onPlanCancelled={() => {
                  setActiveTab("home");
                  onPlanCancelled();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="max-w-md mx-auto flex items-stretch">
          <button
            type="button"
            data-ocid="home_tab.tab"
            onClick={() => setActiveTab("home")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors ${
              activeTab === "home"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home
              className={`w-5 h-5 transition-transform ${
                activeTab === "home" ? "scale-110" : ""
              }`}
            />
            Home
          </button>

          <button
            type="button"
            data-ocid="notifications_tab.tab"
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors relative ${
              activeTab === "notifications"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="relative">
              <Bell
                className={`w-5 h-5 transition-transform ${
                  activeTab === "notifications" ? "scale-110" : ""
                }`}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 bg-destructive text-[9px] font-bold text-white rounded-full flex items-center justify-center px-0.5 leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            Notifications
          </button>

          <button
            type="button"
            data-ocid="profile_tab.tab"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors ${
              activeTab === "profile"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User
              className={`w-5 h-5 transition-transform ${
                activeTab === "profile" ? "scale-110" : ""
              }`}
            />
            Profile
          </button>
        </div>
      </nav>

      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        {(phone, onLogout, onPlanCancelled) => (
          <UPISoundBox
            phone={phone}
            onLogout={onLogout}
            onPlanCancelled={onPlanCancelled}
          />
        )}
      </AuthGate>
    </QueryClientProvider>
  );
}
