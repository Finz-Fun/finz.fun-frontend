import { BN } from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { AiAgent } from '../idl/ai_agent';
import { PoolData } from '../types/trading';

const VIRTUAL_SOL = new BN(25_000_000_000); // 25 SOL in lamports
const POOL_SEED_PREFIX = "liquidity_pool";

export async function fetchPoolData(
  program: Program<AiAgent>,
  tokenMint: string
): Promise<PoolData> {
  try {
    const mint = new PublicKey(tokenMint);
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()],
      program.programId
    );

    const stateData = await program.account.liquidityPool.fetch(poolPda);
    const reserveSol = stateData.reserveSol;
    // Add virtual SOL to real SOL reserves to get mcap
    const totalSolWithVirtual = reserveSol.add(VIRTUAL_SOL);
    console.log(totalSolWithVirtual.toString())
    
    // Convert to SOL (divide by 1e9)
    const mcapInSol = parseInt(totalSolWithVirtual.toString())/ parseInt((new BN(1_000_000_000)).toString());
    console.log(mcapInSol)

    return {
      price: mcapInSol, // Price field now contains mcap in SOL
      reserveSol: parseInt(reserveSol.toString()),
      reserveToken: parseInt((stateData.reserveToken).toString())
    };
  } catch (error) {
    console.log('Error fetching pool data:', error);
    throw error;
  }
}

export const subscribeToPoolUpdates = async (
  program: Program<AiAgent>,
  tokenMint: string,
  callback: (poolData: any) => void
) => {
  try {
    // Convert string to PublicKey
    const mintPubkey = new PublicKey(tokenMint);
    
    // Get the pool address
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mintPubkey.toBuffer()],
      program.programId
    );

    console.log('Subscribing to pool:', poolPda.toString());

    // Subscribe to account changes
    const subscriptionId = program.provider.connection.onAccountChange(
      poolPda,
      async (accountInfo) => {
        console.log('Pool account changed:', accountInfo.data.toString());
        try {
          const poolData = await fetchPoolData(program, tokenMint);
          callback(poolData);
        } catch (error) {
          console.log('Error processing pool update:', error);
        }
      },
      'confirmed'
    );

    return subscriptionId;
  } catch (error) {
    console.log('Error in subscribeToPoolUpdates:', error);
    throw error;
  }
};

export const unsubscribeFromPool = (
  connection: Connection,
  subscriptionId: number
) => {
  connection.removeAccountChangeListener(subscriptionId);
};

export const subscribeToPoolTransactions = async (
  program: Program<AiAgent>,
  tokenMint: string,
  callback: (transaction: {
    type: 'BUY' | 'SELL';
    timestamp: number;
    solAmount: number;
    walletAddress: string;
    price: number;
  }) => void
) => {
  try {
    const mintPubkey = new PublicKey(tokenMint);
    
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mintPubkey.toBuffer()],
      program.programId
    );

    console.log('Subscribing to pool transactions:', poolPda.toString());

    let lastReserveSol: BN | null = null;

    const initialPoolState = await program.account.liquidityPool.fetch(poolPda);
    lastReserveSol = initialPoolState.reserveSol;


    const subscriptionId = program.provider.connection.onAccountChange(
      poolPda,
      async (accountInfo) => {
        try {

          const decodedData = program.coder.accounts.decode(
            'liquidityPool',
            accountInfo.data
          );

          const currentReserveSol = decodedData.reserveSol;

          if (lastReserveSol !== null) {
            const solDifference = currentReserveSol.sub(lastReserveSol);
            
            const signatures = await program.provider.connection.getSignaturesForAddress(
              poolPda,
              { limit: 1 },
              'confirmed'
            );

            if (signatures.length > 0) {
              const txDetails = await program.provider.connection.getTransaction(
                signatures[0].signature,
                { maxSupportedTransactionVersion: 0 }
              );

              if (txDetails) {
                const accountKeys = txDetails.transaction.message.getAccountKeys();
                const transactionType: 'BUY' | 'SELL' = solDifference.gt(new BN(0)) ? 'BUY' : 'SELL';
                
                const rawSolAmount = Math.abs(parseInt(solDifference.toString())) / 1e9;
                const solAmount = transactionType === 'SELL' ? rawSolAmount*(99/100) : rawSolAmount * (101/100);
                
                const transaction = {
                  type: transactionType,
                  timestamp: Date.now() / 1000,
                  solAmount,
                  walletAddress: accountKeys.get(0)?.toString() || 'Unknown', 
                  price: 0, 
                };
                console.log(transaction)

                callback(transaction);
              }
            }
          }

          lastReserveSol = currentReserveSol;
        } catch (error) {
          console.log('Error processing pool update:', error);
        }
      },
      'confirmed'
    );

    return subscriptionId;
  } catch (error) {
    console.log('Error in subscribeToPoolTransactions:', error);
    throw error;
  }
};

export const fetchHistoricalTransactions = async (
  program: Program<AiAgent>,
  tokenMint: string,
  limit: number = 15
) => {
  console.log('Fetching historical transactions...');
  try {
    const mintPubkey = new PublicKey(tokenMint);
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mintPubkey.toBuffer()],
      program.programId
    );

    const signatures = await program.provider.connection.getSignaturesForAddress(
      poolPda,
      { limit },
      'confirmed'
    );
    const sigs = signatures.map(sig => sig.signature)
    const transactions = await Promise.all(sigs.map(sig => program.provider.connection.getTransaction(sig,{ maxSupportedTransactionVersion: 0 })))

    console.log(transactions)

     const txs = transactions.map((txDetails) => {
        if (txDetails) {
          const accountKeys = txDetails.transaction.message.getAccountKeys();
          
          const preBalance = txDetails.meta?.preBalances[0] || 0;
          const postBalance = txDetails.meta?.postBalances[0] || 0;
          const solDifference = postBalance - preBalance;
          
          const transactionType: 'BUY' | 'SELL' = solDifference > 0 ? 'SELL' : 'BUY';
          const rawSolAmount = Math.abs(parseInt(solDifference.toString())) / 1e9;
          const solAmount = rawSolAmount;

          return {
            type: transactionType,
            timestamp: txDetails.blockTime || Date.now() / 1000,
            solAmount,
            walletAddress: accountKeys.get(0)?.toString() || 'Unknown',
            price: 0,
          };
        }
        return null;
      })

    return txs.filter((tx): tx is NonNullable<typeof tx> => tx !== null);
  } catch (error) {
    console.log('Error fetching historical transactions:', error);
    return [];
  }
};