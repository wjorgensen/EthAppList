"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { getProducts, getCategories, Product, Category } from "@/lib/api";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: "app" | "category";
  logo?: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "apps" | "categories">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          getProducts({ per_page: 100 }), // Get more products for search
          getCategories()
        ]);
        setAllProducts(productsResponse.products);
        setAllCategories(categoriesResponse);
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        // Handle selection
        console.log("Selected:", results[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Search functionality
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];

    // Search products
    if (activeFilter === "all" || activeFilter === "apps") {
      const matchingProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) || 
        product.short_desc.toLowerCase().includes(query.toLowerCase())
      );
      
      searchResults.push(...matchingProducts.map(product => ({
        id: product.id,
        name: product.title,
        description: product.short_desc,
        type: "app" as const,
        logo: product.logo_url
      })));
    }

    // Search categories
    if (activeFilter === "all" || activeFilter === "categories") {
      const matchingCategories = allCategories.filter(category =>
        category.name.toLowerCase().includes(query.toLowerCase()) ||
        category.description.toLowerCase().includes(query.toLowerCase())
      );

      searchResults.push(...matchingCategories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        type: "category" as const
      })));
    }

    setResults(searchResults);
    setSelectedIndex(-1);
  }, [query, activeFilter, allProducts, allCategories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden"
        style={{ animation: "slideDown 0.2s ease-out" }}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
          <Search className="w-5 h-5 mr-2 text-gray-400" />
          <Input
            ref={searchInputRef}
            className="flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
            placeholder="Search apps and categories..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-2"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-2 border-b border-gray-200 dark:border-gray-800 flex space-x-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className={activeFilter === "all" ? "bg-[#60C5FF] hover:bg-[#60C5FF]/90" : ""}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "apps" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("apps")}
            className={activeFilter === "apps" ? "bg-[#60C5FF] hover:bg-[#60C5FF]/90" : ""}
          >
            Apps
          </Button>
          <Button
            variant={activeFilter === "categories" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("categories")}
            className={activeFilter === "categories" ? "bg-[#60C5FF] hover:bg-[#60C5FF]/90" : ""}
          >
            Categories
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60C5FF] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  className={`p-3 cursor-pointer ${
                    selectedIndex === index ? "bg-[#60C5FF]/10" : ""
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    if (result.type === "app") {
                      window.location.href = `/project/${result.id}`;
                    } else {
                      window.location.href = `/category/${result.id}`;
                    }
                    onClose();
                  }}
                >
                  <div className="flex items-center">
                    {result.type === "app" && result.logo && (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md mr-3 flex-shrink-0 overflow-hidden">
                        <img 
                          src={result.logo} 
                          alt={`${result.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {result.type === "category" && (
                      <div className="w-10 h-10 bg-[#60C5FF]/10 text-[#60C5FF] rounded-md mr-3 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{result.name}</h3>
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {result.type === "app" ? "App" : "Category"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {result.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length > 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Start typing to search apps and categories...</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          Press <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800">↓</kbd> to navigate, <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800">Enter</kbd> to select, <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800">Esc</kbd> to dismiss
        </div>
      </div>

      {/* Backdrop click handler */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
        aria-hidden="true"
      />

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 