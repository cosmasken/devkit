// contexts/WalletContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WalletConnector } from '@somniagames/sdk';

interface WalletContextType {
  walletConnector: WalletConnector | null;
  account: string | null;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletConnector] = useState<WalletConnector>(new WalletConnector());
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async (): Promise<boolean> => {
    try {
      const success = await walletConnector.connect();
      if (success) {
        const accountAddress = await walletConnector.getAccount();
        setAccount(accountAddress);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return false;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const value = {
    walletConnector,
    account,
    connectWallet,
    disconnectWallet,
    isConnected: !!account
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};