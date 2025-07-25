"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Settings, Shield, Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AuthButton from "../../components/auth/AuthButton";
import { isAuthenticated } from "@/lib/auth";
import { getUserPermissions } from "@/lib/api";
import SearchOverlay from "../search/SearchOverlay";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication status and admin permissions on mount and handle changes
  useEffect(() => {
    const checkAuthAndPermissions = async () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);
      
      if (authStatus) {
        try {
          const permissions = await getUserPermissions();
          setIsAdmin(permissions.isAdmin);
        } catch (error) {
          console.warn('Failed to get user permissions:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAuthAndPermissions();
  }, []);

  // Handle CMD+K to open search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle authentication state changes without page reload
  const handleAuthChange = async (authStatus: boolean) => {
    setAuthenticated(authStatus);
    
    if (authStatus) {
      try {
        const permissions = await getUserPermissions();
        setIsAdmin(permissions.isAdmin);
      } catch (error) {
        console.warn('Failed to get user permissions:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-4 after:bg-gradient-to-b after:from-white/5 after:to-transparent dark:after:from-gray-950/5">
        <div className="container flex items-center justify-between h-16 max-w-7xl px-4 mx-auto">
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 mr-3">
              <Image 
                src="/ethapplistlogo.svg" 
                alt="EthAppList Logo"
                width={40} 
                height={40}
                priority
              />
            </div>
            <span className="text-xl font-semibold font-manrope">EthAppList</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 justify-center mx-4">
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-black dark:text-white" />
              </div>
              <Input
                className="pl-10 pr-4 py-3 w-full h-11 bg-white text-black border-black rounded-full"
                placeholder="Search"
                onClick={() => setIsSearchOpen(true)}
                readOnly
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {authenticated && (
              <Link href="/edit-app/new">
                <Button variant="outline" className="bg-white text-black border-black hover:bg-gray-100">
                  Add App
                </Button>
              </Link>
            )}
            
            {/* Auth and Settings Group */}
            <div className="flex items-center space-x-2">
              <AuthButton onAuthChange={handleAuthChange} />
              {authenticated && (
                <>
                  <Link href="/settings">
                    <Button variant="ghost" size="icon" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Settings className="w-5 h-5" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/curator">
                      <Button variant="ghost" size="icon" className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Shield className="w-5 h-5" />
                        <span className="sr-only">Curator Dashboard</span>
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="text-black dark:text-white"
            >
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black dark:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="container max-w-7xl mx-auto px-4 py-4 space-y-4">
              {authenticated ? (
                <>
                  <Link 
                    href="/edit-app/new" 
                    onClick={closeMobileMenu}
                    className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    Add App
                  </Link>
                  <Link 
                    href="/settings" 
                    onClick={closeMobileMenu}
                    className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    Settings
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/curator" 
                      onClick={closeMobileMenu}
                      className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                    >
                      Curator Dashboard
                    </Link>
                  )}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                    <AuthButton onAuthChange={handleAuthChange} />
                  </div>
                </>
              ) : (
                <div className="pt-2">
                  <AuthButton onAuthChange={handleAuthChange} />
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
} 