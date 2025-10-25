"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-destructive">Unauthorized</h1>
        <p className="text-muted-foreground text-base">
          You don&apos;t have permission to access this page. Please login to
          continue.
        </p>
        <Button onClick={() => router.push("/login")}>Back to Login</Button>
      </div>
    </div>
  );
}
