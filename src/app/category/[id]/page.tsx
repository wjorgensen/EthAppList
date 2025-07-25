"use client";

import { use, useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import AppCard from "@/components/app/AppCard";
import { Button } from "@/components/ui/button";
import { getProducts, getCategories, Category, Product, getUserVoteStates } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<"upvotes" | "newest">("upvotes");
  const [isLoading, setIsLoading] = useState(true);
  const [voteStates, setVoteStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        
        const decodedId = decodeURIComponent(id as string);
        
        // Fetch categories and products in parallel
        const [categoriesResponse, productsResponse] = await Promise.all([
          getCategories(),
          getProducts({ category: decodedId, per_page: 50 })
        ]);
        
        // Find the specific category by name (case-insensitive)
        const foundCategory = categoriesResponse.find((cat: Category) => cat.name.toLowerCase() === decodedId.toLowerCase()) || null;
        setCategory(foundCategory);
        
        // Set and sort products
        let sortedProducts = [...productsResponse.products];
        if (sortBy === "upvotes") {
          sortedProducts.sort((a, b) => b.upvote_count - a.upvote_count);
        } else {
          sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        
        setProducts(sortedProducts);
        
        // Load vote states if authenticated and we have products
        if (isAuthenticated() && sortedProducts.length > 0) {
          try {
            const productIds = sortedProducts.map(p => p.id);
            const voteStatesData = await getUserVoteStates(productIds);
            setVoteStates(voteStatesData);
          } catch (error) {
            console.error("Error loading vote states:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [id, sortBy]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <p>The requested category does not exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            {category.description}
          </p>
          
          {/* Sort Controls */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Button
              variant={sortBy === "upvotes" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("upvotes")}
              className={sortBy === "upvotes" ? "bg-[#60C5FF] hover:bg-[#60C5FF]/90" : ""}
            >
              Most Popular
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
              className={sortBy === "newest" ? "bg-[#60C5FF] hover:bg-[#60C5FF]/90" : ""}
            >
              Newest
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <AppCard 
                key={product.id} 
                product={product}
                initialVoteState={voteStates[product.id]}
                onUpvote={(productId) => {
                  // Update the local state to reflect the upvote
                  setProducts(prev => prev.map(p => 
                    p.id === productId 
                      ? { ...p, upvote_count: p.upvote_count + 1 }
                      : p
                  ));
                  setVoteStates(prev => ({ ...prev, [productId]: true }));
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No apps found in this category</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to submit an app to the {category.name} category!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
} 