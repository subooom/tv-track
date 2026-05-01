import { Check, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export function PricingDialog({ open, onOpenChange, onUpgrade }: PricingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-background border-border p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Free Tier */}
          <div className="p-8 border-r border-border bg-secondary/20">
            <h3 className="text-xl font-black mb-2">Free</h3>
            <div className="text-3xl font-black mb-6">$0<span className="text-sm text-muted-foreground font-medium">/forever</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm font-medium">
                <Check className="h-4 w-4 text-primary" /> Local Watchlist
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <Check className="h-4 w-4 text-primary" /> Precision Timers
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <s>Cloud Sync</s>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <s>Push Notifications</s>
              </li>
            </ul>
            <Button variant="outline" className="w-full rounded-xl font-bold" disabled>Current Plan</Button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground">POPULAR</Badge>
            </div>
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 fill-primary text-primary" /> Pro
            </h3>
            <div className="text-3xl font-black mb-6">$4.99<span className="text-sm text-muted-foreground font-medium">/month</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm font-bold">
                <Check className="h-4 w-4 text-primary" /> Cloud Watchlist Sync
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Check className="h-4 w-4 text-primary" /> Smart Push Alerts
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Check className="h-4 w-4 text-primary" /> Personal Calendar Feed
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Check className="h-4 w-4 text-primary" /> Spoiler-Free Mode
              </li>
              <li className="flex items-center gap-3 text-sm font-bold">
                <Check className="h-4 w-4 text-primary" /> Streaming Deep Links
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-primary">
                <Check className="h-4 w-4" /> Advanced Watch Stats
              </li>
            </ul>
            <Button className="w-full rounded-xl font-black bg-primary text-primary-foreground hover:scale-[1.02] transition-transform" onClick={onUpgrade}>
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${className}`}>
      {children}
    </div>
  );
}
