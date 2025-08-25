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
  left: 'max(0px, env(safe-area-inset-left))',
  right: 'max(0px, env(safe-area-inset-right))',
  bgcolor: 'background.paper',
  borderRadius: '16px 16px 0 0',
  boxShadow: 24,
  p: 3,
  maxHeight: 'calc(70vh - env(safe-area-inset-bottom))',
  marginBottom: 'env(safe-area-inset-bottom)',
  overflow: 'auto',
};

export const Layout = ({ children, title, onBack }: LayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home />, text: "Home", action: () => navigate("/") },
    { icon: <Add />, text: "Add Details", action: () => navigate("/additional-details") },
    { icon: <Settings />, text: "Settings", action: () => {} },
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
      >
        <Slide direction="up" in={menuOpen} mountOnEnter unmountOnExit>
          <Box sx={modalStyle}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6" component="h2">
                Menu
              </Typography>
              <IconButton onClick={() => setMenuOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <List>
              {menuItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton 
                    onClick={() => {
                      item.action();
                      setMenuOpen(false);
                    }}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemIcon sx={{ color: 'primary.main' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      sx={{ color: 'text.primary' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Slide>
      </Modal>
    </Box>
  );
};