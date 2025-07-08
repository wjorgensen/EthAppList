"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/lib/api";

interface CategoryPillsProps {
  className?: string;
}

export default function CategoryPills({ className = "" }: CategoryPillsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className={`flex gap-2 overflow-x-auto py-3 px-4 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse w-20" />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 overflow-x-auto py-3 px-4 scrollbar-thin ${className}`}>
      {categories.map((category) => (
        <Link 
          key={category.id} 
          href={`/category/${category.id}`}
          className="bg-black text-white px-4 py-1.5 rounded-full text-sm whitespace-nowrap hover:bg-gray-800 transition-colors"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
} 