"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Check, X, AlertCircle, Trash2, Eye, Calendar, TrendingUp, Users, Activity, Clock, Filter, Search, Shield, History } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPendingEdits, approveEdit, rejectEdit, PendingEdit, getRecentEdits } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    
    // Check authentication and curator permissions
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    // Load pending edits from API
    loadPendingEdits();
    loadRecentEdits();
  }, [router]);

  const loadPendingEdits = async () => {
    try {
      setLoading(true);
      const edits = await getPendingEdits();
      setPendingEdits(edits);
      setFilteredEdits(edits);
    } catch (error) {
      console.error('Failed to load pending edits:', error);
      // If user doesn't have admin permissions, show error message
      if ((error as any).response?.status === 403) {
        alert('You do not have curator permissions to access this page.');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRecentEdits = async () => {
    try {
      const edits = await getRecentEdits({ limit: 10 });
      setRecentEdits(edits);
    } catch (error) {
      console.error('Error loading recent edits:', error);
    }
  };

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
      await approveEdit(editId);
      
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
      await rejectEdit(editId);
      
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
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                View Change Data
                              </summary>
                              <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto max-h-32">
                                {edit.change_data || 'No change data available'}
                              </pre>
                            </details>
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
                  This section will show all projects you've approved.
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