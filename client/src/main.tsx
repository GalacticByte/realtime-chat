import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// Create a client to manage server state and caching (TanStack Query)
const queryClient = new QueryClient()

// Initialize the React root and attach it to the DOM element with ID 'root'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Provide the QueryClient to the entire application subtree */}
    <QueryClientProvider client={queryClient}>
      {/* The main root component of the application */}
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
