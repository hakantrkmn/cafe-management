"use client";

import { SignUpForm } from "@/components/forms/SignUpForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
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

        <SignUpForm />

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => router.push("/auth/signin")}
            className="text-sm"
          >
            Zaten hesabınız var mı? Giriş yapın
          </Button>
        </div>
      </div>
    </div>
  );
}
