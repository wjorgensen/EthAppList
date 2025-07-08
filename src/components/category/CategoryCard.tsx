"use client";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { Folder } from "lucide-react";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  productCount?: number;
}

export default function CategoryCard({ id, name, description, icon, productCount }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/category/${id}`}>
      <Card 
        className="cursor-pointer transition-all duration-200 h-full"
        style={{ 
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : ''
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-6">
          <div className="w-12 h-12 mb-4 rounded-full bg-[#60C5FF]/10 flex items-center justify-center text-[#60C5FF]">
            {icon || <Folder className="w-6 h-6" />}
          </div>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="font-manrope text-xl">{name}</CardTitle>
            {productCount !== undefined && (
              <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {productCount}
              </span>
            )}
          </div>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
} 