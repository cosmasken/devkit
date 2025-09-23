// Simple Voting System Example
// Demonstrates creating polls, voting on issues, and tallying results using NFTs

// Set environment to test to skip WebSocket initialization
process.env.NODE_ENV = 'test';

const { SomniaGameKit } = require('../dist/index.js');

class SimpleVoting {
  constructor() {
    this.sdk = new SomniaGameKit();
    this.player = null;
    this.polls = new Map();
    this.voteCount = 0;
  }

  async initialize() {
    console.log('🔄 Initializing Voting System...');
    
    // Initialize SDK with local network for demo
    await this.sdk.initialize({ 
      network: 'local',
      rpcUrl: 'http://localhost:8545'
    });
    
    // Create player (in a real app, this would connect to a wallet)
    this.player = this.sdk.createPlayer({ 
      username: 'Voter', 
      avatar: 'https://example.com/voter.png' 
    });
    
    console.log(`✅ Voter created: ${this.player.username}`);
  }

  async createPoll(question, options) {
    console.log(`🔄 Creating poll: ${question}...`);
    
    try {
      // Create a poll NFT to represent the voting session
      const pollNFT = await this.sdk.mintNFT(this.player.id, {
        name: `Poll: ${question.substring(0, 20)}...`,
        description: `Voting poll for: ${question}`,
        image: 'https://example.com/poll.png',
        attributes: {
          question: question,
          options: options,
          votes: {}
        }
      });
      
      // Initialize vote counts for each option
      const voteCounts = {};
      options.forEach(option => {
        voteCounts[option] = 0;
      });
      
      const pollId = `poll_${Date.now()}`;
      this.polls.set(pollId, {
        id: pollId,
        nftId: pollNFT.id,
        question: question,
        options: options,
        votes: voteCounts
      });
      
      console.log(`✅ Poll created! Poll ID: ${pollId}`);
      return pollId;
    } catch (error) {
      console.error('❌ Poll creation failed:', error.message);
    }
  }

  async vote(pollId, option) {
    const poll = this.polls.get(pollId);
    if (!poll) {
      console.log('❌ Poll not found!');
      return;
    }
    
    if (!poll.options.includes(option)) {
      console.log('❌ Invalid option!');
      return;
    }
    
    console.log(`🔄 Voting for: ${option}...`);
    
    try {
      // Record the vote as an NFT
      this.voteCount++;
      const voteNFT = await this.sdk.mintNFT(this.player.id, {
        name: `Vote #${this.voteCount}`,
        description: `Vote for "${option}" in poll: ${poll.question}`,
        image: 'https://example.com/vote.png',
        attributes: {
          pollId: pollId,
          option: option,
          timestamp: new Date().toISOString()
        }
      });
      
      // Update vote count
      poll.votes[option]++;
      
      console.log(`✅ Vote recorded! NFT ID: ${voteNFT.id}`);
      return voteNFT;
    } catch (error) {
      console.error('❌ Voting failed:', error.message);
    }
  }

  async viewResults(pollId) {
    const poll = this.polls.get(pollId);
    if (!poll) {
      console.log('❌ Poll not found!');
      return;
    }
    
    console.log('\n=== Poll Results ===');
    console.log(`Question: ${poll.question}`);
    console.log('Results:');
    
    let totalVotes = 0;
    for (const option in poll.votes) {
      totalVotes += poll.votes[option];
    }
    
    for (const option in poll.votes) {
      const count = poll.votes[option];
      const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0;
      console.log(`  ${option}: ${count} votes (${percentage}%)`);
    }
    
    console.log(`Total votes: ${totalVotes}`);
  }

  async cleanup() {
    await this.sdk.cleanup();
  }
}

// Example usage
async function runVoting() {
  const voting = new SimpleVoting();
  
  try {
    await voting.initialize();
    
    // Create a poll
    const pollId = await voting.createPoll(
      'What is your favorite programming language?',
      ['JavaScript', 'Python', 'Rust', 'Go']
    );
    
    // Cast some votes
    await voting.vote(pollId, 'JavaScript');
    await voting.vote(pollId, 'Python');
    await voting.vote(pollId, 'JavaScript');
    await voting.vote(pollId, 'Rust');
    await voting.vote(pollId, 'JavaScript');
    
    // View results
    await voting.viewResults(pollId);
    
    console.log('\n📊 Voting demo completed!');
    
  } catch (error) {
    console.error('Voting error:', error.message);
  } finally {
    await voting.cleanup();
  }
}

// Run the voting system
if (require.main === module) {
  runVoting();
}

module.exports = SimpleVoting;