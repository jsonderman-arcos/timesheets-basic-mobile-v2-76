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
  maxHeight: '70vh',
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
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      position: 'relative'
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
          bgcolor: 'hsl(var(--brand-dark-500))'
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
          pb: 10 // Space for FAB
        }}
      >
        {children}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
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