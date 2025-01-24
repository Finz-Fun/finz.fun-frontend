"use client";
import { Tweet } from "react-tweet";
import { FaCopy } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { buttonVariants } from "../components/ui/button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

const TradingChart = dynamic(() => import("../../components/ui/TradingChart"), {
  ssr: false,
});

interface TokenOption {
  value: string;
  label: string;
  image: string;
}

export default function Coin() {
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

  const tokenOptions: TokenOption[] = [
    { value: "SOL", label: "SOL", image: "/pngwing.com.png" },
    { value: "USDT", label: "USDT", image: "/pngwing.com.png" },
    { value: "BTC", label: "BTC", image: "/pngwing.com.png" },
    { value: "ETH", label: "ETH", image: "/pngwing.com.png" },
  ];

  const getButtonOptions = () => {
    if (activeTab === "SELL") {
      return ["25%", "50%", "75%", "100%"];
    }
    if (activeTab === "BUY" && selectedToken === "SOL") {
      return ["0.5", "1", "2", "5"];
    }
    return [];
  };

  const handleQuickBuyClick = (value: string) => {
    setActiveButton(value);
    setAmount(value);
  };

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

  const handleTokenSelect = (value: string) => {
    setSelectedToken(value);
    setIsDropdownOpen(false);
    setActiveButton(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveButton(null);
    if (tab === "SELL") {
      setSelectedToken("BANA");
    }
  };

  const renderTokenSelector = () => {
    if (activeTab === "SELL") {
      return (
        <div className="flex items-center gap-2 text-gray-200 pl-2">
          <Image
            src="/pngwing.com.png"
            alt="Token"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="pr-8">BANA</span>
        </div>
      );
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-transparent text-gray-200 pl-2 pr-8 py-1 outline-none cursor-pointer relative"
        >
          <Image
            src="/pngwing.com.png"
            alt="Token"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="mr-2">{selectedToken}</span>
          <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-32 bg-[#1D1D1B] rounded-lg shadow-lg py-1 z-50">
            {tokenOptions.map((token) => (
              <button
                key={token.value}
                className="w-full px-3 py-2 text-left hover:bg-[#131311] flex items-center gap-2"
                onClick={() => handleTokenSelect(token.value)}
              >
                <Image
                  src={token.image}
                  alt={token.label}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span>{token.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
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
            <p className="font-bold text-lg">MVP ($MVP)</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">by @shivrxj</p>
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
            <p className="text-sm">market cap: <span>$22,500</span></p>
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
            />
            <div className="mt-6">
              <Table>
                <TableCaption>The latest txs on this token.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>SOL</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sample rows */}
                  <TableRow>
                    <TableCell className="font-medium">BrSp...ZEYi</TableCell>
                    <TableCell>BUY</TableCell>
                    <TableCell>Jan 21 19:19:54</TableCell>
                    <TableCell>2.5</TableCell>
                    <TableCell>CCs</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BrSp...ZEYi</TableCell>
                    <TableCell>BUY</TableCell>
                    <TableCell>Jan 21 19:19:54</TableCell>
                    <TableCell>2.5</TableCell>
                    <TableCell>CCs</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BrSp...ZEYi</TableCell>
                    <TableCell>BUY</TableCell>
                    <TableCell>Jan 21 19:19:54</TableCell>
                    <TableCell>2.5</TableCell>
                    <TableCell>CCs</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BrSp...ZEYi</TableCell>
                    <TableCell>BUY</TableCell>
                    <TableCell>Jan 21 19:19:54</TableCell>
                    <TableCell>2.5</TableCell>
                    <TableCell>CCs</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BrSp...ZEYi</TableCell>
                    <TableCell>BUY</TableCell>
                    <TableCell>Jan 21 19:19:54</TableCell>
                    <TableCell>2.5</TableCell>
                    <TableCell>CCs</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BrSp...ZEYi</TableCell>
                    <TableCell>BUY</TableCell>
                    <TableCell>Jan 21 19:19:54</TableCell>
                    <TableCell>2.5</TableCell>
                    <TableCell>CCs</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                  {/* Additional Rows */}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Side Panel */}
          <div className="w-full lg:w-1/4 flex flex-col gap-4">
            <div className="h-[530px] overflow-hidden">
              <Tweet id="1882573566727884882" />
            </div>
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
                <label className="text-xs text-gray-400 mb-1 block">Amount</label>
                <div className="bg-[#181816] rounded-lg p-2 flex justify-between items-center">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setActiveButton(null);
                    }}
                    className="bg-transparent text-lg outline-none w-full"
                  />
                  {renderTokenSelector()}
                </div>
                <div className="text-xs text-gray-500 mt-1">~ 2.34578 SOL</div>
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
                      {activeTab === "BUY" ? `${value} SOL` : `${value}`}
                    </button>
                  ))}
                </div>
              )}
              <button
                className={`w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === "BUY"
                    ? "bg-[#4caf50] hover:bg-[#45a049] text-white"
                    : "bg-[#d93941] hover:bg-[#c62828] text-white"
                }`}
              >
                {activeTab === "BUY" ? "Buy MVP" : "Sell MVP"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
