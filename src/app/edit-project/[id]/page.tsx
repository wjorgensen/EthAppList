"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getProductById, updateProduct, getCategories, Product, Category, getUserPermissions } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

const CHAINS = [
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'arbitrum', name: 'Arbitrum' },
  { id: 'optimism', name: 'Optimism' },
  { id: 'polygon', name: 'Polygon' },
  { id: 'base', name: 'Base' },
];

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    short_desc: '',
    long_desc: '',
    logo_url: '',
    markdown_content: '',
    is_verified: false,
    analytics_list: [] as string[],
    security_score: 0,
    ux_score: 0,
    decent_score: 0,
    vibes_score: 0,
    categories: [] as string[],
    chains: [] as string[],
  });

  // Load project data and categories
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    loadProject();
    loadCategories();

    const checkPermissions = async () => {
      try {
        const permissions = await getUserPermissions();
        setHasPermission(permissions.canEdit || permissions.isAdmin || permissions.isCurator);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
      }
    };

    checkPermissions();
  }, [params?.id, router]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      if (!params?.id) return;
      
      const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
      const product = await getProductById(projectId);
      
      // Populate form with existing project data
      setFormData({
        title: product.title,
        short_desc: product.short_desc,
        long_desc: product.long_desc,
        logo_url: product.logo_url,
        markdown_content: product.markdown_content,
        is_verified: product.is_verified,
        analytics_list: product.analytics_list,
        security_score: product.security_score,
        ux_score: product.ux_score,
        decent_score: product.decent_score,
        vibes_score: product.vibes_score,
        categories: product.categories.map(cat => cat.id),
        chains: product.chains.map(chain => chain.id),
      });
      
      setProject(product);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast({
        title: "Error",
        description: "Failed to load project. You may not have permission to edit this project.",
        variant: "destructive",
      });
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleChainToggle = (chainId: string) => {
    setFormData(prev => ({
      ...prev,
      chains: prev.chains.includes(chainId)
        ? prev.chains.filter(id => id !== chainId)
        : [...prev.chains, chainId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.short_desc || !formData.logo_url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updateData = {
        product: {
          title: formData.title,
          short_desc: formData.short_desc,
          long_desc: formData.long_desc,
          logo_url: formData.logo_url,
          markdown_content: formData.markdown_content,
          analytics_list: formData.analytics_list,
          security_score: formData.security_score,
          ux_score: formData.ux_score,
          decent_score: formData.decent_score,
          vibes_score: formData.vibes_score,
          categories: formData.categories.map(id => ({ id })),
          chains: formData.chains.map(id => ({ id })),
        },
        edit_summary: 'Project details updated',
        minor_edit: false
      };

      const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
      await updateProduct(projectId, updateData);
      
      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
      
      router.push(`/projects/${params?.id}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasPermission) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to edit projects. Please contact an administrator.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The project you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/projects/${params?.id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to project
          </Link>
          <h1 className="text-3xl font-bold font-manrope mb-2">Edit Project</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your project information. All changes will be reviewed before going live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter project name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="short_desc" className="text-sm font-medium">
                  Short Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="short_desc"
                  value={formData.short_desc}
                  onChange={(e) => handleInputChange('short_desc', e.target.value)}
                  placeholder="Brief description of your project (1-2 sentences)"
                  className="mt-1 resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="logo_url" className="text-sm font-medium">
                  Logo URL
                </Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories <span className="text-red-500">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={formData.categories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.categories.length === 0 && (
                <p className="text-sm text-red-500 mt-2">Please select at least one category.</p>
              )}
            </CardContent>
          </Card>

          {/* Blockchains */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Blockchains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CHAINS.map((chain) => (
                  <div key={chain.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`chain-${chain.id}`}
                      checked={formData.chains.includes(chain.id)}
                      onCheckedChange={() => handleChainToggle(chain.id)}
                    />
                    <Label 
                      htmlFor={`chain-${chain.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {chain.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Description */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="long_desc" className="text-sm font-medium">
                  Long Description
                </Label>
                <Textarea
                  id="long_desc"
                  value={formData.long_desc}
                  onChange={(e) => handleInputChange('long_desc', e.target.value)}
                  placeholder="Detailed description of your project"
                  className="mt-1 resize-none"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="markdown_content" className="text-sm font-medium">
                  Markdown Content
                </Label>
                <Textarea
                  id="markdown_content"
                  value={formData.markdown_content}
                  onChange={(e) => handleInputChange('markdown_content', e.target.value)}
                  placeholder="Additional content in Markdown format"
                  className="mt-1 font-mono text-sm resize-none"
                  rows={12}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use Markdown syntax for formatting. See our{' '}
                  <Link href="/about" className="text-blue-600 hover:underline">
                    formatting guide
                  </Link>
                  .
                </p>
              </div>
              <MarkdownEditor
                value={formData.markdown_content}
                onChange={(value) => handleInputChange('markdown_content', value)}
                placeholder="Additional content in Markdown format"
                height={400}
                label="Markdown Content"
              />
            </CardContent>
          </Card>

          {/* Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Project Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="security_score" className="text-sm font-medium">
                    Security Score (0-100)
                  </Label>
                  <Input
                    id="security_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.security_score}
                    onChange={(e) => handleInputChange('security_score', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ux_score" className="text-sm font-medium">
                    UX Score (0-100)
                  </Label>
                  <Input
                    id="ux_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.ux_score}
                    onChange={(e) => handleInputChange('ux_score', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="decent_score" className="text-sm font-medium">
                    Decent Score (0-100)
                  </Label>
                  <Input
                    id="decent_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.decent_score}
                    onChange={(e) => handleInputChange('decent_score', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vibes_score" className="text-sm font-medium">
                    Vibes Score (0-100)
                  </Label>
                  <Input
                    id="vibes_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.vibes_score}
                    onChange={(e) => handleInputChange('vibes_score', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href={`/projects/${params?.id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 