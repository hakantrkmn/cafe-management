"use client";

import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import * as z from "zod";

const cafeSchema = z.object({
  name: z.string().min(1, "Kafe adı zorunludur"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type CafeFormData = z.infer<typeof cafeSchema>;

interface CafeFormProps {
  initialData?: {
    name: string;
    address?: string;
    phone?: string;
  };
  onSubmit: (data: CafeFormData) => Promise<void>;
  isLoading: boolean;
  submitText: string;
}

export function CafeForm({
  initialData,
  onSubmit,
  isLoading,
  submitText,
}: CafeFormProps) {
  const form = useForm<CafeFormData>({
    resolver: zodResolver(cafeSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
    },
  });

  const handleSubmit = async (data: CafeFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kafe Adı *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Kafe adını girin"
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Input
                  placeholder="Kafe adresini girin"
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input
                  placeholder="Telefon numarasını girin"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
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
