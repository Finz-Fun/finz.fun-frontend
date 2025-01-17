"use client";
import { Tweet } from "react-tweet";
import { FaCopy } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";

export default function Coin() {
  // Function to handle copying to clipboard
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
      .catch(() => alert("Failed to copy!")); // Handle errors
  };

  return (
    <div className="p-4 mt-64">
      {/* Container for picture and texts */}
      <div className="flex items-center gap-4 mb-4">
        {/* Rounded Picture */}
        <img
          src="/pngwing.com.png" // Replace with your image URL
          alt="Rounded Avatar"
          className="w-12 h-12 rounded-full"
        />

        {/* Texts aligned side by side */}
        <div className="flex flex-col">
          <p className="font-bold text-lg">BANANAE ($BANA)</p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">by @shivrxj</p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground flex items-center">
            ca:{" "}
            <span id="contract-address">
              39nGsPpnu9gE9qjo6quMBVZcZnASvjj5Y9DBfNLhpump
            </span>
            <FaCopy
              className="ml-2 cursor-pointer"
              onClick={() => {
                const contractAddress = document
                  .getElementById("contract-address")
                  ?.textContent?.trim();
                if (contractAddress) {
                  handleCopyToClipboard(contractAddress);
                } else {
                  alert("No contract address found to copy!");
                }
              }}
            />
          </p>
        </div>
      </div>

      {/* Container for 75%-25% split */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 75% Section for TradingView Chart */}
        <div className="w-full lg:w-3/4">
          <iframe
            src="https://s.tradingview.com/embed-widget/symbol-overview/?symbol=BINANCE:BTCUSDT&locale=en"
            width="100%"
            height="500"
            frameBorder="0"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>

        {/* 25% Section for Embedded Tweet */}
        <div className="w-full lg:w-1/4">
          <Tweet id="1879487106244104651" />
        </div>
      </div>
    </div>
  );
}
