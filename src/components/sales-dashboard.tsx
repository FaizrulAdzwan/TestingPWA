'use client';

import * as React from 'react';
import type { Sale } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

const ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__"; // Special value for "All" options

export function SalesDashboard({ initialSales }: { initialSales: Sale[] }) {
  const [sales, setSales] = React.useState<Sale[]>(initialSales);
  const [productFilter, setProductFilter] = React.useState<string>('');
  const [customerFilter, setCustomerFilter] = React.useState<string>('');
  const [dateRange, setDateRange] = React.useState<DateRange>({ from: undefined, to: undefined });
  const [filteredSales, setFilteredSales] = React.useState<Sale[]>(initialSales);

  // Derive unique products and customers for filter dropdowns
  const uniqueProducts = React.useMemo(() => Array.from(new Set(initialSales.map(s => s.product))), [initialSales]);
  const uniqueCustomers = React.useMemo(() => Array.from(new Set(initialSales.map(s => s.customer))), [initialSales]);

  // Update filtered sales when filters change
  React.useEffect(() => {
    let currentSales = [...initialSales]; // Use initialSales as the base for filtering

    if (productFilter) {
      currentSales = currentSales.filter(sale => sale.product === productFilter);
    }
    if (customerFilter) {
      currentSales = currentSales.filter(sale => sale.customer === customerFilter);
    }
    if (dateRange.from) {
        // Set time to start of the day for 'from' date
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        currentSales = currentSales.filter(sale => sale.date >= fromDate);
    }
    if (dateRange.to) {
        // Set time to end of the day for 'to' date
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        currentSales = currentSales.filter(sale => sale.date <= toDate);
    }

    setFilteredSales(currentSales);
  }, [productFilter, customerFilter, dateRange, initialSales]);

  const totalSalesAmount = React.useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  }, [filteredSales]);

  const salesByProduct = React.useMemo(() => {
    const grouped: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      grouped[sale.product] = (grouped[sale.product] || 0) + sale.amount;
    });
    return Object.entries(grouped).map(([name, total]) => ({ name, total }));
  }, [filteredSales]);

    const chartConfig = {
    total: {
      label: "Total Sales ($)",
      color: "hsl(var(--chart-1))", // Use theme color
    },
  } satisfies React.ComponentProps<typeof ChartContainer>["config"];

  const clearFilters = () => {
    setProductFilter('');
    setCustomerFilter('');
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Sales Dashboard</CardTitle>
        <CardDescription>Summary and details of sales data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter Section */}
        <Card className="bg-secondary p-4">
          <CardTitle className="text-lg mb-3">Filters</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Product Filter */}
            <div className="space-y-1">
                <label htmlFor="product-filter" className="text-sm font-medium">Product</label>
                <Select
                  value={productFilter}
                  onValueChange={(selectedValue) => {
                    setProductFilter(selectedValue === ALL_ITEMS_FILTER_VALUE ? '' : selectedValue);
                  }}
                >
                  <SelectTrigger id="product-filter">
                      <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value={ALL_ITEMS_FILTER_VALUE}>All Products</SelectItem>
                      {uniqueProducts.map(product => (
                      <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
            </div>

            {/* Customer Filter */}
             <div className="space-y-1">
                <label htmlFor="customer-filter" className="text-sm font-medium">Customer</label>
                <Select
                  value={customerFilter}
                  onValueChange={(selectedValue) => {
                    setCustomerFilter(selectedValue === ALL_ITEMS_FILTER_VALUE ? '' : selectedValue);
                  }}
                >
                  <SelectTrigger id="customer-filter">
                      <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value={ALL_ITEMS_FILTER_VALUE}>All Customers</SelectItem>
                      {uniqueCustomers.map(customer => (
                      <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-1">
                 <label htmlFor="date-range-filter" className="text-sm font-medium">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-range-filter"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
            </div>

             {/* Clear Filters Button */}
            <Button onClick={clearFilters} variant="outline" className="w-full md:w-auto">
              <FilterX className="mr-2 h-4 w-4" /> Clear Filters
            </Button>

          </div>
        </Card>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                ${totalSalesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
           <Card className="bg-secondary">
                <CardHeader>
                <CardTitle className="text-lg">Sales by Product</CardTitle>
                <CardDescription>Total sales amount per product.</CardDescription>
                </CardHeader>
                <CardContent>
                  {salesByProduct.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                       <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={salesByProduct} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={50} />
                            <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} tick={{ fontSize: 12 }} />
                             <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                                />
                            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                             <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                       </ResponsiveContainer>
                    </ChartContainer>
                     ) : (
                        <p className="text-muted-foreground text-center">No sales data for the selected filters.</p>
                    )}
                </CardContent>
            </Card>
        </div>


        {/* Sales Table */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Sales Details</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? (
                  filteredSales
                    .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date descending
                    .map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.product}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell className="text-right">
                          ${sale.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                         <TableCell>{format(sale.date, 'PPP')}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No sales found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}