"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { submitProduct, getCategories, Category, getUserPermissions } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

export default function AddProject() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    logo_url: "",
    short_desc: "",
    long_desc: "",
    websiteUrl: "",
    markdown_content: "",
    analytics_list: "",
    security_score: 75,
    ux_score: 75,
    decent_score: 75,
    vibes_score: 75,
    categories: [] as string[],
    chains: [] as string[],
  });
  const [mounted, setMounted] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] / 100 }));
  };

  const handleCheckboxChange = (name: 'categories' | 'chains', checked: boolean | "indeterminate", id: string) => {
    setFormData((prev) => {
      const currentList = prev[name];
      if (checked === true) {
        return { ...prev, [name]: Array.from(new Set([...currentList, id])) };
      } else {
        return { ...prev, [name]: currentList.filter(itemId => itemId !== id) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast({
        title: "Authentication required",
        description: "You need to connect your wallet to submit a project",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.short_desc || !formData.long_desc || !formData.logo_url || !formData.websiteUrl) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Title, Logo URL, Short Description, Long Description, and Website URL.",
        variant: "destructive",
      });
      return;
    }
    if (formData.categories.length === 0 || formData.chains.length === 0) {
        toast({
            title: "Missing selections",
            description: "Please select at least one category and one chain.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);

    const submissionData = {
        ...formData,
        analytics_list: formData.analytics_list.split('\n').filter(line => line.trim() !== ''),
        categories: formData.categories.map(id => ({ id })),
        chains: formData.chains.map(id => ({ id })),
    };

    console.log("Submitting Data:", submissionData);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success!",
        description: "Your project has been submitted for review",
        variant: "default",
      });
      
      router.push("/");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = [
    { id: "1", name: "DeFi" },
    { id: "2", name: "Exchanges" },
    { id: "3", name: "Infrastructure" },
    { id: "4", name: "NFT" },
    { id: "5", name: "Gaming" },
  ];

  const availableChains = [
    { id: "1", name: "Ethereum" },
    { id: "2", name: "Polygon" },
    { id: "3", name: "Arbitrum" },
    { id: "4", name: "Optimism" },
    { id: "5", name: "Base" },
  ];

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissions = await getUserPermissions();
        setHasPermission(permissions.canAdd || permissions.isAdmin || permissions.isCurator);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
      }
    };

    checkPermissions();
    setMounted(true);
  }, []);

  if (!hasPermission) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don&apos;t have permission to add projects. Please contact an administrator.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Add Your Project</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Fill in the details below to list your project.
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Core Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Your Awesome Project"
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
                      Project Website URL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="websiteUrl"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleChange}
                      placeholder="https://yourproject.com"
                      required
                      type="url"
                    />
                  </div>
                  <div>
                    <Label htmlFor="short_desc" className="mb-1">
                      Short Description / Tagline <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="short_desc"
                      name="short_desc"
                      value={formData.short_desc}
                      onChange={handleChange}
                      placeholder="A catchy tagline for your project (max 150 chars)"
                      maxLength={150}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="long_desc" className="mb-1">
                      Long Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="long_desc"
                      name="long_desc"
                      value={formData.long_desc}
                      onChange={handleChange}
                      placeholder="Provide a more detailed overview of your project."
                      rows={5}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                 <h2 className="text-xl font-semibold mb-4 border-b pb-2">Classification</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                         <Label className="mb-2 block">Categories <span className="text-red-500">*</span></Label>
                         <div className="space-y-2">
                            {availableCategories.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category.id}`}
                                        checked={formData.categories.includes(category.id)}
                                        onCheckedChange={(checked: boolean | "indeterminate") => handleCheckboxChange('categories', checked, category.id)}
                                    />
                                    <Label htmlFor={`category-${category.id}`} className="font-normal">
                                        {category.name}
                                    </Label>
                                </div>
                             ))}
                         </div>
                    </div>
                    <div>
                         <Label className="mb-2 block">Chains <span className="text-red-500">*</span></Label>
                          <div className="space-y-2">
                            {availableChains.map((chain) => (
                                <div key={chain.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`chain-${chain.id}`}
                                        checked={formData.chains.includes(chain.id)}
                                        onCheckedChange={(checked: boolean | "indeterminate") => handleCheckboxChange('chains', checked, chain.id)}
                                    />
                                    <Label htmlFor={`chain-${chain.id}`} className="font-normal">
                                        {chain.name}
                                    </Label>
                                </div>
                             ))}
                         </div>
                    </div>
                 </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detailed Content (Markdown)</h2>
                <MarkdownEditor
                  value={formData.markdown_content}
                  onChange={(value) => setFormData({...formData, markdown_content: value})}
                  placeholder="# Your Project Details&#10;&#10;## Features&#10;* Feature 1..."
                  height={500}
                  label="Project Content"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Project Scores (0-100)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <Label htmlFor="security_score" className="mb-2 block">Security Score: {formData.security_score * 100}</Label>
                        <Slider
                            id="security_score"
                            name="security_score"
                            defaultValue={[formData.security_score * 100]}
                            max={100} step={1}
                            onValueChange={(value: number[]) => handleSliderChange('security_score', value)}
                        />
                    </div>
                     <div>
                        <Label htmlFor="ux_score" className="mb-2 block">UX Score: {formData.ux_score * 100}</Label>
                        <Slider
                            id="ux_score"
                            name="ux_score"
                            defaultValue={[formData.ux_score * 100]}
                            max={100} step={1}
                            onValueChange={(value: number[]) => handleSliderChange('ux_score', value)}
                        />
                    </div>
                     <div>
                        <Label htmlFor="decent_score" className="mb-2 block">Decentralization Score: {formData.decent_score * 100}</Label>
                        <Slider
                             id="decent_score"
                            name="decent_score"
                            defaultValue={[formData.decent_score * 100]}
                            max={100} step={1}
                            onValueChange={(value: number[]) => handleSliderChange('decent_score', value)}
                        />
                    </div>
                     <div>
                        <Label htmlFor="vibes_score" className="mb-2 block">Vibes Score: {formData.vibes_score * 100}</Label>
                        <Slider
                             id="vibes_score"
                            name="vibes_score"
                            defaultValue={[formData.vibes_score * 100]}
                            max={100} step={1}
                            onValueChange={(value: number[]) => handleSliderChange('vibes_score', value)}
                        />
                    </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Analytics Embeds</h2>
                <div>
                  <Label htmlFor="analytics_list" className="mb-1">
                    Paste `&lt;iframe&gt;` code for analytics dashboards (e.g., Dune), one per line.
                  </Label>
                  <Textarea
                    id="analytics_list"
                    name="analytics_list"
                    value={formData.analytics_list}
                    onChange={handleChange}
                    placeholder='<iframe src="https://dune.com/embeds/..."></iframe>'
                    rows={4}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 