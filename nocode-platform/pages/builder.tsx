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
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Alert,
  Snackbar,
  AlertTitle
} from '@mui/material';
import {
  ArrowBack,
  Save,
  PlayArrow,
  Publish,
  Gamepad,
  Palette,
  AttachMoney,
  People,
  EmojiEvents,
  ShoppingCart,
  Storage,
  Code,
  Check,
  SportsEsports,
  AutoFixHigh,
  FlashOn,
  Warning
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useWallet } from '../contexts/WalletContext';

const GameBuilder = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [gameData, setGameData] = useState({
    name: '',
    description: '',
    genre: 'adventure',
    theme: 'light',
    currency: 'SGT',
    maxPlayers: 1000,
    enableMultiplayer: true,
    enableLeaderboards: true,
    enableMarketplace: true,
    enableAchievements: true,
    useModularSystem: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const { isConnected, account } = useWallet();

  const steps = [
    'Choose Template',
    'Basic Info',
    'Design',
    'Economy',
    'Features',
    'Publish'
  ];

  // Mock template data with modular system support
  const templates = [
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: 'A classic Tic Tac Toe game on the blockchain. Simple, fun, and fully decentralized!',
      category: 'Puzzle',
      difficulty: 'Beginner',
      players: 2,
      modularSupport: true
    },
    {
      id: '2048game',
      name: 'Crypto 2048',
      description: 'A blockchain version of the popular 2048 puzzle game. Combine tiles to reach the highest number!',
      category: 'Puzzle',
      difficulty: 'Beginner',
      players: 1,
      modularSupport: true
    },
    {
      id: 'tetris',
      name: 'Tetris Template',
      description: 'A complete Tetris implementation with NFT pieces and token rewards. Ready to deploy!',
      category: 'Puzzle',
      difficulty: 'Intermediate',
      players: 1,
      modularSupport: true,
      isTemplate: true
    },
    {
      id: 'chess',
      name: 'Chess Template',
      description: 'A fully-featured chess game with NFT pieces and tournament support.',
      category: 'Strategy',
      difficulty: 'Advanced',
      players: 2,
      modularSupport: true,
      isTemplate: true
    }
  ];

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
              <AlertTitle>Wallet Required</AlertTitle>
              Please connect your wallet to access the game builder and create games.
            </Alert>
          </Box>
        </Container>
      </Layout>
    );
  }

  const handleNext = () => {
    // Validate template selection on first step
    if (activeStep === 0 && !selectedTemplate) {
      setSnackbar({ open: true, message: 'Please select a template or choose to start from scratch', severity: 'warning' });
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setGameData({
      ...gameData,
      [field]: value
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Template Selection
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Choose a Game Template
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Select a template to get started quickly, or build from scratch.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={gameData.useModularSystem} 
                    onChange={(e) => handleInputChange('useModularSystem', e.target.checked)} 
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AutoFixHigh sx={{ mr: 1 }} />
                    Use Modular System (Recommended - Easier & Faster)
                  </Box>
                }
              />
            </Grid>
            {templates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    border: selectedTemplate === template.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: 3
                    },
                    position: 'relative'
                  }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {template.modularSupport && gameData.useModularSystem && (
                    <Chip 
                      label="Modular" 
                      color="success" 
                      size="small" 
                      sx={{ position: 'absolute', top: 8, right: 8 }} 
                    />
                  )}
                  {template.isTemplate && (
                    <Chip 
                      label="Template" 
                      color="primary" 
                      size="small" 
                      sx={{ position: 'absolute', top: 8, left: 8 }} 
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {template.name}
                    </Typography>
                    <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${template.players} Player${template.players > 1 ? 's' : ''}`} 
                        size="small" 
                      />
                      <Chip 
                        label={template.category} 
                        size="small" 
                        color="primary" 
                      />
                      <Chip 
                        label={template.difficulty} 
                        size="small" 
                        color="secondary" 
                      />
                      {template.modularSupport && gameData.useModularSystem && (
                        <Chip 
                          icon={<FlashOn />} 
                          label="Instant MVP" 
                          size="small" 
                          color="success" 
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  border: selectedTemplate === 'scratch' ? '2px solid #1976d2' : '1px dashed #e0e0e0',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
                onClick={() => setSelectedTemplate('scratch')}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                    Start from Scratch
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Build a custom game with full control over all features
                  </Typography>
                  {gameData.useModularSystem && (
                    <Chip 
                      icon={<AutoFixHigh />} 
                      label="Modular System Available" 
                      size="small" 
                      color="info" 
                      sx={{ mt: 2 }} 
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Game Name"
                value={gameData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                helperText="Give your game a memorable name"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Game Description"
                value={gameData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                helperText="Describe your game in a few sentences"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={gameData.genre}
                  label="Genre"
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                >
                  <MenuItem value="adventure">Adventure</MenuItem>
                  <MenuItem value="strategy">Strategy</MenuItem>
                  <MenuItem value="puzzle">Puzzle</MenuItem>
                  <MenuItem value="rpg">RPG</MenuItem>
                  <MenuItem value="arcade">Arcade</MenuItem>
                  <MenuItem value="simulation">Simulation</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="racing">Racing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Players"
                value={gameData.maxPlayers}
                onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value) || 0)}
                helperText="Maximum concurrent players"
                InputProps={{ inputProps: { min: 1, max: 10000 } }}
              />
            </Grid>
            {gameData.useModularSystem && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <strong>Modular System Enabled:</strong> Your game will be created using the new plug-and-play system. 
                  This provides instant MVP capabilities with pre-configured features.
                </Alert>
              </Grid>
            )}
          </Grid>
        );
      case 2: // Design step
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Theme</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Chip 
                  icon={<Palette />} 
                  label="Light" 
                  variant={gameData.theme === 'light' ? 'filled' : 'outlined'} 
                  onClick={() => handleInputChange('theme', 'light')}
                  sx={{ minWidth: 100 }}
                />
                <Chip 
                  icon={<Palette />} 
                  label="Dark" 
                  variant={gameData.theme === 'dark' ? 'filled' : 'outlined'} 
                  onClick={() => handleInputChange('theme', 'dark')}
                  sx={{ minWidth: 100 }}
                />
                <Chip 
                  icon={<Palette />} 
                  label="Colorful" 
                  variant={gameData.theme === 'colorful' ? 'filled' : 'outlined'} 
                  onClick={() => handleInputChange('theme', 'colorful')}
                  sx={{ minWidth: 100 }}
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>Colors</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#61dafb' }} />
                <Avatar sx={{ bgcolor: '#ff4081' }} />
                <Avatar sx={{ bgcolor: '#7c4dff' }} />
                <Avatar sx={{ bgcolor: '#00c853' }} />
                <Avatar sx={{ bgcolor: '#ffab00' }} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              <Paper sx={{ p: 2, bgcolor: gameData.theme === 'dark' ? '#333' : gameData.theme === 'colorful' ? '#ffeb3b' : '#fff' }}>
                <Typography variant="h5">{gameData.name || 'Game Preview'}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {gameData.description || 'Your game description will appear here'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );
      case 3: // Economy step
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Currency System</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<AttachMoney />} 
                  label="SGT Tokens" 
                  variant={gameData.currency === 'SGT' ? 'filled' : 'outlined'} 
                  onClick={() => handleInputChange('currency', 'SGT')}
                  color={gameData.currency === 'SGT' ? 'primary' : 'default'}
                />
                <Chip 
                  icon={<AttachMoney />} 
                  label="Custom Token" 
                  variant={gameData.currency === 'custom' ? 'filled' : 'outlined'} 
                  onClick={() => handleInputChange('currency', 'custom')}
                  color={gameData.currency === 'custom' ? 'primary' : 'default'}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Storage sx={{ verticalAlign: 'middle', mr: 1 }} />
                    NFT Assets
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Create unique in-game items as NFTs
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="Weapons" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Armor" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Characters" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Pets" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="+ Add More" size="small" variant="outlined" />
                  </Box>
                  {gameData.useModularSystem && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Modular System: NFT assets will be automatically configured with rarity levels and metadata
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ShoppingCart sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Marketplace
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Enable player-to-player trading
                  </Typography>
                  <Chip 
                    icon={<Check />} 
                    label={gameData.enableMarketplace ? 'Enabled' : 'Disabled'} 
                    color={gameData.enableMarketplace ? 'success' : 'default'} 
                  />
                  {gameData.useModularSystem && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Modular System: Marketplace module will be automatically integrated
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 4: // Features step
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <People sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Multiplayer
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={gameData.enableMultiplayer} 
                        onChange={(e) => handleInputChange('enableMultiplayer', e.target.checked)} 
                      />
                    }
                    label={`Enable real-time multiplayer with up to ${gameData.maxPlayers} players`}
                  />
                  {gameData.useModularSystem && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Modular System: Real-time WebSocket integration included automatically
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <EmojiEvents sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Leaderboards
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={gameData.enableLeaderboards} 
                        onChange={(e) => handleInputChange('enableLeaderboards', e.target.checked)} 
                      />
                    }
                    label="Add competitive leaderboards for player engagement"
                  />
                  {gameData.useModularSystem && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Modular System: Leaderboard module available as plug-in
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Code sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Achievements
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={gameData.enableAchievements} 
                        onChange={(e) => handleInputChange('enableAchievements', e.target.checked)} 
                      />
                    }
                    label="Create badges and rewards for player milestones"
                  />
                  {gameData.useModularSystem && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Modular System: Achievement module available as plug-in
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 5: // Publish step
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    <Check sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Review Your Game
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6">{gameData.name}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {gameData.description}
                  </Typography>
                  {selectedTemplate && selectedTemplate !== 'scratch' && (
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        icon={<SportsEsports />} 
                        label={`Template: ${templates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}`} 
                        color="primary" 
                        sx={{ mb: 1 }} 
                      />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={`Genre: ${gameData.genre}`} size="small" />
                    <Chip label={`Theme: ${gameData.theme}`} size="small" />
                    <Chip label={`Currency: ${gameData.currency}`} size="small" />
                    <Chip label={`Max Players: ${gameData.maxPlayers}`} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      label={gameData.enableMultiplayer ? 'Multiplayer: ON' : 'Multiplayer: OFF'} 
                      size="small" 
                      color={gameData.enableMultiplayer ? 'success' : 'default'} 
                    />
                    <Chip 
                      label={gameData.enableLeaderboards ? 'Leaderboards: ON' : 'Leaderboards: OFF'} 
                      size="small" 
                      color={gameData.enableLeaderboards ? 'success' : 'default'} 
                    />
                    <Chip 
                      label={gameData.enableMarketplace ? 'Marketplace: ON' : 'Marketplace: OFF'} 
                      size="small" 
                      color={gameData.enableMarketplace ? 'success' : 'default'} 
                    />
                    <Chip 
                      label={gameData.enableAchievements ? 'Achievements: ON' : 'Achievements: OFF'} 
                      size="small" 
                      color={gameData.enableAchievements ? 'success' : 'default'} 
                    />
                    <Chip 
                      icon={<AutoFixHigh />} 
                      label={gameData.useModularSystem ? 'Modular System: ON' : 'Modular System: OFF'} 
                      size="small" 
                      color={gameData.useModularSystem ? 'success' : 'default'} 
                    />
                  </Box>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 2 }}>
                    Your game will be deployed to the Somnia Network with enterprise-grade security
                    and 1.05M TPS performance.
                  </Typography>
                  {gameData.useModularSystem && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <strong>Modular System Benefits:</strong>
                      <ul>
                        <li>Instant MVP with pre-configured templates</li>
                        <li>Plug-and-play feature modules</li>
                        <li>Faster deployment (under 5 minutes)</li>
                        <li>Automatic contract management</li>
                        <li>Real-time WebSocket integration</li>
                      </ul>
                    </Alert>
                  )}
                  
                  <Alert 
                    severity="info" 
                    sx={{ mt: 2, borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}
                  >
                    <AlertTitle>Deployment Information</AlertTitle>
                    Your game will be deployed using your connected wallet ({account}). 
                    You will need to confirm transactions in your wallet to complete the deployment.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            <Gamepad sx={{ verticalAlign: 'middle', mr: 1 }} />
            Game Builder
          </Typography>
          <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
            Create your blockchain game in 5 simple steps
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: 3, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            <Box>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<Save />}
                >
                  Save & Continue
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<Publish />}
                  onClick={() => setSnackbar({ open: true, message: 'Game published successfully to Somnia Network!', severity: 'success' })}
                >
                  Publish to Blockchain
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default GameBuilder;