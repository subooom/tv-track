import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail } from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile 
} from "firebase/auth";
import { auth, facebookProvider, googleProvider } from "@/lib/firebase";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    setError(null);
    try {
      if (type === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'facebook' | 'google') => {
    setLoading(true);
    setError(null);
    try {
      const p = provider === 'facebook' ? facebookProvider : googleProvider;
      await signInWithPopup(auth, p);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">Welcome to TVTRACK</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl font-bold">
            {error}
          </div>
        )}

        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="login" className="font-bold">Login</TabsTrigger>
            <TabsTrigger value="signup" className="font-bold">Signup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-border bg-secondary/50"
              />
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-border bg-secondary/50"
              />
            </div>
            <Button className="w-full rounded-xl font-bold" disabled={loading} onClick={() => handleEmailAuth('login')}>
              {loading ? "Please wait..." : "Login"}
            </Button>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-border bg-secondary/50"
              />
              <Input 
                type="password" 
                placeholder="Choose a password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-border bg-secondary/50"
              />
            </div>
            <Button className="w-full rounded-xl font-bold" disabled={loading} onClick={() => handleEmailAuth('signup')}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-bold">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="rounded-xl font-bold gap-2" onClick={() => handleSocialAuth('facebook')}>
            <Shield className="h-4 w-4 fill-[#1877F2] text-[#1877F2]" /> Facebook
          </Button>
          <Button variant="outline" className="rounded-xl font-bold gap-2" onClick={() => handleSocialAuth('google')}>
             Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
