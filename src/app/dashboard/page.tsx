"use client";

import { useAuth, useLogout } from "@/queries/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, isManager, isStaff } = useAuth();
  const logoutMutation = useLogout();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cafe Yönetim Sistemi
              </h1>
              <p className="text-gray-600">Hoş geldiniz, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {isManager ? "Yönetici" : "Çalışan"}
              </span>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
              >
                {logoutMutation.isPending ? "Çıkış yapılıyor..." : "Çıkış Yap"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isManager && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Kafe Ayarları
                </h3>
                <p className="text-gray-600 mb-4">
                  Kafe bilgilerini düzenleyin
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                  Ayarlar
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Menü Yönetimi
                </h3>
                <p className="text-gray-600 mb-4">
                  Menü kategorileri ve ürünleri ekleyin
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm">
                  Menü
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Çalışan Yönetimi
                </h3>
                <p className="text-gray-600 mb-4">
                  Çalışanları davet edin ve yönetin
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm">
                  Çalışanlar
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Masa Yönetimi
                </h3>
                <p className="text-gray-600 mb-4">
                  Masaları ekleyin ve düzenleyin
                </p>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm">
                  Masalar
                </button>
              </div>
            </>
          )}

          {(isManager || isStaff) && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sipariş Alma
                </h3>
                <p className="text-gray-600 mb-4">Yeni siparişler alın</p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm">
                  Sipariş Al
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aktif Siparişler
                </h3>
                <p className="text-gray-600 mb-4">
                  Bekleyen siparişleri görüntüleyin
                </p>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm">
                  Siparişler
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Kullanıcı Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {isManager ? "Yönetici" : "Çalışan"}
              </p>
            </div>
            {user?.cafe && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kafe
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.cafe.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
