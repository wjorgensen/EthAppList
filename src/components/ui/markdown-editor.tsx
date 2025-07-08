"use client";

import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit, Split, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@/lib/theme';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  label?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your markdown content...",
  height = 400,
  label = "Content"
}: MarkdownEditorProps) {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<any>(null);

  // Monaco editor theme based on current theme
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineHeight: 20,
      padding: { top: 16, bottom: 16 },
      wordWrap: 'on',
      wrappingIndent: 'indent',
      automaticLayout: true,
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const editorContainerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" 
    : "";

  const editorHeight = isFullscreen ? "100vh" : height;

  return (
    <div className={editorContainerClass}>
      <Card className={isFullscreen ? "h-full rounded-none" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <div className="flex items-center gap-2">
              {/* View Mode Toggles */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Button
                  variant={viewMode === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('edit')}
                  className="rounded-none px-3 py-1.5 h-auto"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  className="rounded-none px-3 py-1.5 h-auto border-x border-gray-200 dark:border-gray-700"
                >
                  <Split className="w-3 h-3 mr-1" />
                  Split
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('preview')}
                  className="rounded-none px-3 py-1.5 h-auto"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>
              
              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="px-2 py-1.5 h-auto"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className={`flex ${viewMode === 'split' ? 'divide-x divide-gray-200 dark:divide-gray-700' : ''}`}>
            {/* Editor Pane */}
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} relative`}>
                <Editor
                  height={editorHeight}
                  language="markdown"
                  value={value}
                  onChange={(newValue) => onChange(newValue || '')}
                  theme={monacoTheme}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineHeight: 20,
                    padding: { top: 16, bottom: 16 },
                    wordWrap: 'on',
                    wrappingIndent: 'indent',
                    automaticLayout: true,
                    placeholder: placeholder,
                  }}
                />
                {!value && (
                  <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none text-sm">
                    {placeholder}
                  </div>
                )}
              </div>
            )}
            
            {/* Preview Pane */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto`} style={{ height: editorHeight }}>
                <div className="p-6">
                  {value ? (
                    <div className="prose dark:prose-invert max-w-none prose-sm">
                      <ReactMarkdown>{value}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 italic text-sm">
                      Start typing to see a live preview...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Helper Text */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can use{' '}
              <a 
                href="https://www.markdownguide.org/basic-syntax/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Markdown syntax
              </a>
              {' '}for formatting. Use **bold**, *italic*, `code`, lists, links, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 