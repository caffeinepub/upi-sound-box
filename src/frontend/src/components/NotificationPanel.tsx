import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Battery, Bell, BellOff, CheckCheck, Clock } from "lucide-react";
import { useState } from "react";

export interface NotificationEntry {
  id: string;
  amount: number;
  sender: string;
  upiId: string;
  timestamp: number;
  read: boolean;
}

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

interface NotificationPanelProps {
  notifications: NotificationEntry[];
  unreadCount: number;
  batteryOptimized: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onToggleBatterySave: (val: boolean) => void;
}

export function NotificationPanel({
  notifications,
  unreadCount,
  batteryOptimized,
  onMarkRead,
  onMarkAllRead,
  onToggleBatterySave,
}: NotificationPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          data-ocid="header.notification_button"
          className="relative w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Notifications"
        >
          {unreadCount > 0 ? (
            <Bell className="w-3.5 h-3.5" />
          ) : (
            <Bell className="w-3.5 h-3.5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-destructive text-[9px] font-bold text-white rounded-full flex items-center justify-center px-0.5 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        data-ocid="notifications.sheet"
        side="right"
        className="w-full max-w-sm p-0 flex flex-col bg-background border-border"
      >
        <SheetHeader className="px-4 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="font-display text-base font-semibold text-foreground">
                Notifications
              </SheetTitle>
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0 h-4 rounded-full"
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                data-ocid="notifications.mark_all_button"
                variant="ghost"
                size="sm"
                onClick={onMarkAllRead}
                className="text-xs text-muted-foreground hover:text-primary h-7 px-2 gap-1"
              >
                <CheckCheck size={12} />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-3 py-2">
            {notifications.length === 0 ? (
              <div
                data-ocid="notifications.empty_state"
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
                  <BellOff size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Payments will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-1 py-1">
                {[...notifications].reverse().map((n, idx) => (
                  <button
                    key={n.id}
                    type="button"
                    data-ocid={`notifications.item.${idx + 1}`}
                    onClick={() => onMarkRead(n.id)}
                    className={`w-full text-left rounded-xl px-3 py-3 transition-all duration-150 border ${
                      !n.read
                        ? "border-primary/30 bg-primary/5 border-l-2 border-l-primary"
                        : "border-transparent bg-card/40 hover:bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          )}
                          <span className="font-display text-sm font-bold text-primary">
                            +₹{n.amount.toLocaleString("en-IN")}
                          </span>
                          <span className="text-sm text-foreground truncate">
                            {n.sender}
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
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Battery Save Toggle */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Battery
                size={15}
                className={
                  batteryOptimized ? "text-primary" : "text-muted-foreground"
                }
              />
              <div>
                <p className="text-xs font-medium text-foreground">
                  Battery Save Mode
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Reduces payment frequency to save power
                </p>
              </div>
            </div>
            <Switch
              data-ocid="notifications.battery_save_toggle"
              checked={batteryOptimized}
              onCheckedChange={onToggleBatterySave}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
