import { LogOut, Settings, User as UserIcon, Zap, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface UserDropdownProps {
  user: FirebaseUser;
  isPremium: boolean;
  onOpenSettings: () => void;
}

export function UserDropdown({ user, isPremium, onOpenSettings }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary overflow-hidden border border-border">
          {user.photoURL ? (
            <img src={user.photoURL} className="h-full w-full object-cover" alt="Profile" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-bold">{user.displayName || "User"}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{isPremium ? "Pro Tier" : "Free Tier"}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onOpenSettings}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
          {!isPremium && (
             <DropdownMenuItem className="text-primary font-bold">
               <Zap className="mr-2 h-4 w-4" /> Upgrade to Pro
             </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut(auth)}>
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
