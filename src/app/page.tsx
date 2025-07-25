"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import CategoryPills from "@/components/category/CategoryPills";
import SearchOverlay from "@/components/search/SearchOverlay";
import AppCard from "@/components/app/AppCard";
import { getProducts, Product, getTrendingProducts, getUserVoteStates, getRandomProducts } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingRandom, setIsLoadingRandom] = useState(true);
  const [isLoadingNewProducts, setIsLoadingNewProducts] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [voteStates, setVoteStates] = useState<Record<string, boolean>>({});
  const [newProductsVoteStates, setNewProductsVoteStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    setAuthenticated(isAuthenticated());
  }, []);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const trendingData = await getTrendingProducts(10);
        setTrendingProducts(trendingData);
        
        if (isAuthenticated() && trendingData.length > 0) {
          const productIds = trendingData.map(p => p.id);
          const voteStatesData = await getUserVoteStates(productIds);
          setVoteStates(voteStatesData);
        }
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
      } finally {
        setIsLoadingTrending(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  const fetchRandomProducts = useCallback(async () => {
    setIsLoadingRandom(true);
    try {
      const randomData = await getRandomProducts(5);
      setRandomProducts(randomData.products);
    } catch (error) {
      console.error("Failed to fetch random products:", error);
    } finally {
      setIsLoadingRandom(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomProducts();
  }, [fetchRandomProducts]);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const newProductsData = await getProducts({ sort: 'new', per_page: 50 }); // Get first 50 new products
        setNewProducts(newProductsData.products);
        
        // Load vote states if authenticated
        if (isAuthenticated() && newProductsData.products.length > 0) {
          try {
            const productIds = newProductsData.products.map(p => p.id);
            const voteStatesData = await getUserVoteStates(productIds);
            setNewProductsVoteStates(voteStatesData);
          } catch (error) {
            console.error("Error loading new products vote states:", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch new products:", error);
      } finally {
        setIsLoadingNewProducts(false);
      }
    };

    fetchNewProducts();
  }, []);

  return (
    <Layout>
      {/* Category Pills - Now more prominent like YouTube */}
      <CategoryPills className="bg-white dark:bg-gray-950" />
      
      {/* Hero Section - Only show when wallet is not connected */}
      {mounted && !authenticated && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-manrope mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Discover Ethereum Applications
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-4xl mx-auto leading-relaxed">
              A community-curated directory of the best Ethereum apps, with easy-to-understand explanations and trusted links.
            </p>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Search Apps
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Press <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 font-mono text-xs border border-gray-300 dark:border-gray-700">⌘ K</kbd> to search
            </p>
          </div>
        </section>
      )}

      {/* Main Content Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trending Section (Left Column) */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold font-manrope mb-6 ml-12">Trending</h2>
              {isLoadingTrending ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl animate-pulse">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : trendingProducts.length > 0 ? (
                <div className="space-y-4">
                  {trendingProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-200 w-8 text-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <AppCard
                          product={product}
                          initialVoteState={voteStates[product.id]}
                          onUpvote={(productId) => {
                            setTrendingProducts(prev => prev.map(p =>
                              p.id === productId
                                ? { ...p, upvote_count: (p.upvote_count || 0) + 1 }
                                : p
                            ));
                            setVoteStates(prev => ({ ...prev, [productId]: true }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                  <p className="text-lg">No trending apps this week. Be the first to submit one!</p>
                </div>
              )}
            </div>

            {/* Discover Section (Right Column) */}
            <div className="lg:col-span-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-manrope">Discover Random Apps</h2>
                <button
                  onClick={fetchRandomProducts}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh random apps"
                  disabled={isLoadingRandom}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-600 dark:text-gray-400 ${isLoadingRandom ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                </button>
              </div>
              {isLoadingRandom ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : randomProducts.length > 0 ? (
                <div className="space-y-4">
                  {randomProducts.map((product) => (
                    <Link href={`/app/${product.id}`} key={product.id}>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                          <img src={product.logo_url} alt={`${product.title} logo`} className="w-12 h-12 rounded-lg" />
                          <div>
                            <h3 className="font-bold">{product.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.short_desc}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                  <p className="text-lg">No apps to discover right now.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* New Apps Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">New Apps</h2>
            
          </div>
          {isLoadingNewProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : newProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <AppCard 
                  key={product.id} 
                  product={product}
                  initialVoteState={newProductsVoteStates[product.id]}
                  onUpvote={(productId) => {
                    setNewProducts(prev => prev.map(p => 
                      p.id === productId 
                        ? { ...p, upvote_count: (p.upvote_count || 0) + 1 }
                        : p
                    ));
                    setNewProductsVoteStates(prev => ({ ...prev, [productId]: true }));
                    
                    // Also update trending products if this product is in there
                    setTrendingProducts(prev => prev.map(p => 
                      p.id === productId 
                        ? { ...p, upvote_count: (p.upvote_count || 0) + 1 }
                        : p
                    ));
                    setVoteStates(prev => ({ ...prev, [productId]: true }));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-16">
              <p className="text-lg">No new apps found. Be the first to submit one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </Layout>
  );
} 