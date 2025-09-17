// components/defi/LendingWidget.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';

interface LendingWidgetProps {
  lendingPoolAddress: string;
  userAddress: string;
}

const LendingWidget: React.FC<LendingWidgetProps> = ({
  lendingPoolAddress,
  userAddress
}) => {
  const [loanInfo, setLoanInfo] = useState<any>(null);
  const [assetInfo, setAssetInfo] = useState<any>(null);
  const [collateralInfo, setCollateralInfo] = useState<any>(null);
  const [collateralAddress, setCollateralAddress] = useState<string>('');
  const [collateralId, setCollateralId] = useState<string>('');
  const [borrowAmount, setBorrowAmount] = useState<string>('');
  const [loanDuration, setLoanDuration] = useState<string>('86400'); // 1 day in seconds
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // In a real implementation, you would connect to the blockchain here
  // For this example, we'll simulate the data

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate asset info
        setAssetInfo({
          isListed: true,
          maxLTV: '7500', // 75%
          liquidationThreshold: '8000', // 80%
          minLoanAmount: '10',
          maxLoanAmount: '10000',
          interestRate: '500' // 5%
        });

        // Simulate collateral info
        setCollateralInfo({
          isListed: true,
          baseLTV: '5000', // 50%
          liquidationThreshold: '7500' // 75%
        });
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lendingPoolAddress, userAddress]);

  const handleCreateLoan = async () => {
    if (!collateralAddress || !collateralId || !borrowAmount) return;
    setLoading(true);
    try {
      // In a real implementation, you would call the smart contract here
      console.log(`Creating loan with collateral ${collateralAddress} #${collateralId}, borrowing ${borrowAmount} tokens for ${loanDuration} seconds`);
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Successfully created loan!`);
      
      // Update loan info
      setLoanInfo({
        borrower: userAddress,
        collateralId,
        collateralAddress,
        borrowedAmount: borrowAmount,
        interestRate: '500',
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000) + parseInt(loanDuration),
        isActive: true,
        isLiquidated: false
      });
    } catch (err) {
      setError('Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async () => {
    if (!loanInfo) return;
    setLoading(true);
    try {
      // In a real implementation, you would call the smart contract here
      console.log(`Repaying loan #${loanInfo.id}`);
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Successfully repaid loan!`);
      setLoanInfo(null);
    } catch (err) {
      setError('Failed to repay loan');
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidateLoan = async () => {
    if (!loanInfo) return;
    setLoading(true);
    try {
      // In a real implementation, you would call the smart contract here
      console.log(`Liquidating loan #${loanInfo.id}`);
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Successfully liquidated loan!`);
      setLoanInfo(null);
    } catch (err) {
      setError('Failed to liquidate loan');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !assetInfo) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ minWidth: 275, m: 2 }}>
        <CardContent>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 275, m: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Lending & Borrowing
        </Typography>
        
        {assetInfo && (
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Asset Information
            </Typography>
            <Typography>Max LTV: {parseInt(assetInfo.maxLTV) / 100}%</Typography>
            <Typography>Interest Rate: {parseInt(assetInfo.interestRate) / 100}%</Typography>
            <Typography>Min Loan: {assetInfo.minLoanAmount} tokens</Typography>
            <Typography>Max Loan: {assetInfo.maxLoanAmount} tokens</Typography>
          </Box>
        )}
        
        {!loanInfo ? (
          <Box>
            <TextField
              fullWidth
              label="Collateral NFT Contract Address"
              value={collateralAddress}
              onChange={(e) => setCollateralAddress(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Collateral NFT ID"
              value={collateralId}
              onChange={(e) => setCollateralId(e.target.value)}
              type="number"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Borrow Amount"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              type="number"
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Loan Duration</InputLabel>
              <Select
                value={loanDuration}
                onChange={(e) => setLoanDuration(e.target.value as string)}
              >
                <MenuItem value="3600">1 Hour</MenuItem>
                <MenuItem value="86400">1 Day</MenuItem>
                <MenuItem value="604800">1 Week</MenuItem>
                <MenuItem value="2592000">1 Month</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleCreateLoan}
              disabled={loading || !collateralAddress || !collateralId || !borrowAmount}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Create Loan'}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Active Loan
            </Typography>
            <Typography>Collateral: {loanInfo.collateralAddress} #{loanInfo.collateralId}</Typography>
            <Typography>Borrowed: {loanInfo.borrowedAmount} tokens</Typography>
            <Typography>Interest Rate: {parseInt(loanInfo.interestRate) / 100}%</Typography>
            <Typography>End Time: {new Date(loanInfo.endTime * 1000).toLocaleString()}</Typography>
            
            <Box mt={2}>
              <Button
                variant="contained"
                onClick={handleRepayLoan}
                disabled={loading}
                fullWidth
                sx={{ mb: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Repay Loan'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleLiquidateLoan}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Liquidate Loan'}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LendingWidget;