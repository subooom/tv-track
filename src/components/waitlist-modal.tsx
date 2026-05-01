import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"; // You might need to add shadcn toast

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [featureRequest, setFeatureRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('waitlist').insert([{ 
      email, 
      feature_request: featureRequest 
    }]);
    
    if (!error) {
      setSuccess(true);
      setTimeout(() => onOpenChange(false), 2000);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Zap className="text-primary fill-primary" /> Join TVTRACK Pro
          </DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-bold">You're on the list!</h3>
            <p className="text-sm text-muted-foreground">We'll let you know when Pro launches.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Get early access to <strong>Cloud Sync</strong>, <strong>Calendar Integration</strong>, and <strong>Smart Alerts</strong>.
            </p>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
            <textarea 
              placeholder="Any specific features you'd love to see?" 
              value={featureRequest}
              onChange={(e) => setFeatureRequest(e.target.value)}
              className="w-full min-h-[80px] rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="w-full rounded-xl font-black" disabled={loading}>
              {loading ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
