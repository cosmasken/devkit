import React, { useState } from 'react';
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
  Skeleton
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
  CheckCircle
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Mock data for games
  const games = [
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

  const handleLaunchGame = (gameId: number) => {
    setLoading(true);
    // Simulate launching game
    setTimeout(() => {
      setLoading(false);
      alert(`Game ${gameId} launched successfully!`);
    }, 1500);
  };

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
                      <Typography variant="h4">3</Typography>
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
                      <Typography variant="h4">2,137</Typography>
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
                      <Typography variant="h4">$3,650</Typography>
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
                      <Typography variant="h4">+12%</Typography>
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