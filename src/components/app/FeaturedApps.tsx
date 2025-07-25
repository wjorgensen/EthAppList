"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getProducts, Product, getTrendingProducts } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function FeaturedApps() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [featuredApps, setFeaturedApps] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch featured apps on component mount
  useEffect(() => {
    const fetchFeaturedApps = async () => {
      try {
        setIsLoading(true);
        // Get top trending apps for featured section
        const trendingData = await getTrendingProducts(5);
        console.log('Featured apps response:', trendingData);
        console.log('First app structure:', trendingData?.[0]);
        setFeaturedApps(trendingData);
      } catch (error) {
        console.error("Error fetching featured apps:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeaturedApps();
  }, []);

  // Auto-advance the slider if not hovering
  useEffect(() => {
    if (isHovering || featuredApps.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === featuredApps.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovering, featuredApps.length]);

  // Slider navigation
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? featuredApps.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === featuredApps.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold font-manrope mb-6">Featured Apps</h2>
        <div className="h-60 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading featured apps...</div>
        </div>
      </div>
    );
  }

  if (featuredApps.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative overflow-hidden py-8"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold font-manrope">Featured Apps</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={handlePrev}
              aria-label="Previous app"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={handleNext}
              aria-label="Next app"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div 
          ref={sliderRef} 
          className="relative flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {featuredApps.map((app: Product) => (
            <div key={app.id} className="w-full flex-shrink-0 px-2">
              <Link href={`/app/${app.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
                        <Image
                          src={app.logo_url}
                          alt={`${app.title} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-xl font-manrope">
                            {app.title}
                          </h3>
                          {app.is_verified && (
                            <span className="ml-2 inline-flex bg-gray-200 text-black text-xs px-2 py-1 rounded-full dark:bg-gray-800 dark:text-white">
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {app.short_desc}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {app.categories?.map((category) => (
                            <span key={category.id} className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {category.name}
                            </span>
                          ))}
                          {app.chains?.map((chain) => (
                            <span key={chain.id} className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {chain.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex flex-col items-center space-y-1 px-3 text-gray-500 dark:text-gray-400"
                          onClick={(e) => e.preventDefault()}
                        >
                          <ChevronUp className="w-5 h-5" />
                          <span className="text-xs font-medium">{app.upvote_count}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 bg-black text-white border-black hover:bg-gray-800"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/app/${app.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {featuredApps.map((_, index: number) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeIndex ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-700"
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 