"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2, Search, Sparkles, ArrowLeft, Expand, ChevronUp, Globe, FileText, Github, Pencil, Star } from "lucide-react";
import { submitProduct, getCategories, Category, getUserPermissions, getProductById, updateProduct, submitProductEdit, Product } from '@/lib/api';
import { isAuthenticated } from "@/lib/auth";
import toast from 'react-hot-toast';
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from 'react-markdown';
import AppCard from "@/components/app/AppCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from 'next/link';
import Image from "next/image";
import Markdown from "@/components/Markdown";
import AnalyticsSection from "@/components/app/AnalyticsSection";
import MetaFooter from "@/components/app/MetaFooter";
import StickyNav from "@/components/app/StickyNav";
import { Section } from "@/components/ui/section";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { RateDialog } from "@/components/app/RateDialog";
import { useIsMobile } from "@/lib/feature-flags";

interface ExtendedCategory extends Category {
  isCustom?: boolean;
}

interface ExtendedChain {
  id: string;
  name: string;
  isCustom?: boolean;
}

export default function EditAppPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    logo_url: "",
    short_desc: "",
    long_desc: "",
    websiteUrl: "",
    github_url: "",
    docs_url: "",
    audit_reports: "",
    markdown_content: "",
    analytics_list: "",
    categories: [] as string[],
    chains: [] as string[],
  });
  const [mounted, setMounted] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNewApp, setIsNewApp] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [originalApp, setOriginalApp] = useState<Product | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const isMobile = useIsMobile();
  
  // AI assistance states
  const [aiLoading, setAiLoading] = useState({
    short_desc: false,
    long_desc: false,
    markdown_content: false,
  });

  // Draft save functionality
  const saveDraft = () => {
    const draftKey = isNewApp ? 'ethapplist_draft' : `ethapplist_draft_${params?.id}`;
    localStorage.setItem(draftKey, JSON.stringify(formData));
    toast.success("Draft saved! 💾 Your progress has been saved locally");
  };

  const loadDraft = () => {
    try {
      const draftKey = isNewApp ? 'ethapplist_draft' : `ethapplist_draft_${params?.id}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        setFormData(JSON.parse(saved));
        toast.success("Draft loaded! 📄 Your previous work has been restored");
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      logo_url: "",
      short_desc: "",
      long_desc: "",
      websiteUrl: "",
      github_url: "",
      docs_url: "",
      audit_reports: "",
      markdown_content: "",
      analytics_list: "",
      categories: [],
      chains: [],
    });
    const draftKey = isNewApp ? 'ethapplist_draft' : `ethapplist_draft_${params?.id}`;
    localStorage.removeItem(draftKey);
    setCategorySearch("");
    setChainSearch("");
    setShowCategorySearch(false);
    setShowChainSearch(false);
    toast.success("Form reset! 🔄 All fields have been cleared");
  };

  // Category and chain search states
  const [categorySearch, setCategorySearch] = useState("");
  const [chainSearch, setChainSearch] = useState("");
  const [showCategorySearch, setShowCategorySearch] = useState(false);
  const [showChainSearch, setShowChainSearch] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<ExtendedCategory[]>([]);
  const [availableChains, setAvailableChains] = useState<ExtendedChain[]>([]);

  // Default categories and chains
  const defaultCategories: ExtendedCategory[] = [
    { id: "DeFi", name: "DeFi", description: "Decentralized Finance" },
    { id: "Exchanges", name: "Exchanges", description: "Trading platforms" },
    { id: "Infrastructure", name: "Infrastructure", description: "Blockchain infrastructure" },
    { id: "DAO", name: "DAO", description: "Decentralized Autonomous Organizations" },
    { id: "NFT", name: "NFT", description: "Non-Fungible Tokens" },
    { id: "Gaming", name: "Gaming", description: "Blockchain gaming" },
    { id: "Social", name: "Social", description: "Social platforms" },
    { id: "Privacy", name: "Privacy", description: "Privacy tools and protocols" },
  ];

  const defaultChains: ExtendedChain[] = [
    { id: "Ethereum", name: "Ethereum" },
    { id: "Polygon", name: "Polygon" },
    { id: "Arbitrum", name: "Arbitrum" },
    { id: "Optimism", name: "Optimism" },
    { id: "Base", name: "Base" },
    { id: "Avalanche", name: "Avalanche" },
    { id: "BSC", name: "BSC" },
  ];

  // Conceptual mapping for categories
  const categoryConceptMap: Record<string, string[]> = {
    "DeFi": ["finance", "defi", "trading", "swap", "dex", "yield", "farming", "liquidity", "protocol"],
    "Exchanges": ["exchange", "trading", "cex", "dex", "swap", "market", "orderbook"],
    "Infrastructure": ["infrastructure", "node", "rpc", "api", "tools", "developer", "sdk"],
    "NFT": ["nft", "collectible", "art", "digital", "token", "marketplace"],
    "Gaming": ["game", "gaming", "play", "metaverse", "virtual", "p2e"],
    "DAO": ["dao", "governance", "voting", "community", "collective"],
    "Social": ["social", "community", "chat", "messaging", "network"],
    "Lending": ["lending", "borrow", "loan", "credit", "interest", "collateral"]
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: 'categories' | 'chains', checked: boolean | "indeterminate", id: string) => {
    // Block Solana with a fun toast - check both custom and the name itself
    if (name === 'chains') {
      const chainName = id;
      if (chainName.toLowerCase().includes('solana')) {
        toast.error("Hold up! 🤚 It's called ETH app list not solana app list 🤪");
        return;
      }
    }

    setFormData((prev) => {
      const currentList = prev[name];
      const newData = { ...prev };
      
      const isCustom = name === 'categories' 
        ? !defaultCategories.some(c => c.id === id)
        : !defaultChains.some(c => c.id === id);

      if (checked === true) {
        newData[name] = Array.from(new Set([...currentList, id]));
        
        // Add custom items to the visible lists
        if (isCustom) {
          const customName = id;
          if (name === 'categories') {
            setAvailableCategories(prevCats => {
              if (!prevCats.some(cat => cat.id === id)) {
                return [...prevCats, { id, name: customName, description: "Custom category", isCustom: true }];
              }
              return prevCats;
            });
          } else {
            setAvailableChains(prevChains => {
              if (!prevChains.some(chain => chain.id === id)) {
                return [...prevChains, { id, name: customName, isCustom: true }];
              }
              return prevChains;
            });
          }
        }
      } else {
        newData[name] = currentList.filter(itemId => itemId !== id);
        
        // Remove custom items from visible lists when unchecked, but only if they are not part of the original app data
        if (isCustom) {
          const isOriginal = originalApp 
            ? (name === 'categories' 
                ? originalApp.categories.some(c => c.name === id)
                : originalApp.chains.some(c => c.name === id))
            : false;

          if (!isOriginal) {
            if (name === 'categories') {
              setAvailableCategories(prevCats => prevCats.filter(cat => cat.id !== id));
            } else {
              setAvailableChains(prevChains => prevChains.filter(chain => chain.id !== id));
            }
          }
        }
      }
      
      return newData;
    });
  };

  // AI assistance function
  const generateWithAI = async (field: 'short_desc' | 'long_desc' | 'markdown_content') => {
    if (!isAdmin) return;
    
    setAiLoading(prev => ({ ...prev, [field]: true }));
    
    try {
      const context = {
        title: formData.title,
        website: formData.websiteUrl,
        short_desc: formData.short_desc,
        long_desc: formData.long_desc,
        current_content: formData[field],
      };

      const appContext = `

CONTEXT: You are helping create content for EthAppList, a community-driven directory of Ethereum ecosystem apps. EthAppList serves as a curated platform where users can discover, explore, and contribute to the growing Web3/Ethereum ecosystem. The goal is to create high-quality, informative content that helps users understand what each app does, its value proposition, and how it fits into the broader Ethereum landscape.

Current app information:
- Title: ${context.title}
- Website: ${context.website}
- Short Description: ${context.short_desc}
- Long Description: ${context.long_desc}
- Current ${field} content: ${context.current_content}
`;

      let prompt = "";
      if (field === 'short_desc') {
        prompt = `${appContext}

TASK: Create a compelling short tagline/description (max 150 characters) for this Ethereum ecosystem app that will appear on EthAppList. The tagline should be:
- Clear and concise about what the app does
- Appealing to both developers and end users
- Focused on the app's main value proposition
- Professional but accessible

Return only the tagline, no extra text or quotes.`;
      } else if (field === 'long_desc') {
        prompt = `${appContext}

TASK: Create a detailed long description (2-3 paragraphs) for this Ethereum ecosystem app's EthAppList listing. The description should:
- Explain clearly what the app does and its main purpose
- Highlight key features and capabilities
- Explain why it's valuable to the Ethereum ecosystem
- Be informative but engaging for both technical and non-technical users
- Position the app within the broader Web3/DeFi landscape

Return only the description content, no extra formatting or quotes.`;
      } else {
        prompt = `${appContext}

TASK: Create comprehensive markdown content for this app's detailed page on EthAppList. This content will help users deeply understand the app. Include:

# App Overview
(Clear explanation of what the app is and does)

## Key Features  
(Main capabilities and selling points)

## How It Works
(Technical overview accessible to developers)

## Getting Started
(How users can begin using the app)

## Use Cases
(Real-world applications and benefits)

## Technical Details
(Architecture, integrations, protocols used if applicable)

Make it detailed, professional, and informative - suitable for developers, investors, and users exploring the Ethereum ecosystem. Return only the markdown content.`;
      }

      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          field,
          context,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: result.content
      }));

      toast.success(`Content generated! ✨ AI has generated content for ${field.replace('_', ' ')}`);

    } catch (error) {
      console.error('AI generation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Generation failed: ${errorMessage}`);
    } finally {
      setAiLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  // Fuzzy search functions
  const getLevenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const searchCategories = useMemo(() => {
    if (!categorySearch.trim()) return defaultCategories;
    
    const searchTerm = categorySearch.toLowerCase().trim();
    const results: ExtendedCategory[] = [];
    
    // Exact matches first
    const exactMatches = defaultCategories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm)
    );
    results.push(...exactMatches);
    
    // Conceptual matches
    for (const [category, concepts] of Object.entries(categoryConceptMap)) {
      if (concepts.some(concept => concept.includes(searchTerm) || searchTerm.includes(concept))) {
        const categoryObj = defaultCategories.find(c => c.name === category);
        if (categoryObj && !results.find(r => r.id === categoryObj.id)) {
          results.push(categoryObj);
        }
      }
    }
    
    // Add option to create new category (preserve original capitalization)
    if (!results.some(r => r.name.toLowerCase() === searchTerm)) {
      results.push({
        id: categorySearch,
        name: categorySearch,
        description: "Custom category",
        isCustom: true
      });
    }
    
    return results;
  }, [categorySearch]);

  const searchChains = useMemo(() => {
    if (!chainSearch.trim()) return defaultChains;
    
    const searchTerm = chainSearch.toLowerCase().trim();
    const results: ExtendedChain[] = [];
    
    // Fuzzy search based on string similarity
    const fuzzyMatches = defaultChains
      .map(chain => ({
        ...chain,
        distance: getLevenshteinDistance(searchTerm, chain.name.toLowerCase())
      }))
      .filter(chain => chain.distance <= 3)
      .sort((a, b) => a.distance - b.distance)
      .map(({ distance, ...chain }) => chain);
    
    results.push(...fuzzyMatches);
    
    // Add option to create new chain (preserve original capitalization)
    if (!results.some(r => r.name.toLowerCase() === searchTerm)) {
      results.push({
        id: chainSearch,
        name: chainSearch,
        isCustom: true
      });
    }
    
    return results;
  }, [chainSearch]);

  // Load existing app data if editing
  const loadExistingApp = async (appId: string) => {
    try {
      setIsLoadingApp(true);
      const product = await getProductById(appId);
      setOriginalApp(product);
      
      // Populate form with existing app data
      setFormData({
        title: product.title || "",
        logo_url: product.logo_url || "",
        short_desc: product.short_desc || "",
        long_desc: product.long_desc || "",
        websiteUrl: product.website_url || "",
        github_url: product.github_url || "",
        docs_url: product.docs_url || "",
        audit_reports: Array.isArray(product.audit_reports) ? product.audit_reports.join('\n') : "",
        markdown_content: product.markdown_content || "",
        analytics_list: Array.isArray(product.analytics_list) ? product.analytics_list.join('\n') : "",
        categories: (product.categories || []).map(cat => cat.name),
        chains: (product.chains || []).map(chain => chain.name),
      });
    } catch (error: any) {
      console.error('Failed to load app:', error);
      let errorMessage = "Failed to load app.";
      if (error.response?.status === 401) {
        errorMessage = "You are not authorized to edit this app.";
      } else if (error.response?.status === 404) {
        errorMessage = "App not found.";
      }
      toast.error(errorMessage);
      router.push('/');
    } finally {
      setIsLoadingApp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error("Authentication required - You need to connect your wallet to submit a app");
      return;
    }

    if (!formData.title || !formData.short_desc || !formData.long_desc || !formData.logo_url || !formData.websiteUrl) {
      toast.error("Missing required fields - Please fill in Title, Logo URL, Short Description, Long Description, and Website URL.");
      return;
    }
    if (formData.categories.length === 0 || formData.chains.length === 0) {
        toast.error("Missing selections - Please select at least one category and one chain.");
        return;
    }

    setIsSubmitting(true);

    // Prepare categories and chains, handling custom entries
    const mapToIdObject = (items: string[]) => items.map(id => ({ id }));

    const submissionData = {
        ...formData,
        website_url: formData.websiteUrl,
        github_url: formData.github_url || null,
        docs_url: formData.docs_url || null,
        audit_reports: formData.audit_reports.split('\n').filter(line => line.trim() !== ''),
        analytics_list: formData.analytics_list.split('\n').filter(line => line.trim() !== ''),
        categories: mapToIdObject(formData.categories),
        chains: mapToIdObject(formData.chains),
        // Set default scores of 50
        security_score: 0.5,
        ux_score: 0.5,
        overall_score: 0.5,
        vibes_score: 0.5,
    };
    // Remove the old websiteUrl key
    delete (submissionData as any).websiteUrl;

    try {
      if (isNewApp) {
        // Creating new app
        await submitProduct(submissionData);
        toast.success("Success! Your app has been submitted for review");
        
        // Clear the draft since submission was successful
        localStorage.removeItem('ethapplist_draft');
        
        router.push("/success?type=new");
      } else {
        // Editing existing app
        const appId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
        
        const updateData = {
          product: {
            title: formData.title,
            short_desc: formData.short_desc,
            long_desc: formData.long_desc,
            logo_url: formData.logo_url,
            website_url: formData.websiteUrl,
            github_url: formData.github_url || null,
            docs_url: formData.docs_url || null,
            audit_reports: formData.audit_reports.split('\n').filter(line => line.trim() !== ''),
            markdown_content: formData.markdown_content,
            analytics_list: formData.analytics_list.split('\n').filter(line => line.trim() !== ''),
            security_score: 0.5,
            ux_score: 0.5,
            overall_score: 0.5,
            vibes_score: 0.5,
            categories: mapToIdObject(formData.categories),
            chains: mapToIdObject(formData.chains),
          },
          edit_summary: 'App details updated',
          minor_edit: false
        };

        if (isAdmin) {
          // Admins can directly update products
          await updateProduct(appId, updateData);
          toast.success("App updated successfully!");
        } else {
          // Regular users submit edits to approval queue
          await submitProductEdit(appId, updateData);
          toast.success("Edit submitted! Your changes have been submitted for approval.");
        }
        
        // Clear the edit draft
        localStorage.removeItem(`ethapplist_draft_${appId}`);
        
        router.push(`/success?type=edit`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error - There was an error submitting your app. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate preview data for the app card and full page preview
  const previewData = {
    id: isNewApp ? "preview" : (params?.id as string),
    title: formData.title || "Your App Name",
    short_desc: formData.short_desc || "Your app tagline will appear here",
    long_desc: formData.long_desc,
    logo_url: formData.logo_url || "/ethapplistlogo.svg",
    website_url: formData.websiteUrl,
    github_url: formData.github_url,
    docs_url: formData.docs_url,
    audit_reports: formData.audit_reports.split('\n').filter(line => line.trim() !== ''),
    markdown_content: formData.markdown_content,
    submitter_id: "",
    approved: true,
    is_verified: false,
    analytics_list: formData.analytics_list.split('\n').filter(line => line.trim() !== ''),
    security_score: 0.5,
    ux_score: 0.5,
    overall_score: 0.5,
    vibes_score: 0.5,
    created_at: "",
    updated_at: "",
    upvote_count: 0,
    current_revision_number: 1,
    categories: formData.categories.map(name => {
      const category = [...defaultCategories, ...availableCategories].find(c => c.name === name);
      return category ? { id: category.id, name: category.name, description: category.description || "" } : { id: name, name, description: "Custom category" };
    }),
    chains: formData.chains.map(name => {
      const chain = [...defaultChains, ...availableChains].find(c => c.name === name);
      return chain ? { id: chain.id, name: chain.name, icon: "" } : { id: name, name: name, icon: "" };
    }),
    submitter: {
      id: "",
      wallet_address: ""
    }
  };

  // Preview Components
  const PreviewLeftSidebar = (
    <div className="w-full md:w-1/4 self-start space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-xl font-bold mb-4">App Links</h3>
        <div className="space-y-2">
          {previewData.website_url && (
            <Button variant="outline" className="w-full justify-start gap-3" disabled>
              <Globe size={16} />
              Website
            </Button>
          )}
          {previewData.docs_url && (
            <Button variant="outline" className="w-full justify-start gap-3" disabled>
              <FileText size={16} />
              Docs
            </Button>
          )}
          {previewData.github_url && (
            <Button variant="outline" className="w-full justify-start gap-3" disabled>
              <Github size={16} />
              GitHub
            </Button>
          )}
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        <h3 className="text-xl font-bold mb-4">Community Scores</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <ProgressCircle value={(previewData.overall_score || 0) * 100} size={80} strokeWidth={8} />
            <p className="text-sm mt-2 text-center">Overall</p>
          </div>
          <div className="flex flex-col items-center">
            <ProgressCircle value={(previewData.security_score || 0) * 100} size={80} strokeWidth={8} />
            <p className="text-sm mt-2 text-center">Security</p>
          </div>
          <div className="flex flex-col items-center">
            <ProgressCircle value={(previewData.ux_score || 0) * 100} size={80} strokeWidth={8} />
            <p className="text-sm mt-2 text-center">UX</p>
          </div>
          <div className="flex flex-col items-center">
            <ProgressCircle value={(previewData.vibes_score || 0) * 100} size={80} strokeWidth={8} />
            <p className="text-sm mt-2 text-center">Vibes</p>
          </div>
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        <Button variant="outline" className="w-full justify-start gap-3" disabled>
          <Pencil size={16} />
          Propose an Edit
        </Button>
      </div>
    </div>
  );

  const PreviewMobileHeader = (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div className="flex justify-between items-start">
            <Image
                src={previewData.logo_url || '/placeholder-logos/opensea-logo.svg'}
                alt={`${previewData.title} logo`}
                width={80}
                height={80}
                className="rounded-lg"
            />
            <Button
                variant="outline"
                disabled
                className={`h-auto flex flex-col items-center gap-1 rounded-lg transition-all px-6 py-2 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600`}
            >
                <ChevronUp className="w-5 h-5" />
                <span className="text-base font-medium">0</span>
            </Button>
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{previewData.title}</h1>
            <p className="text-md italic text-gray-600 dark:text-gray-300 mt-1">{previewData.short_desc}</p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-2">{previewData.long_desc}</p>
    </div>
  );

  const PreviewDesktopHeader = (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 flex gap-8 items-start">
      <div className="flex-shrink-0">
        <Image
          src={previewData.logo_url || '/placeholder-logos/opensea-logo.svg'}
          alt={`${previewData.title} logo`}
          width={128}
          height={128}
          className="rounded-lg"
        />
      </div>
      <div className="flex-grow">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{previewData.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{previewData.short_desc}</p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{previewData.long_desc}</p>
      </div>
      <div className="flex-shrink-0">
        <Button
          variant="outline"
          disabled
          className={`h-auto flex flex-col items-center gap-2 rounded-lg transition-all px-7 py-2 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600`}
        >
          <ChevronUp className="w-5 h-5" />
          <span className="text-base font-medium">0</span>
        </Button>
      </div>
    </div>
  );

  const PreviewMainContent = (
    <>
      {previewData.markdown_content && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <Markdown content={previewData.markdown_content} />
        </div>
      )}
      {previewData.analytics_list && previewData.analytics_list.length > 0 && (
        <Section id="analytics">
          <AnalyticsSection dashboards={previewData.analytics_list} />
        </Section>
      )}
      <Section>
        <MetaFooter product={previewData} />
      </Section>
    </>
  );

  // Auto-save draft when form data changes
  useEffect(() => {
    if (mounted && (formData.title || formData.short_desc || formData.long_desc || formData.markdown_content)) {
      const timeoutId = setTimeout(() => {
        const draftKey = isNewApp ? 'ethapplist_draft' : `ethapplist_draft_${params?.id}`;
        localStorage.setItem(draftKey, JSON.stringify(formData));
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, mounted, isNewApp, params?.id]);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setPermissionLoading(true);
        const permissions = await getUserPermissions();
        
        // Fix key mismatch by using consistent camelCase
        const canAdd = permissions.canAdd;
        const adminAccess = permissions.isAdmin || permissions.isCurator;
        
        setHasPermission(canAdd || adminAccess);
        setIsAdmin(adminAccess);
      } catch (error) {
        console.error('Error checking permissions:', error);
        
        // Always allow submissions (they go for review anyway)
        setHasPermission(true);
        
        // For AI features, check if user is authenticated and assume they have access
        const authenticated = isAuthenticated();
        setIsAdmin(authenticated);
        
      } finally {
        setPermissionLoading(false);
      }
    };

    // Determine if this is a new app or editing existing
    const appId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const isNew = appId === 'new';
    setIsNewApp(isNew);

    // Load categories and chains
    setAvailableCategories(defaultCategories);
    setAvailableChains(defaultChains);

    // Load existing app data if editing
    if (!isNew && appId) {
      loadExistingApp(appId);
    } else {
      // Load saved draft for new apps
      loadDraft();
    }

    checkPermissions();
    setMounted(true);
  }, [params?.id]);

  // Show loading state while checking permissions or loading app
  if (!mounted || permissionLoading || (!isNewApp && isLoadingApp)) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            <p className="text-muted-foreground">
              {isNewApp ? "Checking permissions..." : "Loading app data..."}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Check if wallet is connected first
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Wallet Required</h1>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to {isNewApp ? 'add apps to' : 'edit apps on'} EthAppList.
            </p>
            <p className="text-sm text-gray-500">
              Your submissions will be reviewed before going live.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Only show access denied after permission check is complete
  if (hasPermission === false) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don&apos;t have permission to {isNewApp ? 'add apps' : 'edit this app'}. Please contact an administrator.
            </p>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-screen-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          {!isNewApp && (
            <Link 
              href={`/app/${params?.id}`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to app
            </Link>
          )}
          <h1 className="text-3xl font-bold mb-2">
            {isNewApp ? "Add Your App" : "Edit App"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isNewApp 
              ? "Fill in the details below to list your app. Your submission will be reviewed before going live."
              : `Update app information. All changes will be reviewed by staff before going live.`
            }
          </p>
          <p className="text-sm text-gray-500 mt-2">
            If you are a representative or creator of an app and want to become an admin for the project please contact <a href="https://x.com/wezabis" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">Wezabis</a> on X.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:h-[calc(100vh-12rem)]">
          {/* Left Column - Form */}
          <div className="space-y-6 overflow-y-auto pr-2 lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>App Details</CardTitle>
                    <CardDescription>Enter the basic information about your app</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={saveDraft}
                      className="text-xs"
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetForm}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-1">
                    App Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Your Awesome App"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="logo_url" className="mb-1">
                    Logo URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    required
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl" className="mb-1">
                    App Website URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://yourapp.com"
                    required
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="github_url" className="mb-1">
                    GitHub Repository URL (Optional)
                  </Label>
                  <Input
                    id="github_url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    placeholder="https://github.com/yourproject/repo"
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="docs_url" className="mb-1">
                    Documentation URL (Optional)
                  </Label>
                  <Input
                    id="docs_url"
                    name="docs_url"
                    value={formData.docs_url}
                    onChange={handleChange}
                    placeholder="https://docs.yourapp.com"
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="audit_reports" className="mb-1">
                    Audit Report URLs (Optional)
                  </Label>
                  <Textarea
                    id="audit_reports"
                    name="audit_reports"
                    value={formData.audit_reports}
                    onChange={handleChange}
                    placeholder="https://audit1.com/report.pdf&#10;https://audit2.com/report.pdf"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter one audit report URL per line.
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="short_desc">
                      Short Description / Tagline <span className="text-red-500">*</span>
                    </Label>
                    {isAdmin && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateWithAI('short_desc')}
                        disabled={aiLoading.short_desc}
                        className="h-7 px-2"
                      >
                        {aiLoading.short_desc ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="short_desc"
                    name="short_desc"
                    value={formData.short_desc}
                    onChange={handleChange}
                    placeholder="A catchy tagline for your app (max 150 chars)"
                    maxLength={150}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="long_desc">
                      Long Description <span className="text-red-500">*</span>
                    </Label>
                    {isAdmin && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateWithAI('long_desc')}
                        disabled={aiLoading.long_desc}
                        className="h-7 px-2"
                      >
                        {aiLoading.long_desc ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="long_desc"
                    name="long_desc"
                    value={formData.long_desc}
                    onChange={handleChange}
                    placeholder="Provide a more detailed overview of your app."
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
                <CardDescription>Choose categories and chains for your app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Categories */}
                  <div>
                    <Label className="mb-2 block">Categories <span className="text-red-500">*</span></Label>
                    <div className="space-y-2">
                      {availableCategories.map((category) => (
                        <div 
                          key={category.id} 
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                          onClick={() => {
                            const isCurrentlySelected = formData.categories.includes(category.id);
                            handleCheckboxChange('categories', !isCurrentlySelected, category.id);
                          }}
                        >
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={formData.categories.includes(category.id)}
                            onCheckedChange={(checked) => handleCheckboxChange('categories', checked, category.id)}
                          />
                          <Label htmlFor={`category-${category.id}`} className="font-normal cursor-pointer flex-1">
                            {category.name}
                            {category.isCustom && (
                              <span className="text-xs text-blue-600 ml-1 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">(custom)</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCategorySearch(!showCategorySearch)}
                        className="mb-2"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Custom Category
                      </Button>
                      
                      {showCategorySearch && (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={categorySearch}
                              onChange={(e) => setCategorySearch(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (categorySearch.trim()) {
                                    const customId = categorySearch.trim();
                                    handleCheckboxChange('categories', true, customId);
                                    setCategorySearch("");
                                    setShowCategorySearch(false);
                                  }
                                }
                              }}
                              placeholder="Search or type new category (e.g., 'lender' will suggest DeFi). Press Enter to add."
                              className="pl-10"
                            />
                          </div>
                          
                          {categorySearch && (
                            <div className="max-h-32 overflow-y-auto border rounded-md">
                              {searchCategories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                  onClick={() => {
                                    const isCurrentlySelected = formData.categories.includes(category.id);
                                    handleCheckboxChange('categories', !isCurrentlySelected, category.id);
                                    if (!isCurrentlySelected && category.isCustom) {
                                      setCategorySearch("");
                                      setShowCategorySearch(false);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    id={`search-category-${category.id}`}
                                    checked={formData.categories.includes(category.id)}
                                    onCheckedChange={(checked: boolean | "indeterminate") => {
                                      handleCheckboxChange('categories', checked, category.id);
                                      if (checked && category.isCustom) {
                                        setCategorySearch("");
                                        setShowCategorySearch(false);
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`search-category-${category.id}`} className="font-normal flex-1 cursor-pointer">
                                    {category.name}
                                    {category.isCustom && (
                                      <span className="text-xs text-blue-600 ml-1">(new)</span>
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chains */}
                  <div>
                    <Label className="mb-2 block">Chains <span className="text-red-500">*</span></Label>
                    <div className="space-y-2">
                      {availableChains.map((chain) => (
                        <div 
                          key={chain.id} 
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                          onClick={() => {
                            const isCurrentlySelected = formData.chains.includes(chain.id);
                            handleCheckboxChange('chains', !isCurrentlySelected, chain.id);
                          }}
                        >
                          <Checkbox
                            id={`chain-${chain.id}`}
                            checked={formData.chains.includes(chain.id)}
                            onCheckedChange={(checked) => handleCheckboxChange('chains', checked, chain.id)}
                          />
                          <Label htmlFor={`chain-${chain.id}`} className="font-normal cursor-pointer flex-1">
                            {chain.name}
                            {chain.isCustom && (
                              <span className="text-xs text-blue-600 ml-1 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">(custom)</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChainSearch(!showChainSearch)}
                        className="mb-2"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Custom Chain
                      </Button>
                      
                      {showChainSearch && (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={chainSearch}
                              onChange={(e) => setChainSearch(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (chainSearch.trim()) {
                                    const customId = chainSearch.trim();
                                    handleCheckboxChange('chains', true, customId);
                                    setChainSearch("");
                                    setShowChainSearch(false);
                                  }
                                }
                              }}
                              placeholder="Search or type new chain (e.g., 'Avalanch' will suggest Avalanche). Press Enter to add."
                              className="pl-10"
                            />
                          </div>
                          
                          {chainSearch && (
                            <div className="max-h-32 overflow-y-auto border rounded-md">
                              {searchChains.map((chain) => (
                                <div
                                  key={chain.id}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                  onClick={() => {
                                    const isCurrentlySelected = formData.chains.includes(chain.id);
                                    handleCheckboxChange('chains', !isCurrentlySelected, chain.id);
                                    if (!isCurrentlySelected && chain.isCustom) {
                                      setChainSearch("");
                                      setShowChainSearch(false);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    id={`search-chain-${chain.id}`}
                                    checked={formData.chains.includes(chain.id)}
                                    onCheckedChange={(checked: boolean | "indeterminate") => {
                                      handleCheckboxChange('chains', checked, chain.id);
                                      if (checked && chain.isCustom) {
                                        setChainSearch("");
                                        setShowChainSearch(false);
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`search-chain-${chain.id}`} className="font-normal flex-1 cursor-pointer">
                                    {chain.name}
                                    {chain.isCustom && (
                                      <span className="text-xs text-blue-600 ml-1">(new)</span>
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Content</CardTitle>
                <CardDescription>Add more detailed information about the app using Markdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="markdown_content">
                        Markdown Content
                      </Label>
                      {isAdmin && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => generateWithAI('markdown_content')}
                          disabled={aiLoading.markdown_content}
                          className="h-7 px-2"
                        >
                          {aiLoading.markdown_content ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="markdown_content"
                      name="markdown_content"
                      value={formData.markdown_content}
                      onChange={handleChange}
                      placeholder="# Your App Details&#10;&#10;## Features&#10;* Feature 1&#10;* Feature 2&#10;&#10;## How it Works&#10;Explain your app..."
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="analytics_list" className="mb-1">
                      Analytics Embeds (Optional)
                    </Label>
                    <Textarea
                      id="analytics_list"
                      name="analytics_list"
                      value={formData.analytics_list}
                      onChange={handleChange}
                      placeholder='<iframe src="https://dune.com/embeds/..."></iframe>'
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste iframe code for analytics dashboards (e.g., Dune), one per line.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isNewApp ? "Submitting..." : "Saving..."}
                </>
              ) : (
                isNewApp ? "Submit App" : (isAdmin ? "Update App" : "Submit Edit")
              )}
            </Button>
          </div>

          {/* Right Column - Live Preview */}
          <div className="space-y-6 overflow-y-auto pl-2 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your app will appear on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">App Card Preview</h3>
                    <AppCard product={previewData} />
                  </div>
                  
                  {/* Full App Page Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">Full App Page Preview</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreviewExpanded(true)}
                        className="h-7 px-2"
                      >
                        <Expand className="w-3 h-3 mr-1" />
                        Expand
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                      <div className="max-h-[800px] overflow-y-auto p-4">
                        {isMobile ? (
                          <div className="space-y-8">
                            {PreviewMobileHeader}
                            {PreviewLeftSidebar}
                            <div className="space-y-8">{PreviewMainContent}</div>
                          </div>
                        ) : (
                          <div className="flex flex-row gap-8">
                            {PreviewLeftSidebar}
                            <div className="w-full md:w-3/4 space-y-8">
                              {PreviewDesktopHeader}
                              {PreviewMainContent}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!formData.title && !formData.short_desc && !formData.long_desc && !formData.markdown_content && (
                    <div className="text-center py-8 text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p>Start filling in the form to see a live preview of your app</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Expanded Preview Dialog */}
      <Dialog open={isPreviewExpanded} onOpenChange={setIsPreviewExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] h-[80vh] p-0 border-2 border-gray-300 dark:border-gray-600 flex flex-col">
          <DialogHeader className="p-4 border-b bg-gray-50 dark:bg-gray-800 shrink-0">
            <DialogTitle className="text-lg font-semibold">App Preview - Full Size</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 min-h-0">
            <div className="container max-w-7xl mx-auto px-4 py-8">
              {isMobile ? (
                <div className="space-y-8">
                  {PreviewMobileHeader}
                  {PreviewLeftSidebar}
                  <div className="space-y-8">{PreviewMainContent}</div>
                </div>
              ) : (
                <div className="flex flex-row gap-8">
                  {PreviewLeftSidebar}
                  <div className="w-full md:w-3/4 space-y-8">
                    {PreviewDesktopHeader}
                    {PreviewMainContent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
} 