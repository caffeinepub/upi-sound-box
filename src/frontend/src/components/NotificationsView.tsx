import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellOff, CheckCheck, Clock, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { NotificationEntry } from "./NotificationPanel";

function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", {
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

function upiAppLabel(upiId: string): string {
  if (upiId.includes("paytm")) return "Paytm";
  if (upiId.includes("ybl")) return "PhonePe";
  if (upiId.includes("gpay")) return "GPay";
  if (upiId.includes("okaxis")) return "Axis";
  return "UPI";
}

interface NotificationsViewProps {
  notifications: NotificationEntry[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

type FilterTab = "all" | "unread" | "read";

export function NotificationsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}: NotificationsViewProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filtered = [...notifications].reverse().filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const emptyMessages: Record<FilterTab, { title: string; sub: string }> = {
    all: { title: "No notifications yet", sub: "Payments will appear here" },
    unread: { title: "All caught up!", sub: "No unread notifications" },
    read: {
      title: "Nothing read yet",
      sub: "Tap a notification to mark it read",
    },
  };

  const isEmpty = filtered.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header row */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-lg text-foreground">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="text-[10px] px-1.5 py-0 h-4 rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              data-ocid="notifications.mark_all_button"
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="text-xs text-muted-foreground hover:text-primary h-7 px-2 gap-1"
            >
              <CheckCheck size={12} />
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              data-ocid="notifications.clear_all_button"
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-destructive h-7 px-2 gap-1"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">Clear all</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pb-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList className="w-full h-9 bg-secondary/60">
            <TabsTrigger
              data-ocid="notifications.filter.tab"
              value="all"
              className="flex-1 text-xs gap-1.5"
            >
              All
              {notifications.length > 0 && (
                <span className="text-muted-foreground text-[10px]">
                  ({notifications.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              data-ocid="notifications.filter.tab"
              value="unread"
              className="flex-1 text-xs gap-1.5"
            >
              Unread
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[9px] px-1 py-0 h-3.5 rounded-full min-w-[14px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              data-ocid="notifications.filter.tab"
              value="read"
              className="flex-1 text-xs gap-1.5"
            >
              Read
              {readCount > 0 && (
                <span className="text-muted-foreground text-[10px]">
                  ({readCount})
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 px-3">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key={`empty-${filter}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              data-ocid="notifications.empty_state"
              className="flex flex-col items-center justify-center py-20 gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                <BellOff size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {emptyMessages[filter].title}
              </p>
              <p className="text-xs text-muted-foreground">
                {emptyMessages[filter].sub}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`list-${filter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1.5 py-1 pb-4"
            >
              {filtered.map((n, idx) => (
                <motion.button
                  key={n.id}
                  type="button"
                  data-ocid={`notifications.item.${idx + 1}`}
                  onClick={() => onMarkRead(n.id)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  className={`w-full text-left rounded-xl px-3 py-3 transition-all duration-150 ${
                    !n.read
                      ? "bg-primary/5 border border-primary/20 border-l-2 border-l-primary"
                      : "bg-card/40 border border-transparent hover:bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <span className="font-display text-sm font-bold text-primary">
                          +₹{n.amount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-sm text-foreground truncate max-w-[110px]">
                          {n.sender}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-secondary ${upiColor(
                            n.upiId,
                          )}`}
                        >
                          {upiAppLabel(n.upiId)}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] font-mono mt-0.5 truncate ${upiColor(n.upiId)}`}
                      >
                        {n.upiId}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                      <Clock size={9} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {relativeTime(n.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
