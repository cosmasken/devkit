// components/WalletConnector.tsx
import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Typography,
  Box
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Login
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';

interface WalletConnectorProps {
  onWalletConnected?: (connector: any) => void;
  onWalletDisconnected?: () => void;
}

const WalletConnectorComponent: React.FC<WalletConnectorProps> = ({ 
  onWalletConnected,
  onWalletDisconnected
}) => {
  const { account, connectWallet, disconnectWallet, isConnected } = useWallet();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if MetaMask is installed
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Wallet is already connected
            await handleConnectWallet();
          }
        }
      } catch (error) {
        console.log('No existing wallet connection found');
      }
    };

    checkWalletConnection();
  }, []);

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const success = await connectWallet();
      if (success && onWalletConnected) {
        onWalletConnected(null); // Pass the connector if needed
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setAnchorEl(null);
    if (onWalletDisconnected) {
      onWalletDisconnected();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Box>
      {isConnected && account ? (
        <>
          <Button
            color="inherit"
            onClick={handleMenuOpen}
            startIcon={<AccountCircle />}
          >
            {truncateAddress(account)}
          </Button>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleDisconnectWallet}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Disconnect
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button
          color="inherit"
          onClick={handleConnectWallet}
          startIcon={<Login />}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </Box>
  );
};

export default WalletConnectorComponent;