"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  useDisconnect,
  useAppKit,
} from "@reown/appkit/react";
import { FaCopy } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";
import { LuDiamondPlus } from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const coinItems = [
  {
    id: 1,
    title: "Auraui Art 1",
    imageUrl: "/image.png",
    priceEth: 3.4,
    priceUsd: 6652,
    avatarUrl: "/pngwing.com.png",
  },
  {
    id: 2,
    title: "Auraui Art 1",
    imageUrl: "/image.png",
    priceEth: 3.4,
    priceUsd: 6652,
    avatarUrl: "/pngwing.com.png",
  },
  {
    id: 3,
    title: "Auraui Art 1",
    imageUrl: "/image.png",
    priceEth: 3.4,
    priceUsd: 6652,
    avatarUrl: "/pngwing.com.png",
  },
  {
    id: 4,
    title: "Auraui Art 1",
    imageUrl: "/image.png",
    priceEth: 3.4,
    priceUsd: 6652,
    avatarUrl: "/pngwing.com.png",
  },
  {
    id: 5,
    title: "Auraui Art 1",
    imageUrl: "/image.png",
    priceEth: 3.4,
    priceUsd: 6652,
    avatarUrl: "/pngwing.com.png",
  },
  // ... other items
];

const { open } = useAppKit();
const { disconnect } = useDisconnect();

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
  return (
    <div className="relative w-full min-h-screen bg-primary-gradient flex flex-col sm:flex-row">
      {/* Profile Section (30%) */}
      <div className="w-full sm:w-1/3 lg:w-1/4 py-16 sm:py-32 text-white flex flex-col items-center justify-between px-4 border-b sm:border-r border-gray-700 h-screen sticky top-0">
        <div className="flex flex-col items-center">
          <Image
            src="/pngwing.com.png"
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
            <p className="text-xl font-bold">John Doe</p>
          </div>
          {/* Stats Section */}
          <div className="flex flex-col sm:flex-row justify-center sm:space-x-8 mt-8">
            <div className="text-center mb-4 sm:mb-0">
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-sm text-gray-400">Tokens/Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">3500+</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-8">
            <div className="text-white">
              Your wallet: <span id="wallet-address">Bwjt...ytjo</span>
            </div>
            <div>
              <FaCopy
                className="cursor-pointer"
                onClick={() => {
                  const contractAddress = document
                    .getElementById("wallet-address")
                    ?.textContent?.trim();
                  if (contractAddress) {
                    handleCopyToClipboard(contractAddress);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <p className="text-white">
              SOL Balance: <span>80 SOL</span>
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
          onClick={() => disconnect()}
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
                {coinItems.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden transform text-white bg-[#1d1d1b] border shadow-[8px_8px_20px_rgba(0,0,0,0.4),8px_8px_20px_rgba(255,255,255,0.08)] 
                        transition-all duration-300 ease-in-out rounded-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4 hover:shadow-lg hover:-translate-y-1 group"
                  >
                    <Link
                      href="#"
                      title={item.title}
                      className="block overflow-hidden aspect-w-1 aspect-h-1"
                    >
                      <Image
                        className="object-cover w-full h-full transition-all duration-200 group-hover:scale-110"
                        src={item.imageUrl}
                        alt={item.title}
                        layout="responsive"
                        width={500}
                        height={500}
                      />
                    </Link>
                    <div className="p-4">
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
                        $AURA
                      </p>
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-200">
                          Market Cap
                        </p>
                        <p className="text-sm font-medium text-white">
                          $44K{" "}
                          <span className="text-gray-200">
                            (0.00006 USD/token)
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-full px-4 py-2 mt-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-transparent border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:border-gray-900 hover:bg-black hover:text-white"
                      >
                        <Link href={"/coin"}>Trade Now</Link>
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
