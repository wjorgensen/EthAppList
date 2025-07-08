"use client";

import Image from "next/image";

export default function AboutPage() {
  // TODO: Make this page more fun
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

        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-manrope text-center mb-12">
              Our Mission
            </h2>
            <div className="max-w-4xl mx-auto text-center text-lg text-gray-700">
              <p className="mb-6">
                At EthAppList, our mission is to simplify the discovery of decentralized applications (dApps) on the Ethereum blockchain. We believe in a future where blockchain technology is accessible and understandable to everyone, fostering innovation and adoption.
              </p>
              <p>
                We strive to provide a transparent, reliable, and user-friendly platform where both new and experienced users can explore, learn about, and engage with the vast array of applications building on Ethereum.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-manrope text-center mb-12">
              Why EthAppList?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
                <Image
                  src="/public/placeholder-logos/uniswap-logo.svg"
                  alt="Curated Content"
                  width={60}
                  height={60}
                  className="mb-4"
                />
                <h3 className="text-xl font-semibold font-manrope mb-2">Community-Curated</h3>
                <p className="text-gray-600">
                  Our listings are vetted by a dedicated community of Ethereum enthusiasts, ensuring quality and relevance.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
                <Image
                  src="/public/placeholder-logos/aave-logo.svg"
                  alt="Easy Discovery"
                  width={60}
                  height={60}
                  className="mb-4"
                />
                <h3 className="text-xl font-semibold font-manrope mb-2">Easy Discovery</h3>
                <p className="text-gray-600">
                  Navigate through categories, search for specific dApps, and find exactly what you need with ease.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
                <Image
                  src="/public/placeholder-logos/opensea-logo.svg"
                  alt="Stay Informed"
                  width={60}
                  height={60}
                  className="mb-4"
                />
                <h3 className="text-xl font-semibold font-manrope mb-2">Stay Informed</h3>
                <p className="text-gray-600">
                  Get up-to-date information, links, and insights into the latest Ethereum applications.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 