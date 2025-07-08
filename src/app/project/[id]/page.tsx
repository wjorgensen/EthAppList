"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductById, upvoteProduct, Product } from "@/lib/api";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronUp, ExternalLink, Clock, Edit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);
        setUpvoteCount(productData.upvote_count);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpvote = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to upvote products.",
        variant: "destructive"
      });
      return;
    }

    if (!isUpvoted && product) {
      try {
        await upvoteProduct(product.id);
        setUpvoteCount(prev => prev + 1);
        setIsUpvoted(true);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="flex-grow">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              </div>
              <div className="md:col-span-3">
                <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p>The requested product does not exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          {/* Project Logo */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src={product.logo_url}
              alt={`${product.title} logo`}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold font-manrope">{product.title}</h1>
              {product.is_verified && (
                <span className="inline-flex bg-[#60C5FF]/10 text-[#60C5FF] text-xs px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              {product.short_desc}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              {product.categories.map((category) => (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <span className="inline-flex text-sm px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                </Link>
              ))}
              {product.chains.map((chain) => (
                <span 
                  key={chain.id}
                  className="inline-flex text-sm px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {chain.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="lg"
              className={`flex flex-col items-center space-y-1 px-6 ${
                isUpvoted ? "text-[#60C5FF]" : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={handleUpvote}
            >
              <ChevronUp 
                className={`w-8 h-8 transition-transform ${
                  isAnimating ? "scale-125" : ""
                }`}
              />
              <span className="text-lg font-medium">{upvoteCount}</span>
            </Button>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="lg"
              className={`flex flex-col items-center space-y-1 px-6 ${
                isUpvoted ? "text-[#60C5FF]" : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={handleUpvote}
            >
              <ChevronUp 
                className={`w-8 h-8 transition-transform ${
                  isAnimating ? "scale-125" : ""
                }`}
              />
              <span className="text-lg font-medium">{upvoteCount}</span>
            </Button>
            
            {isAuthenticated() && (
              <Link href={`/edit-project/${product.id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Project Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 order-2 md:order-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sticky top-24">
              <h3 className="font-medium text-lg mb-4">Information</h3>
              
              {/* Project Stats */}
              <div className="mb-6">
                <h4 className="text-sm uppercase text-gray-500 dark:text-gray-400 mb-2">Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Upvotes</span>
                    <span className="text-sm font-medium">{upvoteCount}</span>
                  </div>
                  {product.security_score > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Security Score</span>
                      <span className="text-sm font-medium">{product.security_score}/10</span>
                    </div>
                  )}
                  {product.ux_score > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">UX Score</span>
                      <span className="text-sm font-medium">{product.ux_score}/10</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submitter Info */}
              <div className="mb-6">
                <h4 className="text-sm uppercase text-gray-500 dark:text-gray-400 mb-2">Submitted by</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {product.submitter.wallet_address.slice(0, 6)}...{product.submitter.wallet_address.slice(-4)}
                </p>
              </div>

              {/* Timestamps */}
              <div className="mb-6">
                <h4 className="text-sm uppercase text-gray-500 dark:text-gray-400 mb-2">Dates</h4>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    Added {new Date(product.created_at).toLocaleDateString()}
                  </div>
                  {product.updated_at !== product.created_at && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated {new Date(product.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 order-1 md:order-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-2xl font-bold mb-4">About {product.title}</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {product.long_desc}
                    </p>
                  </div>
                </div>

                {product.markdown_content && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{product.markdown_content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-2xl font-bold mb-4">Technical Details</h2>
                  
                  {/* Categories */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category) => (
                        <Link key={category.id} href={`/category/${category.id}`}>
                          <span className="inline-flex text-sm px-3 py-1 rounded-full bg-[#60C5FF]/10 text-[#60C5FF] hover:bg-[#60C5FF]/20 transition-colors">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Chains */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Supported Chains</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.chains.map((chain) => (
                        <span 
                          key={chain.id}
                          className="inline-flex text-sm px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          {chain.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Analytics */}
                  {product.analytics_list && product.analytics_list.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {product.analytics_list.map((analytic, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">{analytic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
} 