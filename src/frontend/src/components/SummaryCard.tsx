import { IndianRupee, Receipt, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface SummaryCardProps {
  totalAmount: number;
  count: number;
  isLoading: boolean;
}

export function SummaryCard({
  totalAmount,
  count,
  isLoading,
}: SummaryCardProps) {
  return (
    <motion.div
      data-ocid="summary.card"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 gap-3"
    >
      <div className="bg-card border border-border rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <IndianRupee size={14} className="text-primary" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Today's Earnings
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-28 bg-muted animate-pulse rounded" />
        ) : (
          <motion.p
            key={totalAmount}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-2xl font-black text-foreground"
          >
            ₹{totalAmount.toLocaleString("en-IN")}
          </motion.p>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Receipt size={14} className="text-primary" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Transactions
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <motion.p
            key={count}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-2xl font-black text-foreground"
          >
            {count}
          </motion.p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp size={10} className="text-primary" />
          <span className="text-[10px] text-primary">Today</span>
        </div>
      </div>
    </motion.div>
  );
}
