import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  IconButton,
  CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  Gamepad,
  Dashboard,
  Build,
  Home,
  AccountBalance,
  Savings,
  SwapHoriz,
  Groups
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import WalletConnectorComponent from './WalletConnector';
import { WalletConnector } from '@somniagames/sdk';

const drawerWidth = 240;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletConnector, setWalletConnector] = useState<WalletConnector | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleWalletConnected = (connector: WalletConnector) => {
    setWalletConnector(connector);
    // You can store the connector in a global state or context here
    console.log('Wallet connected successfully!');
  };

  const handleWalletDisconnected = () => {
    setWalletConnector(null);
    console.log('Wallet disconnected');
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main' }}>
          SomniaGames Studio
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button onClick={() => router.push('/')}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => router.push('/dashboard')} disabled={!walletConnector}>
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => router.push('/builder')} disabled={!walletConnector}>
          <ListItemIcon>
            <Build />
          </ListItemIcon>
          <ListItemText primary="Game Builder" />
        </ListItem>
        <ListItem button onClick={() => router.push('/templates')} disabled={!walletConnector}>
          <ListItemIcon>
            <Gamepad />
          </ListItemIcon>
          <ListItemText primary="Templates" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Gamepad sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SomniaGames Studio
          </Typography>
          <WalletConnectorComponent 
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={handleWalletDisconnected}
          />
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', 'sm': 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;