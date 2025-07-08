"use client";

import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="relative bg-gradient-to-b from-blue-500 to-purple-600 text-white py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-4">
              <Image
                src="/ethapplistlogo.svg"
                alt="EthAppList Logo"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-manrope mb-4">
              Discover the Future of Ethereum
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
              EthAppList is a community-curated directory of Ethereum applications, designed to help you navigate the decentralized ecosystem with confidence.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
} 