import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Avatar,
  Chip,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  SportsEsports,
  Speed,
  Security,
  EmojiEvents,
  ShoppingCart,
  Storage,
  Code,
  Warning
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useWallet } from '../contexts/WalletContext';

const Home = () => {
  const router = useRouter();
  const { isConnected, account, connectWallet } = useWallet();

  const handleStartBuilding = () => {
    if (isConnected) {
      router.push('/builder');
    } else {
      // Show instruction to connect wallet
      alert('Please connect your wallet first by clicking the "Connect Wallet" button in the top right corner');
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
            SomniaGames Studio
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 300, color: 'text.secondary' }}>
            No-Code Blockchain Game Builder
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: '700px', mx: 'auto', color: 'text.secondary' }}>
            Create, deploy, and monetize blockchain games without writing a single line of code. 
            Powered by Somnia Network&apos;s 1.05M TPS performance.
          </Typography>
          
          {!isConnected && (
            <Alert 
              severity="info" 
              icon={<Warning />}
              sx={{ 
                mb: 3, 
                maxWidth: '600px', 
                mx: 'auto',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.light'
              }}
            >
              <AlertTitle>Connect Your Wallet</AlertTitle>
              To get started, please connect your wallet by clicking the "Connect Wallet" button 
              in the top right corner. This will enable you to create and deploy games on the blockchain.
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleStartBuilding}
            sx={{ 
              mt: 2, 
              py: 1.5, 
              px: 4, 
              fontSize: '1.1rem'
            }}
          >
            Start Building
          </Button>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ my: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
                  <SportsEsports />
                </Avatar>
                <Typography gutterBottom variant="h5" component="h3">
                  Game Templates
                </Typography>
                <Typography>
                  Choose from dozens of professionally designed game templates. 
                  Customize colors, characters, and mechanics with our intuitive editor.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => isConnected ? router.push('/templates') : alert('Please connect your wallet first')}
                  disabled={!isConnected}
                >
                  Explore Templates
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mb: 2 }}>
                  <Speed />
                </Avatar>
                <Typography gutterBottom variant="h5" component="h3">
                  Lightning Fast
                </Typography>
                <Typography>
                  Built on Somnia Network with 1.05M TPS and sub-second finality. 
                  Your games respond instantly to player actions.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Learn Performance</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56, mb: 2 }}>
                  <Security />
                </Avatar>
                <Typography gutterBottom variant="h5" component="h3">
                  Fully Secure
                </Typography>
                <Typography>
                  Enterprise-grade security with audited smart contracts. 
                  Your games and player assets are protected by blockchain technology.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">View Security</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* How It Works */}
        <Box sx={{ my: 8 }}>
          <Typography variant="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip icon={<Code />} label="Step 1" color="primary" size="medium" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>Choose Template</Typography>
                <Typography>Select from dozens of game templates</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip icon={<Storage />} label="Step 2" color="primary" size="medium" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>Customize</Typography>
                <Typography>Personalize with drag-and-drop editor</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip icon={<EmojiEvents />} label="Step 3" color="primary" size="medium" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>Add Economy</Typography>
                <Typography>Configure tokens, NFTs, and marketplace</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip icon={<ShoppingCart />} label="Step 4" color="primary" size="medium" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>Publish</Typography>
                <Typography>Deploy to blockchain with one click</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ my: 8, textAlign: 'center', py: 6, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h3" gutterBottom>
            Ready to Create Your Game?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: '600px', mx: 'auto', color: 'text.secondary' }}>
            Join thousands of creators building the future of blockchain gaming
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleStartBuilding}
            sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
          >
            Start Building for Free
          </Button>
        </Box>
      </Container>
    </Layout>
  );
};

export default Home;