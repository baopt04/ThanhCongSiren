import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/queryClient";
import { AppRouter } from "./routes/AppRouter";
import { prefetchHomepageCriticalData } from "./hooks/queries/customerQueries";

function App() {
  useEffect(() => {
    // Prefetch critical data in background idle time without blocking UI render
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => prefetchHomepageCriticalData(), { timeout: 2000 });
    } else {
      setTimeout(() => prefetchHomepageCriticalData(), 300);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;