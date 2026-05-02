import { Zap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/search";
import { UserDropdown } from "@/components/user-dropdown";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { WaitlistModal } from "@/components/waitlist-modal";

export function Navbar({ 
  isPremium, 
  user
}: { isPremium: boolean, user: any }) {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[72px] border-b border-border bg-background/80 backdrop-blur-xl z-50 flex items-center px-6">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-8">
        <Link to="/" className="text-xl font-black tracking-tighter flex items-center gap-2 group cursor-pointer flex-shrink-0">
          TV<span className="text-primary group-hover:animate-pulse">TRACK</span>
        </Link>
        
        <div className="flex gap-6 items-center font-bold text-sm text-muted-foreground">
          <Link to="/" className="[&.active]:text-white">Dashboard</Link>
          <Link to="/schedule" className="[&.active]:text-white">Weekly Schedule</Link>
        </div>

        <div className="flex-1 max-w-xs hidden md:block">
          <Search onSelect={(show) => navigate({ to: '/show/$id', params: { id: show.id.toString() } })} />
        </div>

        <div className="flex items-center gap-4">
          {!isPremium && (
            <Button variant="outline" className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/10 rounded-full font-bold gap-2" onClick={() => setIsWaitlistOpen(true)}>
              <Zap className="h-4 w-4 fill-primary" /> Upgrade
            </Button>
          )}
          {user ? (
            <UserDropdown user={user} isPremium={isPremium} />
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full bg-secondary" onClick={() => setIsAuthOpen(true)}><User className="h-5 w-5" /></Button>
          )}
        </div>
      </div>
      <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} />
      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </nav>
  );
}
