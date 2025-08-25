import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdditionalDetails from "./pages/AdditionalDetails";
import Account from "./pages/Account";
import Convoys from "./pages/Convoys";
import TimeTracking from "./pages/TimeTracking";
import Assess from "./pages/Assess";
import Repairs from "./pages/Repairs";
import Expenses from "./pages/Expenses";

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#f59e0b',
    },
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const App = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="w-[393px] max-h-[850px] h-screen bg-background rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-gray-800 relative flex flex-col">
      {/* iPhone notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50"></div>
      
      {/* App content with proper scrolling */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <ToastContainer position="top-right" theme="dark" />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/convoys" element={<Convoys />} />
                <Route path="/time-tracking" element={<TimeTracking />} />
                <Route path="/assess" element={<Assess />} />
                <Route path="/repairs" element={<Repairs />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/additional-details" element={<AdditionalDetails />} />
                <Route path="/account" element={<Account />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </HelmetProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </div>
  </div>
);

export default App;
