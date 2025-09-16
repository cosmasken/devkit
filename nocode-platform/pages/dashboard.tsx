import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Skeleton,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Gamepad,
  People,
  AccountBalance,
  TrendingUp,
  PlayArrow,
  Edit,
  BarChart,
  Storage,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useWallet } from '../contexts/WalletContext';

const Dashboard = () => {
  const router = useRouter();
  const { isConnected, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalPlayers: 0,
    totalRevenue: 0,
    growthRate: 0
  });

  // Load games and stats when wallet is connected
  useEffect(() => {
    if (isConnected && account) {
      loadGames();
      loadStats();
    }
  }, [isConnected, account]);

  const loadGames = () => {
    // In a real implementation, this would fetch games from the blockchain
    // For now, we'll use mock data
    const mockGames = [
      {
        id: 1,
        name: 'Crypto Adventure',
        status: 'published',
        players: 1245,
        revenue: 2450,
        lastUpdated: '2 hours ago'
      },
      {
        id: 2,
        name: 'Battle Royale',
        status: 'draft',
        players: 0,
        revenue: 0,
        lastUpdated: '1 day ago'
      },
      {
        id: 3,
        name: 'Puzzle Quest',
        status: 'published',
        players: 892,
        revenue: 1200,
        lastUpdated: '5 hours ago'
      }
    ];
    setGames(mockGames);
  };

  const loadStats = () => {
    // In a real implementation, this would fetch stats from the blockchain
    // For now, we'll use mock data
    setStats({
      totalGames: 3,
      totalPlayers: 2137,
      totalRevenue: 3650,
      growthRate: 12
    });
  };

  const handleLaunchGame = (gameId: number) => {
    setLoading(true);
    // Simulate launching game
    setTimeout(() => {
      setLoading(false);
      alert(`Game ${gameId} launched successfully!`);
    }, 1500);
  };

  if (!isConnected) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Alert 
              severity="warning" 
              icon={<Warning />}
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'warning.light'
              }}
            >
              <AlertTitle>Wallet Not Connected</AlertTitle>
              Please connect your wallet to access the dashboard and manage your games.
            </Alert>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Creator Dashboard
          </Typography>
          <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
            Manage your blockchain games
          </Typography>

          {/* Wallet Info */}
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'info.light'
            }}
          >
            <AlertTitle>Connected Wallet</AlertTitle>
            Your dashboard is connected to wallet: {account}
          </Alert>

          {/* Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Gamepad />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.totalGames}</Typography>
                      <Typography color="textSecondary">Games</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.totalPlayers.toLocaleString()}</Typography>
                      <Typography color="textSecondary">Players</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                      <AccountBalance />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">${stats.totalRevenue.toLocaleString()}</Typography>
                      <Typography color="textSecondary">Revenue</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">+{stats.growthRate}%</Typography>
                      <Typography color="textSecondary">Growth</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Games List */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4">Your Games</Typography>
              <Button 
                variant="contained" 
                onClick={() => router.push('/builder')}
                startIcon={<Gamepad />}
              >
                Create New Game
              </Button>
            </Box>
            
            {games.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  You haven't created any games yet
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  Get started by creating your first blockchain game
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => router.push('/builder')}
                  startIcon={<Gamepad />}
                >
                  Create Your First Game
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {games.map((game) => (
                  <Grid item xs={12} md={4} key={game.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h3">
                            {game.name}
                          </Typography>
                          <Chip 
                            label={game.status} 
                            color={game.status === 'published' ? 'success' : 'default'} 
                            size="small"
                            icon={game.status === 'published' ? <CheckCircle /> : undefined}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <People sx={{ mr: 1, fontSize: '1rem' }} />
                            <Typography variant="body2">
                              {game.players.toLocaleString()} players
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccountBalance sx={{ mr: 1, fontSize: '1rem' }} />
                            <Typography variant="body2">
                              ${game.revenue} revenue
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Storage sx={{ mr: 1, fontSize: '1rem' }} />
                            <Typography variant="body2" color="textSecondary">
                              {game.lastUpdated}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'space-between' }}>
                        <Button 
                          size="small" 
                          startIcon={<Edit />}
                          onClick={() => router.push('/builder')}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={16} /> : <PlayArrow />}
                          onClick={() => handleLaunchGame(game.id)}
                          disabled={loading}
                        >
                          {loading ? 'Launching...' : 'Launch'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Analytics */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChart sx={{ mr: 1 }} />
                Game Analytics
              </Typography>
              <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography color="textSecondary">
                  Analytics dashboard would appear here in a full implementation
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Layout>
  );
};

export default Dashboard;