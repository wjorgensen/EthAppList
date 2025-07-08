"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import FeaturedProjects from "@/components/project/FeaturedProjects";
import CategoryCard from "@/components/category/CategoryCard";
import CategoryPills from "@/components/category/CategoryPills";
import SearchOverlay from "@/components/search/SearchOverlay";
import ProjectCard from "@/components/project/ProjectCard";
import { getCategories, getProducts, Category, Product } from "@/lib/api";

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const fetchTrendingProducts = async () => {
      try {
        const response = await getProducts({ sort: 'top_week', per_page: 6 });
        setTrendingProducts(response.products);
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
      } finally {
        setIsLoadingTrending(false);
      }
    };

    fetchCategories();
    fetchTrendingProducts();
  }, []);

  return (
    <Layout>
      {/* Category Pills */}
      <CategoryPills className="bg-white dark:bg-gray-950" />
      
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-manrope mb-4">
            Discover Ethereum Applications
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            A community-curated directory of the best Ethereum apps, with easy-to-understand explanations and trusted links.
          </p>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-md transition-colors"
          >
            Search Apps
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 font-mono text-xs">⌘ K</kbd> to search
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <FeaturedProjects />

      {/* Categories Grid */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-semibold font-manrope mb-8">Browse Categories</h2>
          {isLoadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category: Category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  description={category.description}
                  productCount={category.product_count}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-semibold font-manrope mb-6">Trending This Week</h2>
          {isLoadingTrending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingProducts.map((product) => (
                <ProjectCard 
                  key={product.id} 
                  product={product}
                  onUpvote={(productId) => {
                    setTrendingProducts(prev => prev.map(p => 
                      p.id === productId 
                        ? { ...p, upvote_count: p.upvote_count + 1 }
                        : p
                    ));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p>No trending apps this week. Be the first to submit one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </Layout>
  );
} 