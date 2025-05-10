import { SalesDashboard } from '@/components/sales-dashboard';
import { SalesInputForm } from '@/components/sales-input-form';
import { getSales } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Home() {
  const initialSales = await getSales();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-secondary">
      <div className="w-full max-w-6xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-primary">Sales Tracker</h1>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Add New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesInputForm />
          </CardContent>
        </Card>

        <SalesDashboard initialSales={initialSales} />

      </div>
    </main>
  );
}
