import React from 'react';
import { Layout } from '../components/Layout';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Person, 
  Settings, 
  Security, 
  Notifications, 
  Help, 
  ExitToApp,
  Edit 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const accountMenuItems = [
    { icon: <Edit />, text: "Edit Profile", action: () => console.log("Edit Profile") },
    { icon: <Security />, text: "Security Settings", action: () => console.log("Security") },
    { icon: <Notifications />, text: "Notifications", action: () => console.log("Notifications") },
    { icon: <Settings />, text: "App Preferences", action: () => console.log("Preferences") },
    { icon: <Help />, text: "Help & Support", action: () => console.log("Help") },
    { icon: <ExitToApp />, text: "Sign Out", action: () => console.log("Sign Out") },
  ];

  return (
    <Layout title="Account" onBack={handleBack}>
      <Box sx={{ p: 3 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'primary.main' 
              }}
            >
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              John Doe
            </Typography>
            <Typography variant="body2" color="text.secondary">
              john.doe@company.com
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Driver ID: #12345
            </Typography>
          </CardContent>
        </Card>

        {/* Account Menu */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {accountMenuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    component="button" 
                    onClick={item.action}
                    sx={{
                      py: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'primary.main' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  {index < accountMenuItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default Account;