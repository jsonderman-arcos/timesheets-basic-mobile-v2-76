import { ThemeProvider, createTheme, type ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdditionalDetails from "./pages/AdditionalDetails";
import Account from "./pages/Account";
import Convoys from "./pages/Convoys";
import Assess from "./pages/Assess";
import Repairs from "./pages/Repairs";
import Expenses from "./pages/Expenses";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'common.black',
          py: 4,
          px: 2,
        }}
      >
        <Box
          sx={{
            width: 393,
            maxWidth: '100%',
            height: '100vh',
            maxHeight: 850,
            bgcolor: 'background.default',
            borderRadius: '2.5rem',
            overflow: 'hidden',
            boxShadow: 12,
            border: '8px solid',
            borderColor: 'grey.900',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translate(-50%, 0)',
              width: 128,
              height: 24,
              bgcolor: 'common.black',
              borderBottomLeftRadius: '1.5rem',
              borderBottomRightRadius: '1.5rem',
              zIndex: 50,
            }}
          />

          <QueryClientProvider client={queryClient}>
            <HelmetProvider>
              <ToastContainer position="top-right" theme="dark" />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/convoys" element={<Convoys />} />
                  <Route path="/time-tracking" element={<Navigate to="/" replace />} />
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
        </Box>
      </Box>
    </LocalizationProvider>
  </ThemeProvider>
);

export default App;
