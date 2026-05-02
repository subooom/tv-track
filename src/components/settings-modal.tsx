import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Bell, Globe, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isPremium: boolean;
  isPage?: boolean;
}

export function SettingsModal({ open, onOpenChange, isPremium, isPage }: SettingsModalProps) {
  const content = (
    <div className={`space-y-8 ${isPage ? "" : "mt-4"}`}>
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" /> Time & Region
        </h3>
        <div className="space-y-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
          <div className="flex items-center justify-between">
            <Label>Local Timezone</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Default Country</Label>
            <Select defaultValue="US">
              <SelectTrigger className="w-[120px] h-8 text-xs rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">US</SelectItem>
                <SelectItem value="GB">UK</SelectItem>
                <SelectItem value="CA">CA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notifications
        </h3>
        <div className="space-y-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Label className={!isPremium ? "text-muted-foreground" : ""}>Smart Reminders</Label>
               {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Switch disabled={!isPremium} />
          </div>
          <div className="flex items-center justify-between">
            <Label className={!isPremium ? "text-muted-foreground" : ""}>Reminder Lead Time</Label>
            <Select defaultValue="15" disabled={!isPremium}>
              <SelectTrigger className="w-[120px] h-8 text-xs rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 mins</SelectItem>
                <SelectItem value="15">15 mins</SelectItem>
                <SelectItem value="30">30 mins</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Globe className="h-4 w-4" /> Integration
        </h3>
        <div className="space-y-4 bg-secondary/20 p-4 rounded-2xl border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Label className={!isPremium ? "text-muted-foreground" : ""}>Calendar Sync</Label>
               {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Switch disabled={!isPremium} />
          </div>
        </div>
      </section>
    </div>
  );

  if (isPage) {
    return (
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-black mb-8">Settings</h1>
        {content}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
