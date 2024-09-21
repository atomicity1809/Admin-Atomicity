import React from "react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Admin Page</h1>
      <h2 className="text-2xl mb-8">Atomicity</h2>
      
      {/* Clerk authentication */}
      <div className="auth-btns flex gap-x-3">
        <ClerkLoaded>
          <SignedOut>
            <Button variant="ghost" className="text-primary">
              <SignInButton mode="modal" fallbackRedirectUrl={"/dashboard"} />
            </Button>
            <Button variant="default">
              <SignUpButton mode="modal" fallbackRedirectUrl={"/signup"} />
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </ClerkLoaded>
        <ClerkLoading>
          <Button variant="ghost" disabled>
            Sign in
          </Button>
          <Button variant="default" disabled>
            Sign up
          </Button>
        </ClerkLoading>
      </div>  
    </div>
  );
};

export default HomePage;
