import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPremium: boolean;
}

export function SettingsModal({ open, onOpenChange, isPremium }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <Label>Local Timezone</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Label className={!isPremium ? "text-muted-foreground" : ""}>Smart Notifications</Label>
               {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Switch disabled={!isPremium} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Label className={!isPremium ? "text-muted-foreground" : ""}>Calendar Sync</Label>
               {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Switch disabled={!isPremium} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
