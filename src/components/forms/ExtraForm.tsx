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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const extraSchema = z.object({
  name: z.string().min(1, "Ekstra adı zorunludur"),
  price: z.number().min(0, "Fiyat 0'dan büyük olmalıdır"),
  isAvailable: z.boolean(),
});

type ExtraFormData = z.infer<typeof extraSchema>;

interface ExtraFormProps {
  initialData?: {
    name: string;
    price: number;
    isAvailable: boolean;
  };
  onSubmit: (data: ExtraFormData) => void;
  isLoading?: boolean;
  submitText: string;
}

export function ExtraForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText,
}: ExtraFormProps) {
  const form = useForm<ExtraFormData>({
    resolver: zodResolver(extraSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      isAvailable: initialData?.isAvailable ?? true,
    },
  });

  const handleSubmit = (data: ExtraFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ekstra Adı *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ekstra adını girin"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fiyat (₺) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={isLoading}
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
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Müsait</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Kaydediliyor..." : submitText}
        </Button>
      </form>
    </Form>
  );
}
