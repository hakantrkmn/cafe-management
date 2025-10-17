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
import * as z from "zod";

const tableSchema = z.object({
  name: z.string().min(1, "Masa adı zorunludur"),
});

type TableFormData = z.infer<typeof tableSchema>;

interface TableFormProps {
  initialData?: {
    name: string;
  };
  onSubmit: (data: TableFormData) => Promise<void>;
  isLoading: boolean;
  submitText: string;
}

export function TableForm({
  initialData,
  onSubmit,
  isLoading,
  submitText,
}: TableFormProps) {
  const form = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const handleSubmit = async (data: TableFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Masa Adı</FormLabel>
              <FormControl>
                <Input
                  placeholder="Masa adını girin"
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
