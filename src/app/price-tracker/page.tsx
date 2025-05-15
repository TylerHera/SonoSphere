import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PriceTrackerPage() {
  // TODO: Fetch watchlist items from backend API
  const watchlistItems = [
    { id: "1", title: "Example Vinyl 1", artist: "Artist A", currentPrice: "$25.99", targetPrice: "$20.00" },
    { id: "2", title: "Example Vinyl 2", artist: "Artist B", currentPrice: "$30.50", targetPrice: "$28.00" },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Price Tracker & Watchlist</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">My Watchlist</h2>
        {watchlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlistItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.artist}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Current Price: {item.currentPrice}</p>
                  <p>Target Price: {item.targetPrice}</p>
                  {/* TODO: Add link to item detail / price history chart */} 
                  {/* TODO: Add actions (edit/remove from watchlist) */} 
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>Your watchlist is empty. Add items to track their prices!</p>
        )}
        {/* TODO: Add form/button to add new items to watchlist */}
      </section>

      {/* Placeholder for Price History Charts - to be implemented in a dedicated component or page */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Price History (Placeholder)</h2>
        <p className="text-gray-600">
          Detailed price history charts for selected items will be displayed here or on individual item pages.
        </p>
        {/* Example of where a chart component could go */}
        {/* <PriceHistoryChart itemId="some-item-id" /> */}
      </section>
    </div>
  );
} 