import React, { useState } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Fab, 
  Modal, 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Slide,
  Backdrop
} from "@mui/material";
import { 
  ArrowBack, 
  Menu as MenuIcon, 
  Home, 
  Add, 
  Settings, 
  Close 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  bgcolor: 'background.paper',
  borderRadius: '16px 16px 0 0',
  boxShadow: 24,
  p: 3,
  maxHeight: '50vh',
  overflow: 'auto',
  zIndex: 1300,
};

export const Layout = ({ children, title, onBack }: LayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home />, text: "Dashboard", action: () => navigate("/") },
    { icon: <Add />, text: "Convoys", action: () => navigate("/convoys") },
    { icon: <Settings />, text: "Time Tracking", action: () => navigate("/time-tracking") },
    { icon: <Home />, text: "Assess", action: () => navigate("/assess") },
    { icon: <Add />, text: "Repairs", action: () => navigate("/repairs") },
    { icon: <Settings />, text: "Expenses", action: () => navigate("/expenses") },
  ];

  return (
    <Box sx={{ 
      height: '100dvh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      position: 'relative',
      paddingTop: 'env(safe-area-inset-top)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
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
              sx={{ mr: 1, color: 'text.primary' }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              flexGrow: 1, 
              color: 'text.primary',
              fontWeight: 600
            }}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box 
        component="main"
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          pb: 'calc(80px + env(safe-area-inset-bottom))' // Space for FAB with safe area
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
          zIndex: 1000
        }}
        onClick={() => setMenuOpen(true)}
      >
        <MenuIcon />
      </Fab>

      {/* Bottom Sheet Menu */}
      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
        container={() => document.querySelector('[class*="w-[393px]"]') || document.body}
        disablePortal={true}
      >
        <Slide direction="up" in={menuOpen} mountOnEnter unmountOnExit>
          <Box sx={modalStyle}>
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
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Box sx={{ color: 'primary.main', mb: 1 }}>
                      {item.icon}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.primary',
                        textAlign: 'center',
                        fontWeight: 500
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
        </Slide>
      </Modal>
    </Box>
  );
};