"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/formatters";
import { useAuth } from "@/queries/auth";
import { useCreateCampaign, useUpdateCampaign } from "@/queries/campaign";
import { useMenu } from "@/queries/menu";
import {
  CampaignWithRelations,
  CreateCampaignRequest,
  MenuItemPrice,
  MenuItemSize,
  MenuItemWithRelations,
} from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CampaignFormProps {
  campaign?: CampaignWithRelations;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CampaignItemForm {
  id: string;
  menuItemId: string;
  quantity: number;
  size?: MenuItemSize;
}

export function CampaignForm({
  campaign,
  onSuccess,
  onCancel,
}: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    price: campaign?.price || 0,
    isActive: campaign?.isActive ?? true,
  });

  const [items, setItems] = useState<CampaignItemForm[]>(() => {
    if (campaign?.campaignItems) {
      return campaign.campaignItems.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        size: item.size || undefined,
      }));
    }
    return [{ id: "1", menuItemId: "", quantity: 1, size: undefined }];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();

  const { user } = useAuth();
  const cafeId = user?.cafeId || user?.managedCafe?.id;
  const { data: menuData } = useMenu(cafeId || "");
  const menuItems = menuData?.menuItems || [];

  const isLoading =
    createCampaignMutation.isPending || updateCampaignMutation.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Kampanya adı gereklidir";
    }

    if (formData.price <= 0) {
      newErrors.price = "Fiyat 0'dan büyük olmalıdır";
    }

    if (items.length === 0) {
      newErrors.items = "En az bir ürün seçilmelidir";
    }

    items.forEach((item, index) => {
      if (!item.menuItemId) {
        newErrors[`item_${index}_menuItem`] = "Ürün seçilmelidir";
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "Miktar 0'dan büyük olmalıdır";
      }

      // Check if size is required for menu items with sizes
      const menuItem = getMenuItem(item.menuItemId);
      if (menuItem?.hasSizes && !item.size) {
        newErrors[`item_${index}_size`] = "Bu ürün için boyut seçilmelidir";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const campaignData: CreateCampaignRequest = {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price,
        isActive: formData.isActive,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          size: item.size,
        })),
      };

      if (campaign) {
        await updateCampaignMutation.mutateAsync({
          campaignId: campaign.id,
          data: campaignData,
        });
      } else {
        await createCampaignMutation.mutateAsync(campaignData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        menuItemId: "",
        quantity: 1,
        size: undefined,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof CampaignItemForm,
    value: string | number | MenuItemSize | undefined
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const getMenuItem = (menuItemId: string) => {
    return menuItems.find(
      (item: MenuItemWithRelations) => item.id === menuItemId
    );
  };

  const calculateTotalPrice = () => {
    return items.reduce((total, item) => {
      const menuItem = getMenuItem(item.menuItemId);
      if (!menuItem) return total;

      let itemPrice = menuItem.price;
      if (menuItem.hasSizes && item.size) {
        const priceEntry = menuItem.prices?.find(
          (p: MenuItemPrice) => p.size === item.size
        );
        itemPrice = priceEntry?.price || menuItem.price;
      }

      return total + itemPrice * item.quantity;
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Kampanya Adı *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örn: 3 Kahve Kampanyası"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Kampanya hakkında açıklama..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="price">Kampanya Fiyatı (TL) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: parseFloat(e.target.value) || 0,
              })
            }
            className={errors.price ? "border-destructive" : ""}
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: !!checked })
            }
          />
          <Label htmlFor="isActive">Kampanya aktif</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Kampanya Ürünleri *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Ürün Ekle
          </Button>
        </div>

        {errors.items && (
          <p className="text-sm text-destructive">{errors.items}</p>
        )}

        <div className="space-y-3">
          {items.map((item, index) => {
            const menuItem = getMenuItem(item.menuItemId);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <Select
                    value={item.menuItemId}
                    onValueChange={(value) =>
                      updateItem(item.id, "menuItemId", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors[`item_${index}_menuItem`]
                          ? "border-destructive"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Ürün seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuItems.map((menuItem: MenuItemWithRelations) => (
                        <SelectItem key={menuItem.id} value={menuItem.id}>
                          {menuItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`item_${index}_menuItem`] && (
                    <p className="text-sm text-destructive mt-1">
                      {errors[`item_${index}_menuItem`]}
                    </p>
                  )}
                </div>

                {menuItem?.hasSizes && (
                  <div className="w-24">
                    <Select
                      value={item.size || ""}
                      onValueChange={(value) =>
                        updateItem(item.id, "size", value as MenuItemSize)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors[`item_${index}_size`]
                            ? "border-destructive"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Boyut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMALL">Küçük</SelectItem>
                        <SelectItem value="MEDIUM">Orta</SelectItem>
                        <SelectItem value="LARGE">Büyük</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors[`item_${index}_size`] && (
                      <p className="text-sm text-destructive mt-1">
                        {errors[`item_${index}_size`]}
                      </p>
                    )}
                  </div>
                )}

                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className={
                      errors[`item_${index}_quantity`]
                        ? "border-destructive"
                        : ""
                    }
                  />
                  {errors[`item_${index}_quantity`] && (
                    <p className="text-sm text-destructive mt-1">
                      {errors[`item_${index}_quantity`]}
                    </p>
                  )}
                </div>

                <div className="w-20 text-sm text-muted-foreground">
                  {menuItem && (
                    <span>
                      {formatPrice(
                        (menuItem.hasSizes && item.size
                          ? menuItem.prices?.find(
                              (p: MenuItemPrice) => p.size === item.size
                            )?.price || menuItem.price
                          : menuItem.price) * item.quantity
                      )}
                    </span>
                  )}
                </div>

                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>Normal fiyat toplamı:</span>
            <span className="font-medium">
              {formatPrice(calculateTotalPrice())}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span>Kampanya fiyatı:</span>
            <span className="font-bold text-primary">
              {formatPrice(formData.price)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1 font-semibold">
            <span>İndirim:</span>
            <span className="text-green-600">
              {formatPrice(calculateTotalPrice() - formData.price)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : campaign ? "Güncelle" : "Oluştur"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
