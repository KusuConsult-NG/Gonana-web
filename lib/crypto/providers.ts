// Public RPC Providers Configuration
import { ethers } from 'ethers';

/**
 * Public RPC endpoints (free, no API key needed)
 */
export const PUBLIC_RPC_URLS = {
    ethereum: 'https://eth.llamarpc.com',
    polygon: 'https://polygon-rpc.com',
    bsc: 'https://bsc-dataseed.binance.org',
} as const;

/**
 * Network configurations
 */
export const NETWORKS = {
    ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        symbol: 'ETH',
        decimals: 18,
        explorerUrl: 'https://etherscan.io',
        rpcUrl: PUBLIC_RPC_URLS.ethereum,
    },
    polygon: {
        chainId: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        decimals: 18,
        explorerUrl: 'https://polygonscan.com',
        rpcUrl: PUBLIC_RPC_URLS.polygon,
    },
    bsc: {
        chainId: 56,
        name: 'BNB Smart Chain',
        symbol: 'BNB',
        decimals: 18,
        explorerUrl: 'https://bscscan.com',
        rpcUrl: PUBLIC_RPC_URLS.bsc,
    },
} as const;

/**
 * Token contract addresses
 */
export const TOKEN_ADDRESSES = {
    ethereum: {
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    polygon: {
        USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
    bsc: {
        USDT: '0x55d398326f99059fF775485246999027B3197955',
        USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
} as const;

/**
 * Get provider for a specific chain
 */
export function getProvider(chain: keyof typeof NETWORKS): ethers.JsonRpcProvider {
    const network = NETWORKS[chain];
    return new ethers.JsonRpcProvider(network.rpcUrl);
}

/**
 * Get all providers
 */
export function getAllProviders() {
    return {
        ethereum: getProvider('ethereum'),
        polygon: getProvider('polygon'),
        bsc: getProvider('bsc'),
    };
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(chain: keyof typeof NETWORKS, txHash: string): string {
    return `${NETWORKS[chain].explorerUrl}/tx/${txHash}`;
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(chain: keyof typeof NETWORKS, address: string): string {
    return `${NETWORKS[chain].explorerUrl}/address/${address}`;
}

/**
 * ERC20 ABI (minimal for transfers and balance checks)
 */
export const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
];
