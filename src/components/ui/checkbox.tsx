"use client"

import * as React from "react"
import { cn } from "@/lib/utils" // Make sure you have this utility

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, indeterminate, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(ref, internalRef);

    // Handle the indeterminate state
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate === true;
      }
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <div className="relative inline-block">
        <input
          type="checkbox"
          ref={combinedRef}
          checked={checked}
          onChange={handleChange}
          className={cn(
            "peer sr-only",
            className
          )}
          {...props}
        />
        <div 
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-gray-300 dark:border-gray-600",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            checked 
              ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500" 
              : "bg-white dark:bg-gray-800",
          )}
        >
          {checked && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-white" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
          {indeterminate && !checked && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-blue-600 dark:text-blue-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

// Helper function to combine refs
function useCombinedRefs<T>(...refs: React.Ref<T>[]) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

export { Checkbox } 