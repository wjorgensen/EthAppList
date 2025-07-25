"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Check, X, AlertCircle, Trash2, Eye, Calendar, TrendingUp, Users, Activity, Clock, Filter, Search, Shield, History, ArrowLeft, ExternalLink, Maximize2 } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPendingChanges, approvePendingChange, rejectPendingChange, PendingEdit, getRecentEdits, getProductPendingEdits, getProducts } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PendingProject {
  id: string;
  name: string;
  tagline: string;
  category: string;
  submitter_wallet: string;
  submitted_at: string;
  relation: 'team_member' | 'community_contributor' | 'other';
  website_url: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Add interface for parsed project data
interface ParsedProjectData {
  title?: string;
  short_desc?: string;
  long_desc?: string;
  logo_url?: string;
  websiteUrl?: string;
  categories?: { id: string }[];
  chains?: { id: string }[];
  [key: string]: any;
}

// Add function to parse change_data
const parseChangeData = (changeData: string): ParsedProjectData | null => {
  try {
    return JSON.parse(changeData);
  } catch (error) {
    console.error('Failed to parse change data:', error);
    return null;
  }
};

// Add component to display full page preview
const FullPagePreview = ({ parsedData }: { parsedData: ParsedProjectData }) => {
  // Helper function to render markdown-like content
  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mb-3">{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mb-2">{line.substring(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return <li key={index} className="ml-4">{line.substring(2)}</li>;
        } else if (line.trim() === '') {
          return <br key={index} />;
        } else {
          return <p key={index} className="mb-2">{line}</p>;
        }
      });
  };

  // Helper function to clean analytics URLs
  const formatAnalytics = (analytics: string[]) => {
    return analytics.map(item => {
      // Extract URL from iframe if it's an iframe tag
      const iframeMatch = item.match(/src="([^"]+)"/);
      if (iframeMatch) {
        const url = iframeMatch[1];
        const domain = url.split('/')[2] || url;
        return { url, display: domain };
      }
      // If it's already a clean URL
      if (item.startsWith('http')) {
        const domain = item.split('/')[2] || item;
        return { url: item, display: domain };
      }
      // Otherwise return as is
      return { url: item, display: item };
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-950">
      {/* Project Header */}
      <div className="flex items-start gap-6 mb-8">
        {parsedData.logo_url && (
          <div className="flex-shrink-0">
            <img 
              src={parsedData.logo_url} 
              alt={parsedData.title || 'Project logo'} 
              className="w-24 h-24 rounded-xl object-cover border-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            {parsedData.title || 'Untitled Project'}
          </h1>
          {parsedData.short_desc && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              {parsedData.short_desc}
            </p>
          )}
          <div className="flex items-center gap-4">
            {parsedData.websiteUrl && (
              <a 
                href={parsedData.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Categories and Chains */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Categories & Chains</h3>
        <div className="flex flex-wrap gap-3">
          {parsedData.categories?.map((cat, index) => (
            <span 
              key={index}
              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full font-medium"
            >
              {cat.id}
            </span>
          ))}
          {parsedData.chains?.map((chain, index) => (
            <span 
              key={index}
              className="px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full font-medium"
            >
              {chain.id}
            </span>
          ))}
        </div>
      </div>

      {/* Full Description */}
      {parsedData.long_desc && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Description</h3>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {parsedData.long_desc}
            </p>
          </div>
        </div>
      )}

      {/* Markdown Content */}
      {parsedData.markdown_content && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Detailed Content</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              {renderMarkdown(parsedData.markdown_content)}
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analytics */}
        {parsedData.analytics_list && parsedData.analytics_list.length > 0 && (
          <div>
            <h4 className="font-semibold text-black dark:text-white mb-3">Analytics & Tracking</h4>
            <div className="space-y-2">
              {formatAnalytics(parsedData.analytics_list).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    {item.display}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scores Preview */}
        <div>
          <h4 className="font-semibold text-black dark:text-white mb-3">Initial Scores</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Security</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${(parsedData.security_score || 0.5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round((parsedData.security_score || 0.5) * 100)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">UX</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${(parsedData.ux_score || 0.5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round((parsedData.ux_score || 0.5) * 100)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Decentralization</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-purple-500 rounded-full" 
                    style={{ width: `${(parsedData.overall_score || 0.5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round((parsedData.overall_score || 0.5) * 100)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Vibes</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-orange-500 rounded-full" 
                    style={{ width: `${(parsedData.vibes_score || 0.5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round((parsedData.vibes_score || 0.5) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add component to display project preview
const ProjectPreview = ({ edit }: { edit: PendingEdit }) => {
  const parsedData = parseChangeData(edit.change_data || '{}');
  
  if (!parsedData) {
    return (
      <div className="text-red-600 dark:text-red-400">
        Unable to parse project data
      </div>
    );
  }

  const isNewProject = edit.change_type === 'create';

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {parsedData.logo_url && (
            <div className="flex-shrink-0">
              <img 
                src={parsedData.logo_url} 
                alt={parsedData.title || 'Project logo'} 
                className="w-16 h-16 rounded-lg object-cover border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-black dark:text-white mb-1">
              {parsedData.title || 'Untitled Project'}
            </h4>
            {parsedData.short_desc && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                {parsedData.short_desc}
              </p>
            )}
            {parsedData.websiteUrl && (
              <a 
                href={parsedData.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                {parsedData.websiteUrl}
              </a>
            )}
          </div>
        </div>
        
        {/* Full Preview Button */}
        {isNewProject && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 flex-shrink-0">
                <Maximize2 className="w-3 h-3" />
                Full Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Full Page Preview - {parsedData.title}</DialogTitle>
              </DialogHeader>
              <FullPagePreview parsedData={parsedData} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Raw data collapsible for debugging */}
      <details className="cursor-pointer">
        <summary className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
          View Raw Data (Debug)
        </summary>
        <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto max-h-32">
          {edit.change_data || 'No change data available'}
        </pre>
      </details>
    </div>
  );
};

export default function CuratorDashboard() {
  const [mounted, setMounted] = useState(false);
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);
  const [filteredEdits, setFilteredEdits] = useState<PendingEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [relationFilter, setRelationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEdits, setRecentEdits] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await getProducts({ per_page: 1000 }); // Get all products
      setAvailableProducts(response.products);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast({
        title: "Failed to load products",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [toast]);

  const loadPendingEdits = useCallback(async () => {
    try {
      setLoading(true);
      let edits;
      
      if (selectedProductId === 'all') {
        // Use the new endpoint for all pending changes from Redis
        edits = await getPendingChanges();
      } else {
        // Use the new endpoint for specific product
        edits = await getProductPendingEdits(selectedProductId);
      }
      
      setPendingEdits(edits);
      setFilteredEdits(edits);
    } catch (error) {
      console.error('Failed to load pending edits:', error);
      // If user doesn't have admin permissions, show error message
      if ((error as any).response?.status === 403) {
        alert('You do not have curator permissions to access this page.');
        router.push('/');
      } else {
        toast({
          title: "Failed to load pending edits",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [router, selectedProductId, toast]);

  const loadRecentEdits = useCallback(async () => {
    try {
      const edits = await getRecentEdits({ limit: 10 });
      setRecentEdits(edits);
    } catch (error) {
      console.error('Error loading recent edits:', error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Check authentication and curator permissions
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    // Load products and pending edits from API
    loadProducts();
    loadPendingEdits();
    loadRecentEdits();
  }, [router, loadProducts, loadPendingEdits, loadRecentEdits]);

  // Reload pending edits when selected product changes
  useEffect(() => {
    if (mounted) {
      loadPendingEdits();
    }
  }, [selectedProductId, mounted, loadPendingEdits]);

  // Filter edits based on current filters
  useEffect(() => {
    let filtered = pendingEdits;

    // Filter by status/tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(edit => edit.status === 'pending');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(edit => edit.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(edit => edit.status === 'rejected');
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(edit => 
        edit.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        edit.change_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        edit.entity_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEdits(filtered);
  }, [pendingEdits, activeTab, searchQuery]);

  const handleApprove = async (editId: string) => {
    try {
      await approvePendingChange(editId);
      
      // Update local state for immediate feedback
      setPendingEdits(prev => 
        prev.map(edit => 
          edit.id === editId 
            ? { ...edit, status: 'approved' as const }
            : edit
        )
      );
      
      toast({
        title: "Edit approved successfully",
        description: "The edit has been approved and published.",
      });
    } catch (error) {
      console.error('Failed to approve edit:', error);
      toast({
        title: "Failed to approve edit", 
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (editId: string) => {
    try {
      await rejectPendingChange(editId);
      
      // Update local state for immediate feedback
      setPendingEdits(prev => 
        prev.map(edit => 
          edit.id === editId 
            ? { ...edit, status: 'rejected' as const }
            : edit
        )
      );
      
      toast({
        title: "Edit rejected successfully",
        description: "The edit has been rejected.",
      });
    } catch (error) {
      console.error('Failed to reject edit:', error);
      toast({
        title: "Failed to reject edit",
        description: "Please try again.", 
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case 'create':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'update':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold font-manrope text-black dark:text-white">
              Curator Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Review and moderate project submissions to maintain quality standards.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {loadingProducts ? (
                    <SelectItem value="loading" disabled>Loading products...</SelectItem>
                  ) : (
                    availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="DeFi">DeFi</SelectItem>
                  <SelectItem value="NFTs">NFTs</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="DAOs">DAOs</SelectItem>
                </SelectContent>
              </Select>

              <Select value={relationFilter} onValueChange={setRelationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Relations</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="community_contributor">Community Contributor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({filteredEdits.filter(p => p.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading pending submissions...</p>
              </div>
            ) : filteredEdits.filter(p => p.status === 'pending').length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No pending submissions found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredEdits.filter(p => p.status === 'pending').map((edit) => (
                  <Card key={edit.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-black dark:text-white">
                              {edit.entity_type}
                            </h3>
                            <span className={getStatusBadge(edit.status)}>
                              {edit.status}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {edit.change_type}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>Entity: <strong>{edit.entity_id}</strong></span>
                            <span>Created: {formatDate(edit.created_at)}</span>
                            <span>User: {edit.user_id}</span>
                          </div>
                          
                          <div className="mt-3">
                            <ProjectPreview edit={edit} />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-6">
                          <Button
                            onClick={() => handleApprove(edit.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(edit.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardContent className="text-center py-8">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Approved projects will appear here.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This section will show all projects you&apos;ve approved.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Project review history will appear here.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This section will show your complete moderation history.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 