"use client";

import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getProductById, upvoteProduct, postScores, Product, getUserVoteStates, getUserScore } from "@/lib/api";
import Layout from "@/components/layout/Layout";
import AnalyticsSection from "@/components/app/AnalyticsSection";
import MetaFooter from "@/components/app/MetaFooter";
import { Section } from "@/components/ui/section";
import { Scores } from "@/components/app/RateDialog";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ChevronUp, ExternalLink, Github, FileText, Globe, Pencil, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { RateDialog } from "@/components/app/RateDialog";
import Markdown from "@/components/Markdown";
import { useIsMobile } from "@/lib/feature-flags";


interface AppPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AppPage({ params }: AppPageProps) {
  const { id } = use(params);
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchApp = async () => {
      try {
        setIsLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);
        setUpvoteCount(productData.upvote_count);
        
        if (isAuthenticated()) {
          try {
            const voteStates = await getUserVoteStates([productData.id]);
            setIsUpvoted(voteStates[productData.id] || false);
            
            const userScore = await getUserScore(productData.id);
            setHasSubmittedScore(userScore?.has_submitted || false);
          } catch (error) {
            console.error("Error loading user states:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  const handleUpvote = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to upvote apps.",
        variant: "destructive"
      });
      return;
    }

    if (!isUpvoted && product) {
      try {
        await upvoteProduct(product.id);
        setUpvoteCount(prev => prev + 1);
        setIsUpvoted(true);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      } catch (error) {
        console.error("Error upvoting app:", error);
        toast({
          title: "Upvote Failed",
          description: "There was an error upvoting this app. You may have already upvoted it.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Already Upvoted",
        description: "You have already upvoted this app.",
        variant: "default"
      });
    }
  };

  const handleScoresSubmit = async (scores: Scores) => {
    if (!product) return;
    
    try {
      await postScores(product.id, scores);
      setHasSubmittedScore(true);
      toast({
        title: "Scores Submitted",
        description: "Your community scores have been submitted successfully!",
      });
      const updatedProduct = await getProductById(product.id);
      setProduct(updatedProduct);
    } catch (error) {
      console.error("Error submitting scores:", error);
      toast({
        title: "Submission Failed", 
        description: "There was an error submitting your scores. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-screen-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-64"></div>
            <div className="space-y-6">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-96"></div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-64"></div>
                <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-64"></div>
                <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container max-w-screen-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">App not found</h1>
          <p className="text-gray-600 dark:text-gray-400">The requested app does not exist.</p>
        </div>
      </Layout>
    );
  }

  const LeftSidebar = (
    <div className="w-full md:w-1/4 md:sticky top-24 self-start space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-xl font-bold mb-4">App Links</h3>
        <div className="space-y-2">
          {product.website_url && (
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => window.open(product.website_url, '_blank', 'noopener,noreferrer')}
            >
              <Globe size={16} />
              Website
            </Button>
          )}
          {product.docs_url && (
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => window.open(product.docs_url, '_blank', 'noopener,noreferrer')}
            >
              <FileText size={16} />
              Docs
            </Button>
          )}
          {product.github_url && (
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => window.open(product.github_url, '_blank', 'noopener,noreferrer')}
            >
              <Github size={16} />
              GitHub
            </Button>
          )}
        </div>
        
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        
        <h3 className="text-xl font-bold mb-4">Community Scores</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <ProgressCircle value={(product.overall_score || 0) * 100} size={80} strokeWidth={8} />
            <p className="text-sm mt-2 text-center">Overall</p>
          </div>
          <div className="flex flex-col items-center">
            <ProgressCircle value={(product.security_score || 0) * 100} size={80} strokeWidth={8} />
            <p className="text-sm mt-2 text-center">Security</p>
          </div>
          <div className="flex flex-col items-center">
            <ProgressCircle value={(product.ux_score || 0) * 100} size={80} strokeWidth={8} />
            <p className="text-sm mt-2 text-center">UX</p>
          </div>
          <div className="flex flex-col items-center">
            <ProgressCircle value={(product.vibes_score || 0) * 100} size={80} strokeWidth={8} />
            <p className="text-sm mt-2 text-center">Vibes</p>
          </div>
        </div>
        
        {isAuthenticated() && (
          <div className="mt-4">
            {hasSubmittedScore ? (
              <Button variant="outline" className="w-full justify-start gap-3" disabled>
                <Star className="w-4 h-4" />
                Submitted
              </Button>
            ) : (
              <RateDialog onSubmit={handleScoresSubmit} triggerClassName="w-full justify-start" />
            )}
          </div>
        )}
        
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        
        <Link href={`/edit-app/${product.id}`} passHref>
          <Button variant="outline" className="w-full justify-start gap-3">
            <Pencil size={16} />
            Propose an Edit
          </Button>
        </Link>
      </div>
    </div>
  );

  const MobileHeaderSection = (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div className="flex justify-between items-start">
            <Image
                src={product.logo_url || '/placeholder-logos/opensea-logo.svg'}
                alt={`${product.title} logo`}
                width={80}
                height={80}
                className="rounded-lg"
            />
            <Button
                variant="outline"
                onClick={handleUpvote}
                disabled={isUpvoted}
                className={`h-auto flex flex-col items-center gap-1 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-2 ${isUpvoted ? "text-blue-500 border-blue-500" : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"}`}
            >
                <ChevronUp
                    className={`w-5 h-5 transition-transform ${
                        isAnimating ? "scale-125" : ""
                    }`}
                />
                <span className="text-base font-medium">{upvoteCount}</span>
            </Button>
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.title}</h1>
            <p className="text-md italic text-gray-600 dark:text-gray-300 mt-1">{product.short_desc}</p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-2">{product.long_desc}</p>
    </div>
  );

  const DesktopHeaderSection = (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 flex gap-8 items-start">
        <div className="flex-shrink-0">
            <Image
                src={product.logo_url || '/placeholder-logos/opensea-logo.svg'}
                alt={`${product.title} logo`}
                width={128}
                height={128}
                className="rounded-lg"
            />
        </div>
        <div className="flex-grow">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{product.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{product.short_desc}</p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.long_desc}</p>
        </div>
        <div className="flex-shrink-0">
            <Button
                variant="outline"
                onClick={handleUpvote}
                disabled={isUpvoted}
                className={`h-auto flex flex-col items-center gap-2 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800 px-7 py-2 ${isUpvoted ? "text-blue-500 border-blue-500" : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"}`}
            >
                <ChevronUp
                    className={`w-5 h-5 transition-transform ${
                        isAnimating ? "scale-125" : ""
                    }`}
                />
                <span className="text-base font-medium">{upvoteCount}</span>
            </Button>
        </div>
    </div>
  );

  const MainContent = (
    <>
      {product.markdown_content && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <Markdown content={product.markdown_content} />
        </div>
      )}

      {product.analytics_list && product.analytics_list.length > 0 && (
        <Section id="analytics">
          <AnalyticsSection dashboards={product.analytics_list} />
        </Section>
      )}

      <Section>
        <MetaFooter product={product} />
      </Section>
    </>
  );


  return (
    <Layout>
      <div className="container max-w-screen-2xl mx-auto px-4 py-8">
        {isMobile ? (
          <div className="space-y-8">
            {MobileHeaderSection}
            {LeftSidebar}
            <div className="space-y-8">{MainContent}</div>
          </div>
        ) : (
          <div className="flex flex-row gap-8">
            {LeftSidebar}
            <div className="w-full md:w-3/4 space-y-8">
              {DesktopHeaderSection}
              {MainContent}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 