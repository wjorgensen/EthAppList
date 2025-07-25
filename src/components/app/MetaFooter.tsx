import { Clock, Shield } from "lucide-react";
import { Product } from "@/lib/api";

interface MetaFooterProps {
  product: Product;
}

export default function MetaFooter({ product }: MetaFooterProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-12">
      <div className="flex flex-col md:flex-row justify-between gap-6 text-sm text-gray-600 dark:text-gray-400">
        {/* Left side - Submitter and Editor info */}
        <div className="space-y-2">
          {product.submitter && (
            <div className="flex items-center gap-2">
              <span>Submitted by</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                {product.submitter.wallet_address.slice(0, 6)}...{product.submitter.wallet_address.slice(-4)}
              </code>
            </div>
          )}
          
          {product.last_editor && product.last_editor.wallet_address !== product.submitter?.wallet_address && (
            <div className="flex items-center gap-2">
              <span>Last edited by</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                {product.last_editor.wallet_address.slice(0, 6)}...{product.last_editor.wallet_address.slice(-4)}
              </code>
            </div>
          )}
        </div>

        {/* Center - Audit Reports */}
        {product.audit_reports && product.audit_reports.length > 0 && (
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <div className="space-y-1">
              <span className="block text-emerald-600 dark:text-emerald-400 font-medium">Security Audited</span>
              <div className="flex flex-wrap gap-2">
                {product.audit_reports.map((auditUrl, index) => (
                  <a
                    key={index}
                    href={auditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    Audit Report {index + 1}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right side - Timestamps */}
        <div className="space-y-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <Clock className="w-3 h-3" />
            <span>Added {formatDate(product.created_at)}</span>
          </div>
          
          {product.updated_at !== product.created_at && (
            <div className="flex items-center justify-end gap-2">
              <Clock className="w-3 h-3" />
              <span>Updated {formatDate(product.updated_at)}</span>
            </div>
          )}
          
          {product.current_revision_number > 1 && (
            <div className="text-xs">
              Revision #{product.current_revision_number}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 