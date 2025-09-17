import React, { useState } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Fab, 
  Box
} from "@mui/material";
import { 
  ArrowBack, 
  Menu as MenuIcon, 
  Home, 
  Add, 
  Settings, 
  Close,
  LocalShipping,
  Build,
  Person,
  Assignment,
  Timer,
  AttachMoney
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}


export const Layout = ({ children, title, onBack }: LayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home />, text: "Dashboard", action: () => navigate("/") },
    { icon: <LocalShipping />, text: "Convoys", action: () => navigate("/convoys") },
    { icon: <Timer />, text: "Time Tracking", action: () => navigate("/time-tracking") },
    { icon: <Assignment />, text: "Assess Damage", action: () => navigate("/assess") },
    { icon: <Build />, text: "Repairs", action: () => navigate("/repairs") },
    { icon: <AttachMoney />, text: "Expenses", action: () => navigate("/expenses") },
  ];

  return (
    <Box sx={{ 
      height: '100dvh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'var(--theme-base-background-elevations-level-4)',
      position: 'relative',
      paddingTop: 'calc(2 * env(safe-area-inset-top))',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'var(--theme-base-background-elevations-level-4)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ 
          minHeight: '64px !important', 
          px: 2,
          bgcolor: 'var(--theme-base-background-brand-dark-tone)'
        }}>
          {onBack && (
            <IconButton 
              edge="start" 
              onClick={onBack}
              sx={{ 
                mr: 1,
                color: 'var(--theme-base-primary-contrast-text)'
              }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              textAlign: 'center',
              color: 'var(--theme-base-primary-contrast-text)'
            }}
          >
            {title}
          </Typography>
          <IconButton 
            edge="end" 
            onClick={() => navigate("/account")}
            sx={{ color: 'var(--theme-base-primary-contrast-text)' }}
          >
            <Person />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box 
        component="main"
        sx={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pb: 'calc(80px + env(safe-area-inset-bottom))', // Space for FAB with safe area
          bgcolor: 'var(--theme-base-background-elevations-level-4)'
        }}
      >
        {children}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ 
          position: 'absolute', 
          bottom: 'calc(24px + env(safe-area-inset-bottom))', 
          left: 'calc(24px + env(safe-area-inset-left))',
          zIndex: 1000,
          backgroundColor: 'var(--core-lighthouse-colors-neutrals-neutral-700)',
          '&:hover': {
            backgroundColor: 'var(--core-lighthouse-colors-neutrals-neutral-700)',
            opacity: 0.9
          }
        }}
        onClick={() => setMenuOpen(true)}
      >
        <MenuIcon />
      </Fab>

      {/* Bottom Sheet Menu - positioned within container */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1200,
            }}
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'var(--core-lighthouse-colors-neutrals-gray-900)',
            borderRadius: '16px 16px 0 0',
            boxShadow: 24,
            p: 3,
            zIndex: 1300,
            transform: menuOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s ease-in-out',
          }}>
            <Box sx={{ 
              position: 'relative',
              pb: 6 // Space for close button
            }}>
              {/* Grid of menu items */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr',
                gap: 2,
                mb: 2
              }}>
                {menuItems.map((item, index) => (
                  <Box
                    key={index}
                    component="button"
                    onClick={() => {
                      item.action();
                      setMenuOpen(false);
                    }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      bgcolor: 'var(--core-lighthouse-colors-neutrals-white-alpha-42)',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'var(--core-lighthouse-colors-neutrals-white-alpha-90)',
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                        '& .menu-item-icon, & .menu-item-text': {
                          color: 'var(--theme-base-primary-main)'
                        }
                      }
                    }}
                  >
                    <Box
                      className="menu-item-icon"
                      sx={{
                        color: 'text.primary',
                        mb: 1,
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography 
                      variant="body2" 
                      className="menu-item-text"
                      sx={{
                        color: 'text.primary',
                        textAlign: 'center',
                        fontWeight: 500,
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Close button in lower left */}
              <IconButton 
                onClick={() => setMenuOpen(false)}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};
