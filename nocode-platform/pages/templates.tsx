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
  Chip
} from '@mui/material';
import {
  SportsEsports,
  People,
  EmojiEvents,
  Storage
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

// Mock template data - in a real app this would come from the templates directory
const templates = [
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    description: 'A classic Tic Tac Toe game on the blockchain. Simple, fun, and fully decentralized!',
    category: 'Puzzle',
    difficulty: 'Beginner',
    players: 2,
    previewImage: '/images/tictactoe-preview.png'
  },
  {
    id: '2048game',
    name: 'Crypto 2048',
    description: 'A blockchain version of the popular 2048 puzzle game. Combine tiles to reach the highest number!',
    category: 'Puzzle',
    difficulty: 'Beginner',
    players: 1,
    previewImage: '/images/2048-preview.png'
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

          <Grid container spacing={4}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 200, 
                        bgcolor: 'grey.300', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="h4" color="textSecondary">
                        {template.name} Preview
                      </Typography>
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
                        label={`${template.players} Player${template.players > 1 ? 's' : ''}`} 
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
                    </Box>
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