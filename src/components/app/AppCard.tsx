"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ChevronUp } from "lucide-react";
import { Product, upvoteProduct, getUserVoteStates } from "@/lib/api";
import { useToast } from "../../hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";

interface AppCardProps {
  // New API format
  product?: Product;
  onUpvote?: (productId: string) => void;
  initialVoteState?: boolean;
  
  // Legacy format
  id?: string;
  name?: string;
  tagline?: string;
  logo?: string;
  upvotes?: number;
  category?: string;
  primaryChain?: string;
  isVerified?: boolean;
}

export default function AppCard({ 
  product,
  onUpvote,
  initialVoteState,
  id,
  name,
  tagline,
  logo,
  upvotes,
  category,
  primaryChain,
  isVerified = false
}: AppCardProps) {
  const { toast } = useToast();
  
  // If we have individual props but not a product object, create a compatible object
  const productData = product || {
    id: id || "",
    title: name || "",
    short_desc: tagline || "",
    logo_url: logo || "",
    upvote_count: Number(upvotes) || 0,
    is_verified: isVerified,
    categories: category ? [{ id: "1", name: category, description: "" }] : [],
    chains: primaryChain ? [{ id: "1", name: primaryChain, icon: "" }] : [],
    long_desc: "",
    markdown_content: "",
    submitter_id: "",
    approved: true,
    analytics_list: [],
    security_score: 0,
    ux_score: 0,
    overall_score: 0,
    vibes_score: 0,
    created_at: "",
    updated_at: "",
    submitter: {
      id: "",
      wallet_address: ""
    }
  };

  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(productData.upvote_count || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoadingVoteState, setIsLoadingVoteState] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const pillContainerRef = useRef<HTMLDivElement>(null);

  // Check for overflow on the pill container
  useEffect(() => {
    const checkOverflow = () => {
      if (pillContainerRef.current) {
        const { scrollWidth, clientWidth } = pillContainerRef.current;
        setIsOverflowing(scrollWidth > clientWidth);
      }
    };

    // Check on mount and on window resize
    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [productData.categories, productData.chains]);

  // Handle scroll events to show/hide gradients
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft);
  };

  // Load user's vote state when component mounts
  useEffect(() => {
    // If we have an initial vote state, use it instead of fetching
    if (initialVoteState !== undefined) {
      setIsUpvoted(initialVoteState);
      return;
    }

    const loadVoteState = async () => {
      if (!isAuthenticated() || !productData.id) return;
      
      try {
        setIsLoadingVoteState(true);
        const voteStates = await getUserVoteStates([productData.id]);
        setIsUpvoted(voteStates[productData.id] || false);
      } catch (error) {
        console.error("Error loading vote state:", error);
      } finally {
        setIsLoadingVoteState(false);
      }
    };

    loadVoteState();
  }, [productData.id, initialVoteState]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to upvote apps.",
        variant: "destructive"
      });
      return;
    }

    if (!isUpvoted) {
      try {
        await upvoteProduct(productData.id);
        setUpvoteCount(prev => (prev || 0) + 1);
        setIsUpvoted(true);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        
        if (onUpvote) {
          onUpvote(productData.id);
        }
      } catch (error) {
        console.error("Error upvoting app:", error);
        toast({
          title: "Upvote Failed",
          description: "There was an error upvoting this app. You may have already upvoted it.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Already Upvoted",
        description: "You have already upvoted this app.",
        variant: "default"
      });
    }
  };

  return (
    <Link href={`/app/${productData.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            <div className="relative w-12 h-12 mr-4 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
              {productData.logo_url ? (
                <Image
                  src={productData.logo_url}
                  alt={`${productData.title} logo`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  {productData.title.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center">
                <h3 className="font-semibold text-lg font-manrope truncate">
                  {productData.title}
                </h3>
                {productData.is_verified && (
                  <span className="ml-2 inline-flex bg-[#60C5FF]/10 text-[#60C5FF] text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {productData.short_desc}
              </p>

              <div className="relative mt-2">
                <div 
                  ref={pillContainerRef}
                  onScroll={handleScroll}
                  className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {productData.categories?.map(category => (
                    <span 
                      key={category.id} 
                      className="inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 whitespace-nowrap flex-shrink-0"
                    >
                      {category.name}
                    </span>
                  ))}
                  {productData.chains?.map(chain => (
                    <span 
                      key={chain.id} 
                      className="inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 whitespace-nowrap flex-shrink-0"
                    >
                      {chain.name}
                    </span>
                  ))}
                </div>
                {/* Left blur gradient */}
                {isOverflowing && scrollPosition > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                )}
                {/* Right blur gradient */}
                {isOverflowing && pillContainerRef.current && scrollPosition < pillContainerRef.current.scrollWidth - pillContainerRef.current.clientWidth -1 && (
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 px-3 ${
                isUpvoted ? "text-[#60C5FF]" : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={handleUpvote}
            >
              <ChevronUp 
                className={`w-5 h-5 transition-transform ${
                  isAnimating ? "scale-125" : ""
                }`}
              />
              <span className="text-xs font-medium">{upvoteCount || 0}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 