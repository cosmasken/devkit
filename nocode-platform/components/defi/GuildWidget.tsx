// components/defi/GuildWidget.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Chip
} from '@mui/material';

interface GuildWidgetProps {
  guildVaultAddress: string;
  userAddress: string;
}

const GuildWidget: React.FC<GuildWidgetProps> = ({
  guildVaultAddress,
  userAddress
}) => {
  const [guildInfo, setGuildInfo] = useState<any>(null);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [memberList, setMemberList] = useState<string[]>([]);
  const [treasuryBalance, setTreasuryBalance] = useState<string>('0');
  const [proposalList, setProposalList] = useState<any[]>([]);
  const [newMemberAddress, setNewMemberAddress] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [proposalDescription, setProposalDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // In a real implementation, you would connect to the blockchain here
  // For this example, we'll simulate the data

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate guild info
        setGuildInfo({
          name: 'Somnia Champions',
          description: 'Guild for top Somnia players',
          createdAt: '1678886400',
          isActive: true
        });

        // Simulate member info
        setMemberInfo({
          isMember: true,
          joinedAt: '1678886400',
          contribution: '1000',
          isAdmin: true
        });

        // Simulate member list
        setMemberList([
          '0x1234...5678',
          '0x2345...6789',
          '0x3456...7890'
        ]);

        // Simulate treasury balance
        setTreasuryBalance('5000');

        // Simulate proposal list
        setProposalList([
          {
            id: 1,
            description: 'Increase yield farming rewards',
            proposer: '0x1234...5678',
            yesVotes: 2,
            noVotes: 1,
            executed: false,
            canceled: false
          },
          {
            id: 2,
            description: 'Add new game to guild collection',
            proposer: '0x2345...6789',
            yesVotes: 3,
            noVotes: 0,
            executed: true,
            canceled: false
          }
        ]);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guildVaultAddress, userAddress]);

  const handleAddMember = async () => {
    if (!newMemberAddress) return;
    setLoading(true);
    try {
      // In a real implementation, you would call the smart contract here
      console.log(`Adding member ${newMemberAddress} to guild`);
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Successfully added member!`);
      setNewMemberAddress('');
    } catch (err) {
      setError('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    setLoading(true);
    try {
      // In a real implementation, you would call the smart contract here
      console.log(`Depositing ${depositAmount} tokens to guild treasury`);
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Successfully deposited tokens!`);
      setDepositAmount('');
    } catch (err) {
      setError('Failed to deposit tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!proposalDescription) return;
    setLoading(true);
    try {
      // In a real implementation, you would call the smart contract here
      console.log(`Creating proposal: ${proposalDescription}`);
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Successfully created proposal!`);
      setProposalDescription('');
    } catch (err) {
      setError('Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    setLoading(true);
    try {
      // In a real implementation, you would call the smart contract here
      console.log(`Voting ${support ? 'yes' : 'no'} on proposal #${proposalId}`);
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Successfully voted on proposal!`);
    } catch (err) {
      setError('Failed to vote on proposal');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !guildInfo) {
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
          Guild Finance
        </Typography>
        
        {guildInfo && (
          <Box mb={2}>
            <Typography variant="h6">{guildInfo.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {guildInfo.description}
            </Typography>
            <Typography variant="body2">
              Treasury: {treasuryBalance} tokens
            </Typography>
          </Box>
        )}
        
        {memberInfo && (
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Your Membership
            </Typography>
            <Chip 
              label={memberInfo.isAdmin ? "Admin" : "Member"} 
              color={memberInfo.isAdmin ? "primary" : "default"} 
              sx={{ mb: 1 }}
            />
            <Typography>Your Contribution: {memberInfo.contribution} tokens</Typography>
          </Box>
        )}
        
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Members ({memberList.length})
          </Typography>
          <List>
            {memberList.map((member, index) => (
              <ListItem key={index}>
                <ListItemText primary={member} />
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Add Member
          </Typography>
          <TextField
            fullWidth
            label="Member Address"
            value={newMemberAddress}
            onChange={(e) => setNewMemberAddress(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={loading || !newMemberAddress}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Add Member'}
          </Button>
        </Box>
        
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Deposit to Treasury
          </Typography>
          <TextField
            fullWidth
            label="Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            type="number"
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleDeposit}
            disabled={loading || !depositAmount}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Deposit'}
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Create Proposal
          </Typography>
          <TextField
            fullWidth
            label="Proposal Description"
            value={proposalDescription}
            onChange={(e) => setProposalDescription(e.target.value)}
            multiline
            rows={3}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleCreateProposal}
            disabled={loading || !proposalDescription}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Create Proposal'}
          </Button>
        </Box>
        
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Proposals ({proposalList.length})
          </Typography>
          <List>
            {proposalList.map((proposal) => (
              <ListItem key={proposal.id} alignItems="flex-start" divider>
                <ListItemText
                  primary={proposal.description}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Proposed by: {proposal.proposer}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Votes: {proposal.yesVotes} yes, {proposal.noVotes} no
                      </Typography>
                      <br />
                      <Chip 
                        label={proposal.executed ? "Executed" : proposal.canceled ? "Canceled" : "Active"} 
                        size="small" 
                        color={proposal.executed ? "success" : proposal.canceled ? "error" : "warning"} 
                      />
                    </>
                  }
                />
                {!proposal.executed && !proposal.canceled && (
                  <Box>
                    <Button 
                      size="small" 
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={loading}
                    >
                      Yes
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={loading}
                    >
                      No
                    </Button>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GuildWidget;