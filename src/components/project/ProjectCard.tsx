"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Product, upvoteProduct } from "@/lib/api";
import { useToast } from "../../hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";

interface ProjectCardProps {
  // New API format
  product?: Product;
  onUpvote?: (productId: string) => void;
  
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

export default function ProjectCard({ 
  product,
  onUpvote,
  id,
  name,
  tagline,
  logo,
  upvotes,
  category,
  primaryChain,
  isVerified = false
}: ProjectCardProps) {
  const { toast } = useToast();
  
  // If we have individual props but not a product object, create a compatible object
  const productData = product || {
    id: id || "",
    title: name || "",
    short_desc: tagline || "",
    logo_url: logo || "",
    upvote_count: upvotes || 0,
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
    decent_score: 0,
    vibes_score: 0,
    created_at: "",
    updated_at: "",
    submitter: {
      id: "",
      wallet_address: ""
    }
  };

  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(productData.upvote_count);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to upvote products.",
        variant: "destructive"
      });
      return;
    }

    if (!isUpvoted) {
      try {
        await upvoteProduct(productData.id);
        setUpvoteCount(prev => prev + 1);
        setIsUpvoted(true);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        
        if (onUpvote) {
          onUpvote(productData.id);
        }
      } catch (error) {
        console.error("Error upvoting product:", error);
        toast({
          title: "Upvote Failed",
          description: "There was an error upvoting this product. You may have already upvoted it.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Link href={`/project/${productData.id}`}>
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

            <div className="flex-grow min-w-0 mr-4">
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

              <div className="flex flex-wrap mt-2 gap-2">
                {productData.categories.slice(0, 1).map(category => (
                  <span 
                    key={category.id} 
                    className="inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {category.name}
                  </span>
                ))}
                {productData.chains.slice(0, 1).map(chain => (
                  <span 
                    key={chain.id} 
                    className="inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {chain.name}
                  </span>
                ))}
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
              <span className="text-xs font-medium">{upvoteCount}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 