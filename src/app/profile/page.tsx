"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  useDisconnect,
  useAppKit,
  useAppKitProvider,
} from "@reown/appkit/react";
import { Provider } from "@reown/appkit-adapter-solana/react";
import { FaCopy } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";
import { LuDiamondPlus } from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Connection } from "@solana/web3.js";


const API_URL = process.env.NEXT_PUBLIC_API_URI || 'http://localhost:3000';

interface Token {
  title: string;
  symbol: string;
  imageUrl: string;
  priceSol: number;
  priceUsd: number;
  avatarUrl: string;
  tokenMint: string;
}

const handleCopyToClipboard = (value: string) => {
  navigator.clipboard
    .writeText(value)
    .then(() =>
      toast({
        title: "Wallet address copied",
        description: "The address of your wallet has been copied to clipboard",
      })
    )
    .catch(() => alert("Failed to copy!"));
};

export default function Profile() {
  const router = useRouter()
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const [tokens, setTokens] = useState<Token[]>([]);
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const session = useSession()
  const [balance, setBalance] = useState<number>(0);
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com");

  useEffect(() => {
    const getBalance = async () => {
      if (walletProvider?.publicKey) {
        try {
          const balance = await connection.getBalance(walletProvider.publicKey);
          // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
          setBalance(balance / 1000000000);
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(0);
        }
      }
    };

    getBalance();
    // Set up an interval to refresh the balance periodically
    const intervalId = setInterval(getBalance, 30000); // Updates every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [walletProvider?.publicKey, connection]);
  useEffect(() => {
    const fetchTokens = async () => {
      if(session?.data?.user){
        // @ts-ignore
        const res = await fetch(`${API_URL}/api/tokens/creator/${session?.data?.user?.twitterId}`);
        const data = await res.json();
        setTokens(data);
      }
    };
    fetchTokens();
  }, []);
  return (
    <div className="relative w-full min-h-screen bg-primary-gradient flex flex-col sm:flex-row">
      {/* Profile Section (30%) */}
      <div className="w-full sm:w-1/3 lg:w-1/4 py-16 sm:py-32 text-white flex flex-col items-center justify-between px-4 border-b sm:border-r border-gray-700 h-screen sticky top-0">
        <div className="flex flex-col items-center">
          <Image
            // @ts-ignore
            src={session?.data?.user?.profileImage}
            alt="Profile"
            width={150}
            height={150}
            className="rounded-full border-4 border-gray-500"
          />
          <div className="flex items-center space-x-4 mt-4">
            <Image
              src="/pngwing.com.png" // Replace with your image URL
              alt="Profile Icon"
              width={40}
              height={40}
              className="rounded-full"
            />
            <p className="text-xl font-bold">{session?.data?.user?.name}</p>
          </div>
          {/* Stats Section */}
          <div className="flex flex-col sm:flex-row justify-center sm:space-x-8 mt-8">
            <div className="text-center mb-4 sm:mb-0">
              <p className="text-2xl font-bold text-white">{tokens.length}</p>
              <p className="text-sm text-gray-400">Tokens/Posts</p>
            </div>
            {/* <div className="text-center">
              <p className="text-2xl font-bold text-white"></p>
              <p className="text-sm text-gray-400">Followers</p>
            </div> */}
          </div>
          <div className="flex items-center space-x-2 mt-8">
            {walletProvider?.publicKey && <div className="text-white">
              Your wallet: <span id="wallet-address">
                {walletProvider.publicKey.toString().slice(0, 4)}...
                {walletProvider.publicKey.toString().slice(-4)}
              </span>
            </div>}
            <div>
              <FaCopy
                className="cursor-pointer"
                onClick={() => {
                  handleCopyToClipboard(walletProvider?.publicKey?.toString() || "")
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <p className="text-white">
              SOL Balance: <span>{balance.toFixed(2).toString()} SOL</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LuDiamondPlus
                      className="ml-2 cursor-pointer"
                      onClick={() => {
                        open({ view: "OnRampProviders" });
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Buy SOL</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
          </div>
        </div>
        <button
          className="text-sm font-medium text-red-500 hover:underline mt-8"
          onClick={() =>{ 
            disconnect()
            router.push("/")
          }
        }
        >
          Logout
        </button>
      </div>

      {/* Collections Section (70%) */}
      <div className="w-full sm:w-2/3 lg:w-3/4 px-6 pt-16 sm:pt-48 py-12 overflow-y-auto">
        <section className="relative">
          <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto text-center lg:max-w-lg">
              <p className="my-8 text-lg font-normal text-gray-300 sm:text-xl">
                Explore a curated collection of tokenized contents launched by
                creators from X (twitter) using AI Agents!
              </p>
            </div>

            <div className="mt-12">
              <div className="flex flex-wrap justify-center gap-6">
                {tokens.map((item: Token, index) => (
                  <div
                    key={`${item.tokenMint}-${index}`}
                    className="overflow-hidden transform text-white bg-[#1d1d1b] border shadow-[8px_8px_20px_rgba(0,0,0,0.4),8px_8px_20px_rgba(255,255,255,0.08)] 
                    transition-all duration-300 ease-in-out rounded-md w-[280px] h-[360px] hover:shadow-lg hover:-translate-y-1 group flex flex-col"
                  >
                    <div className="relative w-full h-[200px]">
                      <Link
                        href="#"
                        title={item.title}
                        className="absolute inset-0"
                      >
                        <Image
                          className="object-contain w-full h-full transition-all duration-200 group-hover:scale-110"
                          src={item.imageUrl}
                          alt="token image"
                          fill
                          sizes="280px"
                        />
                      </Link>
                    </div>
                    <div className="p-3 flex-grow">
                      <div className="flex items-center justify-between space-x-6">
                        <p className="flex-1 text-base text-white font-bold">
                          <Link href="#" title={item.title}>
                            {item.title}
                          </Link>
                        </p>

                        <Link
                          href="#"
                          title="Avatar"
                          className="relative inline-flex items-center justify-center shrink-0 w-7 h-7"
                        >
                          <div className="absolute inset-0">
                            <Image
                              className="w-full h-full object-cover"
                              src={item.avatarUrl}
                              alt="Avatar"
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        </Link>
                      </div>
                      <p className="flex-1 text-base font-normal text-white">
                        ${item.symbol}
                      </p>
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-200">
                          Market Cap
                        </p>
                        <p className="text-sm font-medium text-white">
                          ${item.priceSol.toFixed(2)} SOL{" "}
                          <span className="text-gray-200">
                            (${item.priceUsd.toFixed(2)} USD)
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/coin?tokenMint=${item.tokenMint}`)
                        }}
                        className="inline-flex items-center justify-center w-full px-4 py-2 mt-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-transparent border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:border-gray-900 hover:bg-black hover:text-white"
                      >
                        Trade Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
