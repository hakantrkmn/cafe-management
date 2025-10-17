"use client";

import { SignInForm } from "@/components/forms/SignInForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Cafe Yönetim Sistemi</h1>
          <p className="text-muted-foreground">
            Modern cafe yönetimi için tasarlandı
          </p>
        </div>

        <SignInForm />

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => router.push("/auth/signup")}
            className="text-sm"
          >
            Hesabınız yok mu? Kayıt olun
          </Button>
        </div>
      </div>
    </div>
  );
}
