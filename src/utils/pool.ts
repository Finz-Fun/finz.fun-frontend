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
    console.error('Error fetching pool data:', error);
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
          console.error('Error processing pool update:', error);
        }
      },
      'confirmed'
    );

    return subscriptionId;
  } catch (error) {
    console.error('Error in subscribeToPoolUpdates:', error);
    throw error;
  }
};

export const unsubscribeFromPool = (
  connection: Connection,
  subscriptionId: number
) => {
  connection.removeAccountChangeListener(subscriptionId);
};