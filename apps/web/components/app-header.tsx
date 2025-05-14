import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'

export default function AppHeader() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
        </div>
      </header>
    )
}