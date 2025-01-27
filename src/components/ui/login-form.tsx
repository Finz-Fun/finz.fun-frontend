"use client"
import { cn } from "@/src/lib/utils";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Handle Twitter sign in
  const handleTwitterSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn("twitter", { 
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle your form submission logic here
  };

  // Handle sign out
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signOut({ 
        callbackUrl: "/" // or wherever you want to redirect after logout
      });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Setup your AI Agent</CardTitle>
          {status === "authenticated" ? (
            <CardDescription>
              <Button 
                variant="link" 
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </Button>
            </CardDescription>
          ) : (
            <CardDescription>
              <Button 
                variant="link" 
                onClick={handleTwitterSignIn}
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Login with your X (twitter) account"}
              </Button>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleTwitterSignIn}
                  disabled={isLoading || status === "authenticated"}
                >
                  {isLoading ? "Connecting..." : "Login with X (twitter)"}
                </Button>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center">
                    Turn on your AI Agent
                    <div className="ml-12">
                      <Switch />
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || status !== "authenticated"}
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>{" "}
        and{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
      </div>
    </div>
  );
}
