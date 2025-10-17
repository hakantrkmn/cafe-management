"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/queries/auth";
import { Building, Calendar, Mail, User } from "lucide-react";

export function UserInfo() {
  const { user, isManager } = useAuth();

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Kullanıcı Bilgileri
        </CardTitle>
        <CardDescription>Hesap bilgileriniz ve kafe durumunuz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Ad Soyad</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{user.name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{user.email}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Rol</span>
            </div>
            <div className="ml-6">
              <Badge variant={isManager ? "default" : "outline"}>
                {isManager ? "Yönetici" : "Çalışan"}
              </Badge>
            </div>
          </div>

          {user.cafe && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Kafe</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {user.cafe.name}
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Hesap Durumu</span>
          </div>
          <div className="ml-6">
            {user.cafe ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Aktif Kafe Bağlantısı
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800"
              >
                Kafe Bağlantısı Bekleniyor
              </Badge>
            )}
          </div>
        </div>

        {isManager && user.managedCafe && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Yönettiğiniz Kafe</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-sm font-medium">{user.managedCafe.name}</p>
                {user.managedCafe.address && (
                  <p className="text-xs text-muted-foreground">
                    {user.managedCafe.address}
                  </p>
                )}
                {user.managedCafe.phone && (
                  <p className="text-xs text-muted-foreground">
                    {user.managedCafe.phone}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
