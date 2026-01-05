import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebase-admin";
import { authenticator } from 'otplib';
import { checkWithdrawalLimits } from '@/lib/crypto/withdrawalLimits';
import { checkRateLimit } from '@/lib/rateLimit';
import { getExchangeRates } from '@/lib/crypto/exchangeRates';
import {
    getProvider,
    TOKEN_ADDRESSES,
    NETWORKS,
    ERC20_ABI,
    getExplorerUrl
} from '@/lib/crypto/providers';
import {
    decryptPrivateKeyAsync,
    getWalletFromEncrypted
} from '@/lib/crypto/walletGenerator';

export async function POST(req: Request) {
    try {
        // 0. Rate Limit
        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
        const rl = await checkRateLimit(ip, 'crypto');
        if (!rl.success) {
            return NextResponse.json({ error: rl.reason || "Too many requests" }, { status: 429 });
        }

        // 1. Authenticate
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        // 2. Parse Request
        const { toAddress, amount, currency, network, twoFactorCode } = await req.json();

        // 3. Validate Basic Inputs
        if (!toAddress || !ethers.isAddress(toAddress)) {
            return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 });
        }
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }
        if (!['ETH', 'BNB', 'MATIC', 'USDT', 'USDC'].includes(currency)) {
            return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
        }
        if (!['ethereum', 'polygon', 'bsc'].includes(network)) {
            return NextResponse.json({ error: "Unsupported network" }, { status: 400 });
        }

        // 4. Fetch User Data & Check KYC
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData || !userData.isKycVerified) {
            return NextResponse.json({ error: "KYC verification required for withdrawals" }, { status: 403 });
        }

        // 5. Verify 2FA (if enabled)
        if (userData.twoFactorEnabled) {
            if (!twoFactorCode) {
                return NextResponse.json({ error: "2FA code required" }, { status: 400 });
            }

            // Decrypt 2FA secret
            if (!userData.twoFactorSecret) {
                return NextResponse.json({ error: "2FA configuration error" }, { status: 500 });
            }

            try {
                const secret = await decryptPrivateKeyAsync(
                    userData.twoFactorSecret.encryptedData,
                    userData.twoFactorSecret.iv,
                    userData.twoFactorSecret.salt,
                    userData.twoFactorSecret.authTag,
                    userId,
                    userData.twoFactorSecret.keyVersion
                );

                const isValid = authenticator.verify({ token: twoFactorCode, secret });
                if (!isValid) {
                    return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
                }
            } catch (error) {
                console.error("2FA decryption failed:", error);
                return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
            }
        }

        // 6. Calculate USD Value & Check Limits
        const rates = await getExchangeRates();
        let amountUSD = 0;

        switch (currency) {
            case 'ETH': amountUSD = amount * rates.ETH_USD; break;
            case 'BNB': amountUSD = amount * rates.BNB_USD; break;
            case 'MATIC': amountUSD = amount * rates.MATIC_USD; break;
            case 'USDT': amountUSD = amount * rates.USDT_USD; break;
            case 'USDC': amountUSD = amount * rates.USDC_USD; break;
        }

        const limitCheck = await checkWithdrawalLimits(userId, amountUSD);
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: limitCheck.reason }, { status: 400 });
        }

        // 7. Get Wallet Private Key
        const keyDoc = await adminDb.collection('encryptedKeys').doc(userId).get();
        if (!keyDoc.exists) {
            return NextResponse.json({ error: "Wallet not initialized" }, { status: 404 });
        }

        const keyData = keyDoc.data()!;
        const provider = getProvider(network);

        // Decrypt wallet
        const wallet = await getWalletFromEncrypted(
            keyData.encryptedData,
            keyData.iv,
            keyData.salt,
            keyData.authTag,
            userId,
            provider,
            keyData.keyVersion
        );

        // 8. Execute Transaction
        let tx;
        try {
            if (currency === 'ETH' || currency === 'BNB' || currency === 'MATIC') {
                // Native Transfer
                // Check balance (including gas)
                const balance = await provider.getBalance(wallet.address);
                const value = ethers.parseEther(amount.toString());

                // Simple gas estimation fallback
                const gasEstimate = await provider.estimateGas({
                    to: toAddress,
                    value
                }).catch(() => BigInt(21000)); // Standard transfer

                const feeData = await provider.getFeeData();
                const gasPrice = feeData.gasPrice || BigInt(0);
                const cost = value + (gasEstimate * gasPrice);

                if (balance < cost) {
                    return NextResponse.json({ error: "Insufficient balance for transfer + gas" }, { status: 400 });
                }

                tx = await wallet.sendTransaction({
                    to: toAddress,
                    value
                });

            } else {
                // ERC20 Transfer
                const tokenAddress = TOKEN_ADDRESSES[network as keyof typeof TOKEN_ADDRESSES][currency as 'USDT' | 'USDC'];
                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

                const decimals = await contract.decimals();
                const value = ethers.parseUnits(amount.toString(), decimals);

                // Check token balance
                const balance = await contract.balanceOf(wallet.address);
                if (balance < value) {
                    return NextResponse.json({ error: `Insufficient ${currency} balance` }, { status: 400 });
                }

                // Check native balance for gas
                const nativeBalance = await provider.getBalance(wallet.address);
                if (nativeBalance === BigInt(0)) {
                    return NextResponse.json({ error: "Insufficient gas (native token) to send tokens" }, { status: 400 });
                }

                tx = await contract.transfer(toAddress, value);
            }
        } catch (error: any) {
            console.error("Blockchain transaction failed:", error);
            return NextResponse.json({ error: "Blockchain transaction failed: " + (error.reason || error.message) }, { status: 500 });
        }

        // 9. Log Transaction
        await adminDb.collection('cryptoTransactions').add({
            userId,
            type: 'withdrawal',
            currency,
            network,
            amount,
            amountUSD,
            fromAddress: wallet.address,
            toAddress,
            txHash: tx.hash,
            status: 'pending', // Will be confirmed by background worker or indexer
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            explorerUrl: getExplorerUrl(network, tx.hash)
        });

    } catch (error) {
        console.error("Withdrawal error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
