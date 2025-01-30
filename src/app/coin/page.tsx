"use client";
import { Tweet } from "react-tweet";
import { FaCopy } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { buttonVariants } from "../../components/ui/button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {Transaction, Connection} from "@solana/web3.js";
import {  useAppKitProvider } from "@reown/appkit/react";
import { Provider } from "@reown/appkit-adapter-solana/react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Suspense } from 'react';
import { subscribeToPoolUpdates, unsubscribeFromPool } from "@/utils/pool";
import { connection } from "@/config";
import { Keypair } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { AiAgent, IDL } from "@/idl/ai_agent";
import { PROGRAM_ID } from "@/config";
import { subscribeToPoolTransactions, unsubscribeFromPool as poolTransactionsUnsubscribe } from "@/utils/pool";

const API_URL = process.env.NEXT_PUBLIC_API_URI || 'http://localhost:3000';
const DUMMY_PRIVATE_KEY = process.env.NEXT_PUBLIC_DUMMY_PRIVATE_KEY as string

const TradingChart = dynamic(() => import("../../components/ui/TradingChart"), {
  ssr: false,
});

interface TokenOption {
  value: string;
  label: string;
  image: string;
}

interface OnChainTransaction {
  type: 'BUY' | 'SELL';
  timestamp: number;
  solAmount: number;
  walletAddress: string;
  price: number;
}

function CoinContent() {
  const [activeTab, setActiveTab] = useState("BUY");
  const [amount, setAmount] = useState("0.327543");
  const [selectedToken, setSelectedToken] = useState("SOL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenMint = searchParams.get("tokenMint");
  const [displayCurrency, setDisplayCurrency] = useState<"SOL" | "USD">("SOL");
  const [reserveToken, setReserveToken] = useState<number>(0);
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [isLiquidityActive, setIsLiquidityActive] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [mcap, setMcap] = useState<string>("25");
  const [transactions, setTransactions] = useState<OnChainTransaction[]>([]);
  const lastPriceRef = useRef<number | null>(null);
  const subscriptionIdRef = useRef<number | null>(null);
  const programRef = useRef<Program<AiAgent> | null>(null);
  const { walletProvider } = useAppKitProvider<Provider>('solana');

  const tokenOptions: TokenOption[] = [
    { value: "SOL", label: "SOL", image: "/pngwing.com.png" },
    { value: "USDT", label: "USDT", image: "/pngwing.com.png" },
    { value: "BTC", label: "BTC", image: "/pngwing.com.png" },
    { value: "ETH", label: "ETH", image: "/pngwing.com.png" },
  ];

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/${tokenMint}/pool-data`);
        const data = await response.json();
        setReserveToken(parseInt(new BN(data.reserveToken.toString())));
        setTokenSymbol(data.tokenSymbol);
        setTokenName(data.tokenName);
        setImageUrl(data.imageUrl);
        setIsLiquidityActive(data.isLiquidityActive || false);
        setCreatorName(data.creatorName);
        setMcap(data.mcap);
      } catch (error) {
        console.log('Error fetching pool data:', error);
      }
    };
    fetchPoolData();
  }, [tokenMint]);
  
  useEffect(() => {
    try {
      const dummyWallet = {
        publicKey: Keypair.fromSecretKey(new Uint8Array(JSON.parse(DUMMY_PRIVATE_KEY))).publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      };

      const provider = new AnchorProvider(
        connection,
        dummyWallet,
        AnchorProvider.defaultOptions()
      );
      
      const program = new Program<AiAgent>(
        IDL,
        PROGRAM_ID,
        provider
      );
      programRef.current = program;
      
      console.log('Program initialized with wallet:', dummyWallet.publicKey.toString());
    } catch (error) {
      console.log('Error initializing program:', error);
    }
  }, []);

  useEffect(() => {
    const subscribeToOnChainUpdates = async () => {
      if (!programRef.current || !tokenMint) return;

      // Cleanup any existing subscription first
      if (subscriptionIdRef.current !== null) {
        unsubscribeFromPool(connection, subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }

      try {
        const subscriptionId = await subscribeToPoolTransactions(
          programRef.current,
          tokenMint.toString(),
          (transaction) => {
            setTransactions(prev => [transaction, ...prev].slice(0, 50));
          }
        );

        subscriptionIdRef.current = subscriptionId;
      } catch (error) {
        console.log('Error subscribing to pool updates:', error);
      }
    };

    subscribeToOnChainUpdates();

    return () => {
      if (subscriptionIdRef.current !== null) {
        unsubscribeFromPool(connection, subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
    };
  }, [tokenMint]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyToClipboard = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() =>
        toast({
          title: "CA copied",
          description:
            "The contract address of this token has been copied to clipboard",
        })
      )
      .catch(() => alert("Failed to copy!"));
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getTransactionColor = (type: string) => {
    return type === 'BUY' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-primary-gradient">
      <div className="p-4 mt-52">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <img
            src="/pngwing.com.png"
            alt="Rounded Avatar"
            className="w-12 h-12 rounded-full"
          />
          <div className="flex flex-col">
            <p className="font-bold text-lg">{tokenName} (${tokenSymbol})</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">by @{creatorName}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground flex items-center">
              ca: <span id="contract-address">{tokenMint}</span>
              <FaCopy
                className="ml-2 cursor-pointer"
                onClick={() => {
                  const contractAddress = document
                    .getElementById("contract-address")
                    ?.textContent?.trim();
                  if (contractAddress) {
                    handleCopyToClipboard(contractAddress);
                  }
                }}
              />
            </p>
          </div>
          <div className="flex flex-col">
            {displayCurrency === "USD" ? <p className="text-sm">market cap: <span>${mcap}</span></p> : <p className="text-sm">market cap: <span>{mcap} </span></p>}
          </div>
          <div className="flex flex-col">
            <select
              value={displayCurrency}
              onChange={(e) =>
                setDisplayCurrency(e.target.value as "SOL" | "USD")
              }
              className="px-4 py-2 bg-[#2a2e39] text-white rounded"
            >
              <option value="SOL">SOL</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Remaining Code */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Chart and Table */}
          <div className="w-full lg:w-3/4">
            <TradingChart
              displayCurrency={displayCurrency}
              tokenMint={tokenMint as string}
              setMcap={setMcap}
            />
            <div className="mt-6">
              <Table>
                <TableCaption>The latest txs on this token.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount (SOL)</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, index) => (
                    <TableRow key={index}>
                      <TableCell className={getTransactionColor(tx.type)}>
                        {tx.type}
                      </TableCell>
                      <TableCell>◎{tx.solAmount.toFixed(4)}</TableCell>
                      <TableCell className="font-medium">
                        {formatWalletAddress(tx.walletAddress)}
                      </TableCell>
                      <TableCell>
                        {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Side Panel */}
          <div className="w-full lg:w-1/4 flex flex-col gap-4">
            <div className="h-[530px] overflow-hidden relative">
               {imageUrl && (
                   <Image 
                       src={imageUrl} 
                       alt="Token Image"
                       fill
                       sizes="(max-width: 768px) 100vw, 33vw"
                       className="object-contain object-center"
                       priority
                   />
               )}
            </div>
            <TradingPanel tokenMint={tokenMint as string} tokenSymbol={tokenSymbol} isLiquidityActive={isLiquidityActive} reserveToken={reserveToken} setIsLiquidityActive={setIsLiquidityActive} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function Coin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoinContent />
    </Suspense>
  );
}


interface TradingPanelProps {
  tokenMint: string;
  tokenSymbol: string;
  isLiquidityActive: boolean;
  reserveToken: number;
  setIsLiquidityActive: Dispatch<SetStateAction<boolean>>
}

const TradingPanel = ({ tokenMint, tokenSymbol, isLiquidityActive, reserveToken, setIsLiquidityActive }: TradingPanelProps) => {
  const [activeTab, setActiveTab] = useState("BUY");
  const [amount, setAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [estimatedSol, setEstimatedSol] = useState<string>("");
  const [transaction, setTransaction] = useState<any>(null);
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const TRADING_BACKEND_URL = process.env.NEXT_PUBLIC_TRADING_BACKEND_URL || 'http://localhost:8080';

  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com');

  

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!walletProvider?.publicKey) return;
      
      try {
        const userTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(tokenMint),
          walletProvider.publicKey
        );
        
        const tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
        setTokenBalance(Number(tokenBalance.value.amount));
      } catch (error) {
        console.log('Error fetching token balance:', error);
        setTokenBalance(0);
      }
    };
    

    fetchTokenBalance();
  }, [tokenMint,walletProvider?.publicKey,transaction]);


  const calculateSolValue = useCallback((tokenAmount: number) => {
    const VIRTUAL_SOL = 25_000_000_000;
    const PROPORTION = 1280;
    const TOTAL_SUPPLY = BigInt("1000000000000000000");
    
    try {
        const reserveTokenBig = BigInt(reserveToken);
        const tokenAmountBig = BigInt(tokenAmount);

        const bought_amount = Number(TOTAL_SUPPLY - reserveTokenBig) / 1_000_000.0 / 1_000_000_000.0 
            + VIRTUAL_SOL / 1_000_000_000.0;

        const result_amount = Number(TOTAL_SUPPLY - reserveTokenBig - tokenAmountBig) / 1_000_000.0 / 1_000_000_000.0 
            + VIRTUAL_SOL / 1_000_000_000.0;

        if (Math.abs(bought_amount - result_amount) < Number.EPSILON) {
            return "0";
        }

        const amount_out_f64 = (bought_amount * bought_amount - result_amount * result_amount) / PROPORTION * 1_000_000_000.0;

        const fees = 1.0;
        const adjusted_amount = amount_out_f64 * (1.0 - fees / 100.0);
        const amount_out = adjusted_amount/1_000_000_000

        return amount_out.toFixed(2);
    } catch (error) {
        console.log('Error calculating SOL value:', error);
        return "0";
    }
}, [reserveToken]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setAmount("");
    setActiveButton(null);
    setEstimatedSol("");
  };

  const getButtonOptions = () => {
    return activeTab === "BUY" 
      ? ["0.5", "1", "2", "5"] 
      : ["25%", "50%", "75%", "100%"];
  };

  const handleQuickBuyClick = (value: string) => {
    setActiveButton(value);
    
    if (activeTab === "SELL" && value.includes('%')) {
      const percentage = parseInt(value) / 100;
      const tokenAmount = Math.floor(tokenBalance * percentage);
      setAmount((tokenAmount/1_000_000_000).toFixed(2).toString());
      setTokenAmount(tokenAmount);
      setEstimatedSol(calculateSolValue(tokenAmount));
    } else {
      setAmount(value);
      setTokenAmount(Number(value));
      setEstimatedSol("");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    setActiveButton(null);
    
    if (activeTab === "SELL" && !isNaN(Number(newAmount))) {
      setEstimatedSol(calculateSolValue(Number(newAmount)*1_000_000_000));
    } else {
      setEstimatedSol("");
    }
  };

  const renderTokenSelector = () => {
    return <span className="text-gray-400">
        {activeTab === "SELL" ? tokenSymbol : "SOL"}
    </span>;
};

  const handleTransaction = useCallback(async () => {
    if (!walletProvider || !amount) return;

    setIsLoading(true);
    try {
      let transactionResponse;
      let liquidity = false;
      if (activeTab === "BUY" && !isLiquidityActive) {
        const confirmLiquidity = window.confirm(
          `This is the first buy for this token. 0.02 SOL will be charged from the buy amount for liquidity initialization. Do you want to continue?`
        );

        if (!confirmLiquidity) {
          setIsLoading(false);
          return;
        }
        transactionResponse = await fetch(`${API_URL}/create-add-liquidity-transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mintAddress: tokenMint,
            solAmount: amount,
            account: walletProvider.publicKey?.toBase58(),
          }),
        });
        liquidity = true;
      } else {
        const endpoint = activeTab === "BUY" 
          ? `${API_URL}/api/${tokenMint}/buy?amount=${amount}`
          : `${API_URL}/api/${tokenMint}/sell?amount=${tokenAmount}`;

        transactionResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: walletProvider.publicKey?.toBase58(),
          }),
        });
      }

      if (!transactionResponse.ok) {
        throw new Error('Failed to create transaction');
      }

      const { transaction: serializedTransaction, message } = await transactionResponse.json();
      
      const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));
      
      
      const signature = await walletProvider.sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 5,
        preflightCommitment: 'confirmed'
      });

      toast({
        title: "Transaction sent",
        description: "Confirming transaction...",
      });

      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      console.log("Transaction confirmed:", signature);
      setTransaction(signature);
      toast({
        title: "Transaction successful!",
        description: "Your transaction has been confirmed",
      });

      if (liquidity) {
        await Promise.all([
          fetch(`${API_URL}/api/${tokenMint}/add-liquidity`),
          fetch(`${TRADING_BACKEND_URL}/tokens/add?tokenMint=${tokenMint}`)
        ]);
        
        setIsLiquidityActive(true);
        toast({
          title: "Liquidity initialized!",
          description: "Pool is now active for trading",
        });
      }

    } catch (error: any) {
      console.error('Transaction error:', error);
      
      let errorMessage = 'Transaction failed';
      if (error.logs) {
        console.error('Transaction logs:', error.logs);
        errorMessage = error.logs[error.logs.length - 1] || errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [walletProvider?.publicKey, amount, activeTab, tokenMint, isLiquidityActive, tokenAmount]);

  return (
    <div className="rounded-2xl bg-[#1d1d1b] p-4 mt-9 shadow-md">
      <div className="flex mb-4 border-b border-gray-800">
        <button
          className={`pb-2 px-4 text-sm font-medium ${
            activeTab === "BUY"
              ? "text-[#4caf50] border-b-2 border-[#4caf50]"
              : "text-gray-500"
          }`}
          onClick={() => handleTabChange("BUY")}
        >
          BUY
        </button>
        <button
          className={`pb-2 px-4 text-sm font-medium ${
            activeTab === "SELL"
              ? "text-[#d93941] border-b-2 border-[#d93941]"
              : "text-gray-500"
          }`}
          onClick={() => handleTabChange("SELL")}
        >
          SELL
        </button>
      </div>
      <div className="mb-4">
        <label className="text-xs text-gray-400 mb-1 block">
          Amount {activeTab === "SELL" && `(Available: ${(tokenBalance/1_000_000_000).toFixed(2)})`}
        </label>
        <div className="bg-[#181816] rounded-lg p-2 flex justify-between items-center">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="bg-transparent text-lg outline-none w-full"
          />
          {renderTokenSelector()}
        </div>
        {estimatedSol && (
          <div className="text-xs text-gray-500 mt-1">
            ≈ {estimatedSol} SOL
          </div>
        )}
      </div>
      {getButtonOptions().length > 0 && (
        <div className="flex gap-2 mb-4">
          {getButtonOptions().map((value) => (
            <button
              key={value}
              className={`flex-1 py-1 rounded-md text-sm bg-[#181816] ${
                activeButton === value
                  ? "bg-[#3f51b5] text-white"
                  : "text-gray-400"
              } hover:bg-[#131311] hover:text-white transition-colors`}
              onClick={() => handleQuickBuyClick(value)}
            >
              {value}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={handleTransaction}
        disabled={isLoading || !walletProvider?.publicKey || !amount}
        className={`w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          activeTab === "BUY"
            ? "bg-[#4caf50] hover:bg-[#45a049] text-white"
            : "bg-[#d93941] hover:bg-[#c62828] text-white"
        } ${
          (isLoading || !walletProvider?.publicKey || !amount) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading 
          ? "Processing..." 
          : !walletProvider?.publicKey 
          ? "Connect Wallet" 
          : activeTab === "BUY" 
          ? "Buy MVP" 
          : "Sell MVP"}
      </button>
    </div>
  );
};


