import { BarChart, ExternalLink } from "lucide-react";

interface AnalyticsSectionProps {
  dashboards: string[];
}

export default function AnalyticsSection({ dashboards }: AnalyticsSectionProps) {
  if (!dashboards?.length) return null;

  const extractIframeSrc = (iframeString: string): string => {
    // Handle iframe HTML strings
    if (iframeString.includes('<iframe') && iframeString.includes('src=')) {
      const srcMatch = iframeString.match(/src\s*=\s*["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }
    
    // If it's already a URL, return as-is
    if (iframeString.startsWith('http')) {
      return iframeString;
    }
    
    // Fallback
    return iframeString;
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart className="w-6 h-6 text-[#60C5FF]" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics & Dashboards
        </h2>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {dashboards.map((dashboard, index) => {
          const iframeUrl = extractIframeSrc(dashboard);
          
          return (
            <div 
              key={index} 
              className="group relative rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dashboard {index + 1}
                </span>
                <a 
                  href={iframeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[#60C5FF] hover:text-[#4A9FDD] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              </div>
              
              {/* Dashboard iframe */}
              <div className="relative bg-gray-100 dark:bg-gray-800">
                <iframe
                  src={iframeUrl}
                  className="w-full aspect-video border-0"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  title={`Analytics Dashboard ${index + 1}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
} 