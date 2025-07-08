"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getProducts, Product } from "@/lib/api";

export default function FeaturedProjects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fetch featured projects on component mount
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setIsLoading(true);
        // Get top projects for the week
        const response = await getProducts({ sort: 'top_week', per_page: 5 });
        setFeaturedProjects(response.products);
      } catch (error) {
        console.error("Error fetching featured projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeaturedProjects();
  }, []);

  // Auto-advance the slider if not hovering
  useEffect(() => {
    if (isHovering || featuredProjects.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === featuredProjects.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovering, featuredProjects.length]);

  // Slider navigation
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? featuredProjects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === featuredProjects.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold font-manrope mb-6">Featured Apps</h2>
        <div className="h-60 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading featured projects...</div>
        </div>
      </div>
    );
  }

  if (featuredProjects.length === 0) {
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
              aria-label="Previous project"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full" 
              onClick={handleNext}
              aria-label="Next project"
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
          {featuredProjects.map((project: Product) => (
            <div key={project.id} className="w-full flex-shrink-0 px-2">
              <Link href={`/project/${project.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
                        <Image
                          src={project.logo_url}
                          alt={`${project.title} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-xl font-manrope">
                            {project.title}
                          </h3>
                          {project.is_verified && (
                            <span className="ml-2 inline-flex bg-gray-200 text-black text-xs px-2 py-1 rounded-full dark:bg-gray-800 dark:text-white">
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {project.short_desc}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {project.categories.map((category) => (
                            <span key={category.id} className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {category.name}
                            </span>
                          ))}
                          {project.chains.map((chain) => (
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
                          <span className="text-xs font-medium">{project.upvote_count}</span>
                        </Button>
                        <Link 
                          href={`/project/${project.id}`} 
                          onClick={e => e.stopPropagation()}
                          className="mt-3"
                        >
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-black text-white border-black hover:bg-gray-800"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {featuredProjects.map((_, index: number) => (
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