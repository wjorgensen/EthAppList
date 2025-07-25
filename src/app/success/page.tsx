"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const submissionType = searchParams.get('type') || 'new'; // Default to 'new'

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout>
        <div className="min-h-screen pt-24 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mx-auto"></div>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                {submissionType === 'edit' ? "Edit Submitted!" : "Submission Successful! 🎉"}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {submissionType === 'edit' 
                  ? "Your changes have been submitted for review"
                  : "Your project has been submitted for review"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  What happens next?
                </h3>
                <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Our team will review your {submissionType === 'edit' ? 'changes' : 'submission'} for completeness and accuracy
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    We&apos;ll verify the project information and check for quality standards
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Once approved, your {submissionType === 'edit' ? 'changes' : 'project'} will go live on EthAppList
                  </li>
                </ul>
              </div>

              <div className="text-gray-600 dark:text-gray-400">
                <p className="mb-2">
                  <strong>Review time:</strong> Typically 1-3 business days
                </p>
                <p>
                  {submissionType === 'edit' 
                    ? "You can submit further edits if needed."
                    : "Need to make changes? You can edit your submission anytime after it goes live."
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/">
                  <Button className="w-full sm:w-auto" size="lg">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Homepage
                  </Button>
                </Link>
                <Link href="/edit-project/new">
                  <Button variant="outline" className="w-full sm:w-auto" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Another Project
                  </Button>
                </Link>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Questions about your submission? Contact our team at{" "}
                  <a 
                    href="mailto:support@ethapplist.com" 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    support@ethapplist.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 