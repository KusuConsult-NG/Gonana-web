"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Copy, ExternalLink, Check, Wallet, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ChainAddress {
    address: string;
    network: string;
    createdAt: string;
}

interface CryptoAddresses {
    ethereum: ChainAddress;
    polygon: ChainAddress;
    bsc: ChainAddress;
}

interface ChainSelectorProps {
    addresses?: CryptoAddresses;
    isKycVerified: boolean;
    onGenerateWallet?: () => void;
}

const CHAINS = [
    {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        color: 'bg-blue-500',
        explorerBase: 'https://etherscan.io',
    },
    {
        id: 'polygon',
        name: 'Polygon',
        symbol: 'MATIC',
        color: 'bg-purple-500',
        explorerBase: 'https://polygonscan.com',
    },
    {
        id: 'bsc',
        name: 'BNB Chain',
        symbol: 'BNB',
        color: 'bg-yellow-500',
        explorerBase: 'https://bscscan.com',
    },
];

export function ChainSelector({ addresses, isKycVerified, onGenerateWallet }: ChainSelectorProps) {
    const [selectedChain, setSelectedChain] = useState('polygon'); // Default to Polygon (cheapest)
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const currentChain = CHAINS.find(c => c.id === selectedChain)!;
    const currentAddress = addresses?.[selectedChain as keyof CryptoAddresses]?.address;

    const copyAddress = () => {
        if (!currentAddress) return;

        navigator.clipboard.writeText(currentAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // No wallet generated yet
    if (!addresses) {
        return (
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                        <Wallet className="w-8 h-8 text-gray-400" />
                    </div>

                    {!isKycVerified ? (
                        <>
                            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">
                                Complete KYC to Access Crypto Wallet
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Verify your identity to unlock multi-chain crypto deposits and withdrawals
                            </p>
                            <Link
                                href="/kyc"
                                className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Start KYC Verification
                            </Link>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">
                                Generate Your Crypto Wallet
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Get deposit addresses for Ethereum, Polygon, and BNB Chain
                            </p>
                            <button
                                onClick={onGenerateWallet}
                                className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Generate Wallet Addresses
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Info Alert */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Same address for all chains!</strong> Your Ethereum address also works for Polygon and BSC deposits.
                </div>
            </div>

            {/* Chain Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark hover:border-primary transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${currentChain.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {currentChain.symbol[0]}
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-text-light dark:text-text-dark">
                                {currentChain.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {currentChain.symbol} Network
                            </div>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xl overflow-hidden z-10">
                        {CHAINS.map((chain) => (
                            <button
                                key={chain.id}
                                onClick={() => {
                                    setSelectedChain(chain.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedChain === chain.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                                    }`}
                            >
                                <div className={`w-10 h-10 ${chain.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                    {chain.symbol[0]}
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-text-light dark:text-text-dark">
                                        {chain.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {chain.symbol} Network {chain.id === 'polygon' && '(Recommended - Low Fees)'}
                                    </div>
                                </div>
                                {selectedChain === chain.id && (
                                    <Check className="w-5 h-5 text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Address Display */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deposit Address
                </div>
                <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-text-light dark:text-text-dark break-all bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                        {currentAddress}
                    </code>
                    <button
                        onClick={copyAddress}
                        className="flex-shrink-0 p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy address"
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>
                </div>
                {copied && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Address copied to clipboard!
                    </div>
                )}
            </div>

            {/* Network Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-lg border border-border-light dark:border-border-dark">
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Network</div>
                    <div className="font-semibold text-text-light dark:text-text-dark">
                        {currentChain.name}
                    </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-lg border border-border-light dark:border-border-dark">
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Symbol</div>
                    <div className="font-semibold text-text-light dark:text-text-dark">
                        {currentChain.symbol}
                    </div>
                </div>
            </div>

            {/* Explorer Link */}
            <a
                href={`${currentChain.explorerBase}/address/${currentAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-primary hover:underline text-sm font-medium"
            >
                View on {currentChain.name} Explorer
                <ExternalLink className="w-4 h-4" />
            </a>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div className="text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>Important:</strong> Only send {currentChain.symbol}, USDT, or USDC to this address on the {currentChain.name} network. Sending other tokens or using the wrong network will result in permanent loss.
                    </div>
                </div>
            </div>
        </div>
    );
}
