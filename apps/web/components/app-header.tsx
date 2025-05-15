import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b bg-white sticky top-0 z-50">
      <div className="flex flex-row justify-between items-center px-3 w-full">
        <div className="flex flex-row gap-2 items-center">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>
        <div>
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
