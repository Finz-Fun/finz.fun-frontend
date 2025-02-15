"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
// import {
//   HoveredLink,
//   Menu,
//   MenuItem,
//   ProductItem,
// } from "../components/ui/navbar-menu";
// import { cn } from "../lib/utils";
// import { FaEthereum } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URI || 'http://localhost:3000';

// const coinItems = [
//   {
//     id: 1,
//     title: "Auraui Art 1",
//     imageUrl: "/image.png",
//     priceEth: 3.4,
//     priceUsd: 6652,
//     avatarUrl: "/pngwing.com.png",
//   },
//   {
//     id: 2,
//     title: "Auraui Art 2",
//     imageUrl: "/image.png",
//     priceEth: 1.4,
//     priceUsd: 2352,
//     avatarUrl: "https://ibb.co/sb9q9K7",
//   },
//   {
//     id: 3,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://ibb.co/sb9q9K7",
//   },
//   {
//     id: 4,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   },
//   {
//     id: 5,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   },
//   {
//     id: 6,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   },
//   {
//     id: 7,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   },
//   {
//     id: 8,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   },
//   {
//     id: 9,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   },
//   {
//     id: 10,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   },
//   {
//     id: 11,
//     title: "Auraui Art 3",
//     imageUrl: "/image.png",
//     priceEth: 2.4,
//     priceUsd: 4552,
//     avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   },
//   // {
//   //   id: 12,
//   //   title: "Auraui Art 3",
//   //   imageUrl: "/image.png",
//   //   priceEth: 2.4,
//   //   priceUsd: 4552,
//   //   avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
//   // },
// ];

interface Token {
  title: string;
  symbol: string;
  imageUrl: string;
  priceSol: number;
  priceUsd: number;
  avatarUrl: string;
  tokenMint: string;
}

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tokens`);
        const data = await res.json();
        setTokens(data);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTokens();
  }, []);

  return (
    <div className="min-h-screen w-full bg-primary-gradient">
      <section className="w-full pt-32 sm:pt-40 lg:pt-48">
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center lg:max-w-lg">
            <p className="text-lg font-normal text-gray-300 sm:text-xl">
              Explore a curated collection of tokenized contents
              launched by creators from X (twitter) using AI Agents!
            </p>
            
            <div className="mt-4 text-md font-light text-gray-300 sm:text-lg">
              Charts powered by{" "}
              <a 
                className="text-blue-500" 
                href="https://in.tradingview.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Tradingview
              </a>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex flex-wrap justify-center gap-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full py-12">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <p className="mt-4 text-white text-sm">Loading tokens...</p>
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-white text-center py-12">
                  No tokens available
                </div>
              ) : (
                tokens.map((item: Token, index: number) => (
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
                          alt="Token Image"
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
                          {item.priceSol.toFixed(2)} {"SOL "}
                          <span className="text-gray-200">
                            (${item.priceUsd.toFixed(2)})
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-full px-4 py-2 mt-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-transparent border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:border-gray-900 hover:bg-black hover:text-white"
                        onClick={() => router.push(`/coin?tokenMint=${item.tokenMint}`)}
                      >
                        Trade Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


