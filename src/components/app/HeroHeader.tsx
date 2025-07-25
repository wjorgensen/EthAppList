import Image from "next/image";
import Link from "next/link";
import { ChevronUp, CheckCircle2, Pencil, ExternalLink, Github, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { RateDialog, Scores } from "@/components/app/RateDialog";
import { Product } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { useState } from "react";

interface HeroHeaderProps {
  product: Product;
  onUpvote: () => void;
  upvoteCount: number;
  isUpvoted: boolean;
  isAnimating: boolean;
  onScoresSubmit: (scores: Scores) => Promise<void>;
  hasSubmittedScore: boolean;
}

export default function HeroHeader({ 
  product, 
  onUpvote, 
  upvoteCount, 
  isUpvoted, 
  isAnimating,
  onScoresSubmit,
  hasSubmittedScore
}: HeroHeaderProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  return (
    <section className="relative bg-gradient-to-tr from-sky-50 to-white dark:from-zinc-900 dark:to-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Logo */}
        <div className="shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
            <Image
              src={product.logo_url}
              alt={`${product.title} logo`}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Title and Verification */}
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold font-manrope text-gray-900 dark:text-white">
              {product.title}
            </h1>
            {product.is_verified && (
              <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" />
            )}
            {isAuthenticated() && (
              <Link href={`/edit-project/${product.id}`}>
                <Pencil className="w-4 h-4 text-gray-400 hover:text-[#60C5FF] transition-colors" />
              </Link>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className={`text-lg text-gray-600 dark:text-gray-300 leading-relaxed ${
              !isDescriptionExpanded && product.short_desc.length > 120 ? "line-clamp-2" : ""
            }`}>
              {product.short_desc}
            </p>
            {product.short_desc.length > 120 && (
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-sm text-[#60C5FF] hover:text-[#4A9FDD] mt-2 transition-colors"
              >
                {isDescriptionExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Category and Chain Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.categories?.map((category) => (
              <Link key={category.id} href={`/category/${encodeURIComponent(category.name)}`}>
                <Pill label={category.name} variant="primary" />
              </Link>
            ))}
            {product.chains?.map((chain) => (
              <Pill key={chain.id} label={chain.name} variant="secondary" />
            ))}
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap gap-3">
            {product.website_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={product.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            {product.github_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={product.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {product.docs_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={product.docs_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="w-4 h-4 mr-2" />
                  Docs
                </a>
              </Button>
            )}

          </div>
        </div>

        {/* CTA and Scores */}
        <div className="flex flex-col items-center gap-6 shrink-0">
          {/* Upvote Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={onUpvote}
            className={`flex flex-col items-center gap-2 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
              isUpvoted ? "text-[#60C5FF]" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <ChevronUp 
              className={`w-8 h-8 transition-transform ${
                isAnimating ? "scale-125" : ""
              }`}
            />
            <span className="text-lg font-medium">{upvoteCount}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">upvotes</span>
          </Button>

          {/* Rate Dialog */}
          {isAuthenticated() && (
            hasSubmittedScore ? (
              <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
                <Star className="w-4 h-4" />
                Submitted
              </Button>
            ) : (
              <RateDialog onSubmit={onScoresSubmit} />
            )
          )}

          {/* Community Score Donuts */}
          <div className="grid grid-cols-2 gap-4">
            <ScoreDonut label="Overall" value={product.overall_score} />
            <ScoreDonut label="Security" value={product.security_score} />
            <ScoreDonut label="UX" value={product.ux_score} />
            <ScoreDonut label="Vibes" value={product.vibes_score} />
          </div>
        </div>
      </div>
    </section>
  );
}

const Pill = ({ label, variant = "primary" }: { label: string; variant?: "primary" | "secondary" }) => (
  <span
    className={`inline-flex text-sm px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
      variant === "primary"
        ? "bg-[#60C5FF]/10 text-[#60C5FF] hover:bg-[#60C5FF]/20"
        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
    }`}
  >
    {label}
  </span>
);

const ScoreDonut = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center gap-1">
    <ProgressCircle size={56} strokeWidth={6} value={value * 100} />
    <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide">
      {label}
    </span>
  </div>
); 