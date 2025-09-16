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
  Alert
} from '@mui/material';
import {
  SportsEsports,
  People,
  EmojiEvents,
  Storage,
  AutoFixHigh,
  FlashOn
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

// Updated template data with modular system templates
const templates = [
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    description: 'A classic Tic Tac Toe game on the blockchain. Simple, fun, and fully decentralized!',
    category: 'Puzzle',
    difficulty: 'Beginner',
    players: 2,
    previewImage: '/images/tictactoe-preview.png',
    modularSupport: true,
    isTemplate: false
  },
  {
    id: '2048game',
    name: 'Crypto 2048',
    description: 'A blockchain version of the popular 2048 puzzle game. Combine tiles to reach the highest number!',
    category: 'Puzzle',
    difficulty: 'Beginner',
    players: 1,
    previewImage: '/images/2048-preview.png',
    modularSupport: true,
    isTemplate: false
  },
  {
    id: 'tetris',
    name: 'Complete Tetris',
    description: 'A fully-featured Tetris implementation with NFT pieces, token rewards, and multiplayer support. Ready to deploy!',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    players: 1,
    previewImage: '/images/tetris-preview.png',
    modularSupport: true,
    isTemplate: true
  },
  {
    id: 'chess',
    name: 'Blockchain Chess',
    description: 'A complete chess game with NFT pieces, tournament support, and advanced features.',
    category: 'Strategy',
    difficulty: 'Advanced',
    players: 2,
    previewImage: '/images/chess-preview.png',
    modularSupport: true,
    isTemplate: true
  },
  {
    id: 'battle-arena',
    name: 'Battle Arena',
    description: 'A real-time multiplayer battle game with character progression, NFT equipment, and tournaments.',
    category: 'Action',
    difficulty: 'Advanced',
    players: '2-100',
    previewImage: '/images/battle-arena-preview.png',
    modularSupport: true,
    isTemplate: true
  }
];

const TemplatesPage = () => {
  const router = useRouter();

  const handleSelectTemplate = (templateId: string) => {
    // In a real implementation, this would initialize the builder with the selected template
    router.push('/builder');
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            <SportsEsports sx={{ verticalAlign: 'middle', mr: 1 }} />
            Game Templates
          </Typography>
          <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
            Choose from our collection of easy-to-customize game templates
          </Typography>
          
          <Alert severity="info" sx={{ mb: 4 }}>
            <strong>New Modular System Available:</strong> All templates now support our plug-and-play modular system 
            for faster development and easier customization!
          </Alert>

          <Grid container spacing={4}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {template.modularSupport && (
                    <Chip 
                      icon={<AutoFixHigh />} 
                      label="Modular System" 
                      color="success" 
                      size="small" 
                      sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }} 
                    />
                  )}
                  {template.isTemplate && (
                    <Chip 
                      label="Complete Template" 
                      color="primary" 
                      size="small" 
                      sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }} 
                    />
                  )}
                  <Box sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 200, 
                        bgcolor: 'grey.300', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: 1,
                        position: 'relative'
                      }}
                    >
                      <Typography variant="h4" color="textSecondary">
                        {template.name} Preview
                      </Typography>
                      {template.modularSupport && (
                        <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                          <FlashOn sx={{ color: 'success.main' }} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {template.name}
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip 
                        icon={<People />} 
                        label={`${template.players} Player${typeof template.players === 'string' ? '' : template.players > 1 ? 's' : ''}`} 
                        size="small" 
                      />
                      <Chip 
                        icon={<EmojiEvents />} 
                        label={template.category} 
                        size="small" 
                        color="primary" 
                      />
                      <Chip 
                        label={template.difficulty} 
                        size="small" 
                        color="secondary" 
                      />
                      {template.modularSupport && (
                        <Chip 
                          icon={<AutoFixHigh />} 
                          label="Instant MVP" 
                          size="small" 
                          color="success" 
                        />
                      )}
                    </Box>
                    {template.isTemplate && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <strong>Complete Template:</strong> This template includes all game logic and is ready to deploy!
                      </Alert>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="large" 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      Use This Template
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ my: 6, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Can't find what you're looking for?
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
              Our template library is constantly growing with new games and genres
            </Typography>
            <Button variant="outlined" size="large">
              Request a Template
            </Button>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default TemplatesPage;