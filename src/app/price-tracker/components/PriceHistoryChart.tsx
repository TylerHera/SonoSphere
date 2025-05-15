'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

interface PriceHistoryChartProps {
  itemId: string;
  // TODO: Define a more specific type for price data points
  priceData?: Array<{ date: string; price: number | null }>;
}

// Mock data for demonstration - replace with actual data fetching
const MOCK_PRICE_DATA = [
  { date: '2023-01-01', price: 30 },
  { date: '2023-02-01', price: 32 },
  { date: '2023-03-01', price: 28 },
  { date: '2023-04-01', price: 29 },
  { date: '2023-05-01', price: 25 },
  { date: '2023-06-01', price: 26 },
];

export function PriceHistoryChart({
  itemId,
  priceData = MOCK_PRICE_DATA,
}: PriceHistoryChartProps) {
  // TODO: Fetch actual price history for itemId from the backend API (e.g., using KeepaService via your NestJS API)
  // This component will likely need to be a client component if fetching data client-side,
  // or data can be passed as props from a server component parent.

  if (!priceData || priceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price History for Item {itemId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No price history data available for this item.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History for Item {itemId}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              allowDecimals={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              name="Price (USD)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
