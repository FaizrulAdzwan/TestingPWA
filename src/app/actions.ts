'use server';

import { revalidatePath } from 'next/cache';
import { addSale } from '@/lib/data';
import type { Sale } from '@/lib/types';
import { z } from 'zod';

// Define schema matching the form, but expecting ISO date string
const saleSchema = z.object({
  product: z.string().min(2),
  customer: z.string().min(2),
  amount: z.coerce.number().positive(),
  date: z.string().datetime(), // Expect ISO string from client
});


export async function addSaleAction(formData: Omit<Sale, 'id'> & { date: string }) {
  // Validate data on the server
   const validatedData = saleSchema.safeParse(formData);

   if (!validatedData.success) {
    console.error("Server-side validation failed:", validatedData.error.errors);
    // In a real app, return specific error messages
    throw new Error('Invalid sale data submitted.');
   }


  try {
    // Pass validated data to the data layer function
    await addSale(validatedData.data);
    revalidatePath('/'); // Revalidate the home page to show the new sale
    return { success: true, message: "Sale added successfully" };
  } catch (error) {
    console.error('Error adding sale:', error);
     // You might want to throw a more specific error or return an error object
    throw new Error('Failed to add sale due to a server error.');
  }
}
