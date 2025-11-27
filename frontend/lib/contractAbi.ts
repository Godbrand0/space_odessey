/**
 * Contract configuration for SpaceInvadersGame Celo contract
 */
export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xc41fB0C3b04D71d93352fBb0A5E7BedCD2844970',
  network: process.env.NEXT_PUBLIC_NETWORK || 'celo-sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia-forno.celo-testnet.org',
};

/**
 * Contract ABI
 */
export const CONTRACT_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "ALIENS_PER_ROW",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "LEVEL_DURATION",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_LEVELS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "REWARD_PER_LEVEL",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "abandonGame",
    "inputs": [
      {
        "name": "sessionId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimRewards",
    "inputs": [
      {
        "name": "sessionId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "completeLevel",
    "inputs": [
      {
        "name": "sessionId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "level",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "score",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "aliensDestroyed",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "proof",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "fundContract",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "gameSessions",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "sessionId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "currentLevel",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "levelsCompleted",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalRewardsEarned",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "levelStartTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isActive",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "isCompleted",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAlienCountForLevel",
    "inputs": [
      {
        "name": "level",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "getContractBalance",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLevelTimeRemaining",
    "inputs": [
      {
        "name": "sessionId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayerSessions",
    "inputs": [
      {
        "name": "player",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayerTotalRewards",
    "inputs": [
      {
        "name": "player",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSessionInfo",
    "inputs": [
      {
        "name": "sessionId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "player",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "currentLevel",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "levelsCompleted",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalRewardsEarned",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isActive",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "isCompleted",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "levelHashUsed",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "playerSessions",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "playerTotalRewards",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "startGame",
    "inputs": [],
    "outputs": [
      {
        "name": "sessionId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

/**
 * Contract function names
 */
export const CONTRACT_FUNCTIONS = {
  // Entry functions
  START_GAME: 'startGame',
  COMPLETE_LEVEL: 'completeLevel',
  ABANDON_GAME: 'abandonGame',
  CLAIM_REWARDS: 'claimRewards',
  FUND_CONTRACT: 'fundContract',
  
  // View functions
  GET_SESSION_INFO: 'getSessionInfo',
  GET_CONTRACT_BALANCE: 'getContractBalance',
  GET_ALIEN_COUNT_FOR_LEVEL: 'getAlienCountForLevel',
  GET_PLAYER_SESSIONS: 'getPlayerSessions',
  GET_PLAYER_TOTAL_REWARDS: 'getPlayerTotalRewards',
  GET_LEVEL_TIME_REMAINING: 'getLevelTimeRemaining',
  
  // Constants
  ALIENS_PER_ROW: 'ALIENS_PER_ROW',
  LEVEL_DURATION: 'LEVEL_DURATION',
  MAX_LEVELS: 'MAX_LEVELS',
  REWARD_PER_LEVEL: 'REWARD_PER_LEVEL',
};

/**
 * Game session info interface
 */
export interface GameSessionInfo {
  player: string;
  currentLevel: number;
  levelsCompleted: number;
  totalRewardsEarned: number;
  startTime: number;
  isActive: boolean;
  isCompleted: boolean;
}

/**
 * Parse session info from contract response
 */
export function parseSessionInfo(data: any): GameSessionInfo | null {
  if (!data || data.length < 7) return null;
  
  return {
    player: data[0],
    currentLevel: Number(data[1]),
    levelsCompleted: Number(data[2]),
    totalRewardsEarned: Number(data[3]),
    startTime: Number(data[4]),
    isActive: Boolean(data[5]),
    isCompleted: Boolean(data[6]),
  };
}

/**
 * Format CELO amount (from wei to CELO)
 */
export function formatCELO(amount: number | bigint): string {
  const celoAmount = Number(amount) / 1e18;
  return celoAmount.toFixed(6);
}

/**
 * Convert CELO to wei
 */
export function celoToWei(celoAmount: number): bigint {
  return BigInt(Math.floor(celoAmount * 1e18));
}

/**
 * Get alien count for level (from contract logic)
 */
export function getAlienCountForLevel(level: number): number {
  return 11 * level;
}

/**
 * Calculate level duration in seconds (default 5 minutes)
 */
export const LEVEL_DURATION_SECONDS = 300; // 5 minutes

/**
 * Game constants from contract
 */
export const MAX_LEVELS = 5; // Default value, should be fetched from contract
export const REWARD_PER_LEVEL = 1; // 1 CELO per level, should be fetched from contract

/**
 * Calculate time remaining for a level
 */
export function calculateTimeRemaining(levelStartTime: number): number {
  const elapsed = Math.floor(Date.now() / 1000) - levelStartTime;
  return Math.max(0, LEVEL_DURATION_SECONDS - elapsed);
}
