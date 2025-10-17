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

const inviteStaffSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
});

type InviteStaffFormData = z.infer<typeof inviteStaffSchema>;

interface InviteStaffFormProps {
  onSubmit: (data: InviteStaffFormData) => Promise<void>;
  isLoading: boolean;
}

export function InviteStaffForm({ onSubmit, isLoading }: InviteStaffFormProps) {
  const form = useForm<InviteStaffFormData>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: InviteStaffFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Adresi</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="ornek@email.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Davet Ediliyor..." : "Çalışan Davet Et"}
        </Button>
      </form>
    </Form>
  );
}
