"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/formatters";
import {
  Extra,
  ExtraWithQuantity,
  MenuItemSize,
  MenuItemWithRelations,
} from "@/types";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExtraSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: MenuItemWithRelations | null;
  selectedSize?: MenuItemSize;
  availableExtras: Extra[];
  onAddToCart: (
    menuItem: MenuItemWithRelations,
    quantity: number,
    selectedExtras: ExtraWithQuantity[]
  ) => void;
}

interface SelectedExtra {
  extra: Extra;
  quantity: number;
}

export function ExtraSelectionDialog({
  open,
  onOpenChange,
  menuItem,
  selectedSize,
  availableExtras,
  onAddToCart,
}: ExtraSelectionDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);

  const handleExtraToggle = (extra: Extra, checked: boolean) => {
    if (checked) {
      setSelectedExtras((prev) => [...prev, { extra, quantity: 1 }]);
    } else {
      setSelectedExtras((prev) =>
        prev.filter((se) => se.extra.id !== extra.id)
      );
    }
  };

  const updateExtraQuantity = (extraId: string, newQuantity: number): void => {
    if (newQuantity <= 0) {
      setSelectedExtras((prev) => prev.filter((se) => se.extra.id !== extraId));
      return;
    }

    setSelectedExtras((prev) =>
      prev.map((se) =>
        se.extra.id === extraId ? { ...se, quantity: newQuantity } : se
      )
    );
  };

  const calculateTotal = (): number => {
    if (!menuItem) return 0;

    // Get the correct price based on size
    let itemPrice = menuItem.price;
    if (menuItem.hasSizes && selectedSize && menuItem.prices) {
      const sizePrice = menuItem.prices.find((p) => p.size === selectedSize);
      if (sizePrice) {
        itemPrice = sizePrice.price;
      }
    }

    let total = itemPrice * quantity;
    selectedExtras.forEach((se) => {
      total += se.extra.price * se.quantity;
    });

    return total;
  };

  const handleAddToCart = (): void => {
    if (!menuItem) return;

    // Create separate entries for each extra instance (like products)
    const extrasWithQuantity: ExtraWithQuantity[] = [];
    selectedExtras.forEach((se) => {
      // Add the extra multiple times based on quantity
      for (let i = 0; i < se.quantity; i++) {
        extrasWithQuantity.push({
          id: se.extra.id,
          name: se.extra.name,
          price: se.extra.price,
          quantity: 1, // Each instance has quantity 1
        });
      }
    });

    console.log("ExtraSelectionDialog - handleAddToCart called");
    onAddToCart(menuItem, quantity, extrasWithQuantity);

    // Show success toast
    toast.success(`${menuItem.name} sepete eklendi`, {
      description: `Miktar: ${quantity}${
        selectedSize ? ` (${selectedSize})` : ""
      }`,
    });

    // Reset form
    setQuantity(1);
    setSelectedExtras([]);
    console.log("ExtraSelectionDialog - closing dialog");
    onOpenChange(false);
  };

  const handleClose = (): void => {
    setQuantity(1);
    setSelectedExtras([]);
    onOpenChange(false);
  };

  if (!menuItem) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {menuItem.name}
            {selectedSize && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({selectedSize === "SMALL" && "Küçük"}
                {selectedSize === "MEDIUM" && "Orta"}
                {selectedSize === "LARGE" && "Büyük"})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Menu Item Info */}
          <Card className="p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{menuItem.name}</p>
                {menuItem.description && (
                  <p className="text-sm text-muted-foreground">
                    {menuItem.description}
                  </p>
                )}
              </div>
              <Badge variant="secondary">
                {(() => {
                  // Get the correct price based on size
                  let itemPrice = menuItem.price;
                  if (menuItem.hasSizes && selectedSize && menuItem.prices) {
                    const sizePrice = menuItem.prices.find(
                      (p) => p.size === selectedSize
                    );
                    if (sizePrice) {
                      itemPrice = sizePrice.price;
                    }
                  }
                  return formatPrice(itemPrice);
                })()}
              </Badge>
            </div>
          </Card>

          {/* Quantity Selection */}
          <div className="space-y-2">
            <Label>Miktar</Label>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 text-center"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Extras Selection */}
          {availableExtras.length > 0 && (
            <div className="space-y-2">
              <Label>Ekstralar</Label>
              <div className="extra-selection-grid">
                {availableExtras.map((extra) => {
                  const selectedExtra = selectedExtras.find(
                    (se) => se.extra.id === extra.id
                  );

                  return (
                    <Card key={extra.id} className="extra-selection-card">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={!!selectedExtra}
                            onCheckedChange={(checked) =>
                              handleExtraToggle(extra, checked as boolean)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {extra.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(extra.price)}
                            </p>
                          </div>
                        </div>

                        {selectedExtra && (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateExtraQuantity(
                                  extra.id,
                                  selectedExtra.quantity - 1
                                )
                              }
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {selectedExtra.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateExtraQuantity(
                                  extra.id,
                                  selectedExtra.quantity + 1
                                )
                              }
                              className="h-7 w-7 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold">Toplam:</span>
            <span className="font-bold text-lg">
              {formatPrice(calculateTotal())}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              İptal
            </Button>
            <Button onClick={handleAddToCart} className="flex-1">
              Sepete Ekle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
