import type { Sale } from '@/lib/types';

// Temporary in-memory store for sales data
let sales: Sale[] = [
  { id: '1', product: 'Laptop', customer: 'Acme Corp', amount: 1200, date: new Date(2024, 5, 15) },
  { id: '2', product: 'Keyboard', customer: 'Globex Inc', amount: 75, date: new Date(2024, 5, 20) },
  { id: '3', product: 'Monitor', customer: 'Acme Corp', amount: 300, date: new Date(2024, 6, 1) },
  { id: '4', product: 'Laptop', customer: 'Stark Industries', amount: 1500, date: new Date(2024, 6, 5) },
  { id: '5', product: 'Mouse', customer: 'Globex Inc', amount: 25, date: new Date(2024, 6, 10) },
];

// Simulate fetching data (e.g., from a database)
export async function getSales(): Promise<Sale[]> {
  // In a real app, you'd fetch from a database here
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  // Return a deep copy to prevent direct modification of the store
  return JSON.parse(JSON.stringify(sales)).map((sale: Sale & { date: string }) => ({
      ...sale,
      date: new Date(sale.date) // Ensure date is a Date object
  }));
}

// Simulate adding data
export async function addSale(saleData: Omit<Sale, 'id' | 'date'> & { date: string | Date }): Promise<Sale> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  const newSale: Sale = {
    ...saleData,
    id: String(Date.now()), // Simple unique ID generation
    date: new Date(saleData.date),
    amount: Number(saleData.amount) // Ensure amount is a number
  };
  sales.push(newSale);
  // Return a deep copy
  return JSON.parse(JSON.stringify(newSale));
}

// In a real application, you would use server actions or API routes
// to handle data mutations securely on the server.
