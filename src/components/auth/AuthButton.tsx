"use client";

import { useToast } from "../../hooks/use-toast";
import { authenticateWithWallet, isAuthenticated, logout } from "@/lib/auth";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";

interface AuthButtonProps {
  onAuthChange?: (authenticated: boolean) => void;
}

export default function AuthButton({ onAuthChange }: AuthButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();

  // Handle authentication with signature
  const handleAuthenticate = useCallback(async () => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAuthenticating(true);
      
      // Message to sign
      const message = `Sign this message to authenticate with EthAppList\nWallet address: ${address}\nTimestamp: ${Date.now()}`;
      
      console.log('Requesting signature for message:', message);
      
      // Request signature from user
      const signature = await signMessageAsync({ message });
      
      console.log('Signature received:', signature);
      
      // Send to backend for verification
      const token = await authenticateWithWallet(address, signature, message);
      
      setAuthenticated(true);
      if (onAuthChange) {
        onAuthChange(true);
      }
      
      toast({
        title: "Authentication successful",
        description: "Your wallet has been authenticated.",
      });
    } catch (error) {
      console.error("Authentication error:", error);
      
      // More specific error handling
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
          toast({
            title: "Authentication cancelled",
            description: "You cancelled the wallet signature request.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication failed",
            description: errorMessage || "Failed to authenticate your wallet. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Authentication failed",
          description: "Failed to authenticate your wallet. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, toast, onAuthChange]);

  // Check if user is already authenticated
  useEffect(() => {
    setMounted(true);
    const authStatus = isAuthenticated();
    setAuthenticated(authStatus);
  }, []);

  // Only call onAuthChange when authentication status actually changes
  useEffect(() => {
    if (mounted && onAuthChange) {
      onAuthChange(authenticated);
    }
  }, [mounted, authenticated, onAuthChange]);

  // Auto-authenticate when wallet is connected but not authenticated
  useEffect(() => {
    if (mounted && isConnected && !authenticated && !isAuthenticating && address) {
      // Add a small delay to ensure wallet is fully initialized
      const timer = setTimeout(() => {
        handleAuthenticate();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mounted, isConnected, authenticated, isAuthenticating, address]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    disconnect();
    logout();
    setAuthenticated(false);
    if (onAuthChange) {
      onAuthChange(false);
    }
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }, [disconnect, toast, onAuthChange]);

  // Prevent hydration issues
  if (!mounted) {
    return <Button variant="outline">Connect</Button>;
  }

  // If authenticated, show the disconnect button
  if (authenticated) {
    return (
      <Button
        variant="outline"
        className="bg-black text-white hover:bg-gray-800 border-black"
        onClick={handleDisconnect}
      >
        Disconnect
      </Button>
    );
  }

  // Use RainbowKit ConnectButton with custom styling
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted: rainbowKitMounted,
      }) => {
        return (
          <div
            {...(!rainbowKitMounted && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-black text-white hover:bg-gray-800 border-black"
                  >
                    Connect Wallet
                  </Button>
                );
              }
              
              if (isAuthenticating) {
                return (
                  <Button
                    className="bg-black text-white hover:bg-gray-800 border-black"
                    disabled={true}
                  >
                    Authenticating...
                  </Button>
                );
              }
              
              // This should never appear because of the auto-authenticate effect,
              // but keeping it as a fallback
              return (
                <Button
                  onClick={handleAuthenticate}
                  className="bg-black text-white hover:bg-gray-800 border-black"
                >
                  Authenticate
                </Button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
} 