'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { addSaleAction } from '@/app/actions'; // Server Action
import { cn } from "@/lib/utils";

const formSchema = z.object({
  product: z.string().min(2, {
    message: 'Product name must be at least 2 characters.',
  }),
  customer: z.string().min(2, {
    message: 'Customer name must be at least 2 characters.',
  }),
  amount: z.coerce.number().positive({ // Use coerce to handle string input
    message: 'Amount must be a positive number.',
  }),
  date: z.date({
    required_error: "A date is required.",
  }),
});

type SalesFormValues = z.infer<typeof formSchema>;

export function SalesInputForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: '',
      customer: '',
      amount: 0,
      date: new Date(),
    },
  });

  async function onSubmit(values: SalesFormValues) {
    setIsSubmitting(true);
    try {
       // Format date before sending to server action
       const valuesToSend = {
        ...values,
        date: values.date.toISOString(), // Send as ISO string
      };
      await addSaleAction(valuesToSend);
      toast({
        title: "Sale Added!",
        description: `Successfully added sale for ${values.product}.`,
        variant: "default", // Use default variant which uses primary color
      });
      form.reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Failed to add sale:", error);
      toast({
        title: "Error",
        description: "Failed to add sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Laptop Pro X" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Tech Solutions Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                   {/* Ensure the input type is number for better mobile UX */}
                   <Input type="number" placeholder="e.g., 1500" {...field} step="0.01" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2"> {/* Adjusted pt-2 for alignment */}
                <FormLabel>Date of Sale</FormLabel>
                 <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isSubmitting ? (
             <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Sale...
            </>
          ) : (
            'Add Sale'
          )}
        </Button>
      </form>
       {/* Toaster needs to be included in the layout or page */}
    </Form>
  );
}
