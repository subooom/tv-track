import { useState } from "react";
import { User as UserIcon, Calendar, Zap, Mail, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type User as FirebaseUser } from "firebase/auth";

interface ProfilePageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: FirebaseUser;
  isPremium: boolean;
}

export function ProfilePage({ open, onOpenChange, user, isPremium }: ProfilePageProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Your Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 mt-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
              {user.photoURL ? <img src={user.photoURL} alt="Profile" /> : <UserIcon className="h-10 w-10 text-muted-foreground" />}
            </div>
            <div>
              <h2 className="text-xl font-black">{user.displayName || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-3">
                <Zap className={`h-5 w-5 ${isPremium ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                <span className="font-bold">Subscription Plan</span>
              </div>
              <span className="font-black text-primary">{isPremium ? "PRO" : "FREE"}</span>
            </div>
          </div>

          {!isPremium && (
            <Button className="w-full rounded-xl font-black">Manage Subscription</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
