"use client";
import React, { forwardRef } from "react";
import Image from "next/image";
import { Camera, MessageCircle, Star } from "lucide-react";
import html2canvas from "html2canvas";

interface TweetProps {
  name: string;
  username: string;
  content: string;
  timestamp: string;
  replies: number;
  retweets: number;
  likes: number;
}

const Tweet = forwardRef<HTMLDivElement, TweetProps>(
  (
    { name, username, content, timestamp, replies, retweets, likes },
    ref
  ) => {
    return (
      <div ref={ref} className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-start">
          <div className="mr-4">
            <Image
              src="/pngwing.com.png"
              alt="Avatar"
              width={48}
              height={48}
              className="rounded-full z-0"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-black">{name}</h3>
                <p className="text-black">@{username}</p>
              </div>
              <p className="text-black">{timestamp}</p>
            </div>
            <p className="mt-2 text-black">{content}</p>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <MessageCircle size={18} className="text-black" />
                <span className="text-black">{replies}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Camera size={18} className="text-black" />
                <span className="text-black">{retweets}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={18} className="text-black" />
                <span className="text-black">{likes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Tweet.displayName = "Tweet";

export const exportAsImage = async (ref: React.RefObject<HTMLDivElement>) => {
  if (ref.current) {
    const canvas = await html2canvas(ref.current);
    const imgData = canvas.toDataURL("image/png");
    console.log(imgData);
    return imgData;
  }
  return "";
};

export default Tweet;
