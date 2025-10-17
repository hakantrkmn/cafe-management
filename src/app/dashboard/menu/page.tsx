"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CategoryTab } from "@/components/menu/tabs/CategoryTab";
import { ExtraTab } from "@/components/menu/tabs/ExtraTab";
import { MenuItemTab } from "@/components/menu/tabs/MenuItemTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/queries/auth";

export default function MenuPage() {
  const { user, isManager } = useAuth();

  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Bu sayfaya erişim yetkiniz yok.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const cafeId = user?.cafeId || user?.managedCafe?.id;

  if (!cafeId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Kafe bilgisi bulunamadı.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="menu-container space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Menü Yönetimi</h1>
        </div>

        <div className="menu-tabs-container">
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto max-w-sm sm:max-w-md mx-auto">
              <TabsTrigger
                value="categories"
                className="py-2 sm:py-3 text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">Kategoriler</span>
                <span className="sm:hidden">Kategoriler</span>
              </TabsTrigger>
              <TabsTrigger
                value="menu-items"
                className="py-2 sm:py-3 text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">Menü Öğeleri</span>
                <span className="sm:hidden">Menü Öğeleri</span>
              </TabsTrigger>
              <TabsTrigger
                value="extras"
                className="py-2 sm:py-3 text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">Ekstralar</span>
                <span className="sm:hidden">Ekstra</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="categories"
              className="space-y-4 sm:space-y-6 mt-6 sm:mt-8"
            >
              <div className="menu-content-container">
                <CategoryTab cafeId={cafeId} />
              </div>
            </TabsContent>

            <TabsContent
              value="menu-items"
              className="space-y-4 sm:space-y-6 mt-6 sm:mt-8"
            >
              <div className="menu-content-container">
                <MenuItemTab cafeId={cafeId} />
              </div>
            </TabsContent>

            <TabsContent
              value="extras"
              className="space-y-4 sm:space-y-6 mt-6 sm:mt-8"
            >
              <div className="menu-content-container">
                <ExtraTab cafeId={cafeId} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
