"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  className?: string;
}

export default function CategoryPills({ className = "" }: CategoryPillsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeave = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
  };

  const onMouseUp = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <div className={cn("w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800", className)}>
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-9 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse w-24 flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800", className)}>
      <div className="container max-w-7xl mx-auto px-4">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto py-4 scrollbar-hide cursor-grab"
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${encodeURIComponent(category.name)}`}
              className="flex-shrink-0 bg-black dark:bg-gray-800 text-white dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              onClick={(e) => {
                if (isDragging) e.preventDefault();
              }}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 