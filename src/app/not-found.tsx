"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          {/* Hand-drawn block mascot illustration */}
          <div className="mb-8">
            <svg
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-48 h-48 mx-auto"
              style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))" }}
            >
              {/* Scribbled block mascot - simplified hand-drawn style */}
              <path
                d="M40 60C40 48.9543 48.9543 40 60 40H140C151.046 40 160 48.9543 160 60V140C160 151.046 151.046 160 140 160H60C48.9543 160 40 151.046 40 140V60Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1 6"
                className="text-gray-400"
              />
              <path
                d="M70 80C70 74.4772 74.4772 70 80 70H120C125.523 70 130 74.4772 130 80V120C130 125.523 125.523 130 120 130H80C74.4772 130 70 125.523 70 120V80Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5 5"
                className="text-[#60C5FF]"
              />
              {/* Sad face */}
              <circle cx="85" cy="95" r="5" fill="currentColor" />
              <circle cx="115" cy="95" r="5" fill="currentColor" />
              <path
                d="M90 115C95 110 105 110 110 115"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                transform="rotate(180 100 112.5)"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold font-manrope mb-4">
            Lost in the mempool
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/">
            <Button className="bg-[#60C5FF] hover:bg-[#60C5FF]/90 text-white">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
} 