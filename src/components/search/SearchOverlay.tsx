"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { getProducts, getCategories, Product, Category } from "@/lib/api";
import Image from "next/image";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: "app" | "category";
  logo?: string;
  matchContext?: ReactNode;
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

    const createHighlight = (text: string, query: string): ReactNode | null => {
      const index = text.toLowerCase().indexOf(query.toLowerCase());
      if (index === -1) return null;

      const CONTEXT_WINDOW = 50;
      const startIndex = Math.max(0, index - CONTEXT_WINDOW);
      const endIndex = Math.min(
        text.length,
        index + query.length + CONTEXT_WINDOW
      );

      const snippet = `...${text.substring(startIndex, endIndex)}...`;

      const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const parts = snippet.split(new RegExp(`(${escapedQuery})`, "gi"));

      return (
        <p className="text-xs text-muted-foreground mt-1 italic">
          {parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <span
                key={i}
                className="bg-primary/20 text-primary-foreground font-semibold not-italic rounded px-1"
              >
                {part}
              </span>
            ) : (
              part
            )
          )}
        </p>
      );
    };

    const searchResults: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Search products
    if (activeFilter === "all" || activeFilter === "apps") {
      const matchingProducts = allProducts.reduce(
        (acc: SearchResult[], product) => {
          const titleMatch = product.title.toLowerCase().includes(queryLower);
          const shortDescMatch = product.short_desc
            .toLowerCase()
            .includes(queryLower);
          const longDescMatch = product.long_desc
            .toLowerCase()
            .includes(queryLower);
          const markdownMatch = product.markdown_content
            .toLowerCase()
            .includes(queryLower);

          if (titleMatch || shortDescMatch || longDescMatch || markdownMatch) {
            let matchContext: ReactNode | null = null;

            if (longDescMatch) {
              matchContext = createHighlight(product.long_desc, query);
            } else if (markdownMatch) {
              matchContext = createHighlight(product.markdown_content, query);
            }

            acc.push({
              id: product.id,
              name: product.title,
              description: product.short_desc,
              type: "app" as const,
              logo: product.logo_url,
              matchContext: matchContext,
            });
          }
          return acc;
        },
        []
      );

      searchResults.push(...matchingProducts);
    }

    // Search categories
    if (activeFilter === "all" || activeFilter === "categories") {
      const matchingCategories = allCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(queryLower) ||
          category.description.toLowerCase().includes(queryLower)
      );

      searchResults.push(
        ...matchingCategories.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          type: "category" as const,
        }))
      );
    }

    setResults(searchResults);
    setSelectedIndex(-1);
  }, [query, activeFilter, allProducts, allCategories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/30 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border text-card-foreground rounded-lg shadow-lg overflow-hidden animate-in fade-in duration-200 slide-in-from-top-4">
        <div className="p-4 border-b flex items-center">
          <Search className="w-5 h-5 mr-3 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-muted-foreground"
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

        <div className="p-2 border-b flex space-x-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "apps" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("apps")}
          >
            Apps
          </Button>
          <Button
            variant={activeFilter === "categories" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("categories")}
          >
            Categories
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading...</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  className={`p-3 cursor-pointer rounded-md ${
                    selectedIndex === index ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    if (result.type === "app") {
                      window.location.href = `/app/${result.id}`;
                    } else {
                      window.location.href = `/category/${result.id}`;
                    }
                    onClose();
                  }}
                >
                  <div className="flex items-center">
                    {result.type === "app" && result.logo && (
                      <div className="w-10 h-10 bg-muted rounded-md mr-3 flex-shrink-0 overflow-hidden">
                        <Image 
                          src={result.logo}
                          alt={`${result.name} logo`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {result.type === "category" && (
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-md mr-3 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{result.name}</h3>
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {result.type === "app" ? "App" : "Category"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.description}
                      </p>
                      {result.matchContext}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length > 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Start typing to search apps and categories...</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-1 rounded-md bg-muted font-mono">↑</kbd> <kbd className="px-1.5 py-1 rounded-md bg-muted font-mono">↓</kbd> to navigate, <kbd className="px-1.5 py-1 rounded-md bg-muted font-mono">Enter</kbd> to select, <kbd className="px-1.5 py-1 rounded-md bg-muted font-mono">Esc</kbd> to dismiss
        </div>
      </div>

      {/* Backdrop click handler */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
} 