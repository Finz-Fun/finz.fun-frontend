"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import {
  HoveredLink,
  Menu,
  MenuItem,
  ProductItem,
} from "./components/ui/navbar-menu";
import { cn } from "./lib/utils";
import { FaEthereum } from "react-icons/fa";

const coinItems = [
  {
    id: 1,
    title: "Auraui Art 1",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft16.jpeg",
    priceEth: 3.4,
    priceUsd: 6652,
    avatarUrl: "/pngwing.com.png",
  },
  {
    id: 2,
    title: "Auraui Art 2",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft17.jpeg",
    priceEth: 1.4,
    priceUsd: 2352,
    avatarUrl: "https://ibb.co/sb9q9K7",
  },
  {
    id: 3,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://ibb.co/sb9q9K7",
  },
  {
    id: 4,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
  {
    id: 5,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
  {
    id: 6,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
  {
    id: 7,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
  {
    id: 8,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
  {
    id: 9,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
  {
    id: 10,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
  {
    id: 11,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
  {
    id: 12,
    title: "Auraui Art 3",
    imageUrl: "https://www.auraui.com/web3Images/nft/nft18.jpeg",
    priceEth: 2.4,
    priceUsd: 4552,
    avatarUrl: "https://www.auraui.com/web3Images/nft/nft1.png",
  },
];

export default function Home() {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* <Navbar className="top-2" /> */}

      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center lg:max-w-lg">
            <p className="my-16 text-lg font-normal text-gray-500 sm:text-xl">
              Explore a curated collection of tokenized contents launched by
              creators from X (twitter) using AI Agents!
            </p>
          </div>

          <div className="mt-12">
            <div className="flex flex-wrap justify-center gap-6 py-4 mx-22">
              {coinItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden transition-all duration-200 transform text-white bg-gray-800 border border-gray-500 rounded-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4 hover:shadow-lg hover:-translate-y-1 group"
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
                      <p className="flex-1 text-base font-medium text-white">
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
                      <p className="text-sm font-medium text-gray-500">
                        Market Cap
                      </p>
                      <p className="text-sm font-medium text-white">
                        $44K{" "}
                        <span className="text-gray-500">
                          (0.00006 USD/token)
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full px-4 py-2 mt-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-transparent border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:border-gray-900 hover:bg-black hover:text-white"
                    >
                      <Link href={"/coin"} >Trade Now</Link>
                     
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


