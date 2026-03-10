import { CheckCircle2, Clock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Transaction } from "../backend.d";

type FilterChip = "All" | "PhonePe" | "Google Pay" | "Paytm" | "Axis Bank";

const FILTER_CHIPS: FilterChip[] = [
  "All",
  "PhonePe",
  "Google Pay",
  "Paytm",
  "Axis Bank",
];

function matchesFilter(tx: Transaction, filter: FilterChip): boolean {
  if (filter === "All") return true;
  const id = tx.upiId.toLowerCase();
  if (filter === "PhonePe") return id.includes("ybl") || id.includes("phonepe");
  if (filter === "Google Pay")
    return id.includes("gpay") || id.includes("okicici");
  if (filter === "Paytm") return id.includes("paytm");
  if (filter === "Axis Bank") return id.includes("okaxis");
  return true;
}

function timeAgo(timestamp: bigint): string {
  const now = Date.now();
  const txTime = Number(timestamp / 1_000_000n);
  const diffMs = now - txTime;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  return new Date(txTime).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function upiColor(upiId: string): string {
  if (upiId.includes("paytm")) return "text-blue-400";
  if (upiId.includes("ybl") || upiId.includes("phonepe"))
    return "text-purple-400";
  if (upiId.includes("gpay")) return "text-green-400";
  if (upiId.includes("okaxis")) return "text-amber-400";
  return "text-primary";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-emerald-500/20 text-emerald-400",
  "bg-blue-500/20 text-blue-400",
  "bg-purple-500/20 text-purple-400",
  "bg-orange-500/20 text-orange-400",
  "bg-pink-500/20 text-pink-400",
];

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  newTxId?: bigint | null;
}

export function TransactionList({
  transactions,
  isLoading,
  newTxId,
}: TransactionListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All");

  const filtered = transactions.filter((tx) => matchesFilter(tx, activeFilter));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-semibold text-foreground/80">
          Recent Transactions
        </h2>
        {transactions.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {filtered.length}/{transactions.length}
          </span>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide snap-x">
        {FILTER_CHIPS.map((chip, idx) => (
          <button
            key={chip}
            type="button"
            data-ocid={`transactions.filter_tab.${idx + 1}`}
            onClick={() => setActiveFilter(chip)}
            className={`flex-shrink-0 snap-start px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
              activeFilter === chip
                ? "bg-primary text-primary-foreground border-primary shadow-glow"
                : "bg-card/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      <div data-ocid="transactions.list" className="space-y-2">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-card rounded-xl animate-pulse"
                data-ocid="transactions.loading_state"
              />
            ))}
          </>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="transactions.empty_state"
            className="bg-card border border-border rounded-2xl py-12 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-3">
              <Clock size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {activeFilter === "All"
                ? "No transactions yet"
                : `No ${activeFilter} transactions`}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {activeFilter === "All"
                ? "Payments will appear here"
                : "Try a different filter"}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((tx, idx) => (
              <motion.div
                key={tx.id.toString()}
                data-ocid={`transactions.item.${idx + 1}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: idx < 5 ? idx * 0.04 : 0 }}
                className={`bg-card border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${
                  newTxId === tx.id
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-display ${
                    AVATAR_COLORS[Number(tx.id) % AVATAR_COLORS.length]
                  }`}
                >
                  {getInitials(tx.senderName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {tx.senderName}
                    </p>
                    <CheckCircle2
                      size={12}
                      className="text-primary flex-shrink-0"
                    />
                  </div>
                  <p
                    className={`text-[11px] truncate font-mono ${upiColor(tx.upiId)}`}
                  >
                    {tx.upiId}
                  </p>
                </div>

                {/* Amount + time */}
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-base font-bold text-primary">
                    +₹{Number(tx.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {timeAgo(tx.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
