"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const menuItemSchema = z
  .object({
    categoryId: z.string().min(1, "Kategori seçimi zorunludur"),
    name: z.string().min(1, "Menü öğesi adı zorunludur"),
    price: z.number().min(0, "Fiyat 0 veya daha büyük olmalıdır"),
    description: z.string().optional(),
    isAvailable: z.boolean(),
    hasSizes: z.boolean(),
    sizes: z
      .object({
        SMALL: z
          .number()
          .min(0, "Küçük boy fiyatı 0 veya daha büyük olmalıdır"),
        MEDIUM: z
          .number()
          .min(0, "Orta boy fiyatı 0 veya daha büyük olmalıdır"),
        LARGE: z
          .number()
          .min(0, "Büyük boy fiyatı 0 veya daha büyük olmalıdır"),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // If hasSizes is true, sizes must be provided
      if (data.hasSizes && !data.sizes) {
        return false;
      }
      return true;
    },
    {
      message: "Boy seçenekleri aktifse fiyatlar girilmelidir",
      path: ["sizes"],
    }
  );

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface Category {
  id: string;
  name: string;
}

interface MenuItemFormProps {
  initialData?: {
    categoryId: string;
    name: string;
    price: number;
    description?: string;
    isAvailable: boolean;
    hasSizes?: boolean;
    sizes?: {
      SMALL: number;
      MEDIUM: number;
      LARGE: number;
    };
  };
  categories: Category[];
  onSubmit: (data: MenuItemFormData) => void;
  isLoading?: boolean;
  submitText: string;
}

export function MenuItemForm({
  initialData,
  categories,
  onSubmit,
  isLoading = false,
  submitText,
}: MenuItemFormProps) {
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || "",
      name: initialData?.name || "",
      price: initialData?.price || 0,
      description: initialData?.description || "",
      isAvailable: initialData?.isAvailable ?? true,
      hasSizes: initialData?.hasSizes ?? false,
      sizes: initialData?.sizes || {
        SMALL: 0,
        MEDIUM: 0,
        LARGE: 0,
      },
    },
  });

  const handleSubmit = (data: MenuItemFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-3 sm:space-y-4"
      >
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Kategori *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-9 sm:h-10">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">
                Menü Öğesi Adı *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Menü öğesi adını girin"
                  {...field}
                  disabled={isLoading}
                  className="h-9 sm:h-10"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasSizes"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm sm:text-base">
                  Bu ürünün farklı boyları var mı?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {form.watch("hasSizes") ? (
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="sizes.SMALL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Küçük Boy Fiyatı (₺) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.onChange(0);
                        } else {
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? 0 : numValue);
                        }
                      }}
                      disabled={isLoading}
                      className="h-9 sm:h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizes.MEDIUM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Orta Boy Fiyatı (₺) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.onChange(0);
                        } else {
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? 0 : numValue);
                        }
                      }}
                      disabled={isLoading}
                      className="h-9 sm:h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizes.LARGE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Büyük Boy Fiyatı (₺) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.onChange(0);
                        } else {
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? 0 : numValue);
                        }
                      }}
                      disabled={isLoading}
                      className="h-9 sm:h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  Fiyat (₺) *
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        field.onChange(0);
                      } else {
                        const numValue = parseFloat(value);
                        field.onChange(isNaN(numValue) ? 0 : numValue);
                      }
                    }}
                    disabled={isLoading}
                    className="h-9 sm:h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Menü öğesi açıklaması"
                  {...field}
                  disabled={isLoading}
                  className="min-h-[80px] sm:min-h-[100px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm sm:text-base">Müsait</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 sm:h-11 mt-4 sm:mt-6"
        >
          {isLoading ? "Kaydediliyor..." : submitText}
        </Button>
      </form>
    </Form>
  );
}
