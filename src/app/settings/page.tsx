"use client";

import { useAccount } from 'wagmi';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Shield, 
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { isAuthenticated, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthenticated(isAuthenticated());
  }, []);

  const handleDisconnect = () => {
    logout();
    setAuthenticated(false);
    router.push('/');
  };

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-manrope mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and connected wallet.
          </p>
        </div>

        <div className="space-y-6">
          {/* Wallet Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {isConnected && authenticated ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Connected & Authenticated
                        </span>
                      </>
                    ) : isConnected ? (
                      <>
                        <X className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                          Connected but not authenticated
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          Not connected
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isConnected && address && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Wallet Address</Label>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mt-1">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleDisconnect}
                    className="w-full"
                  >
                    Disconnect Wallet
                  </Button>
                </>
              )}

              {!isConnected && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your wallet from any page to start submitting projects and upvoting.
                </p>
              )}
            </CardContent>
          </Card>



          {/* Future Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Identity & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Gitcoin Passport</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Verify your identity to prevent spam and bot voting
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Coming Soon
                </Button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  🔮 <strong>Coming in v1.1:</strong> Link your Gitcoin Passport to unlock unlimited voting and enhanced trust scoring.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 