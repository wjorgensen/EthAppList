"use client"

import * as React from "react"
import { cn } from "@/lib/utils" // Make sure you have this utility

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  // The Radix UI slider used an array for values
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    className, 
    value, 
    defaultValue, 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1,
    ...props 
  }, ref) => {
    // Get the actual numeric value (first element if it's an array)
    const actualValue = value ? value[0] : undefined;
    const actualDefaultValue = defaultValue ? defaultValue[0] : undefined;
    
    // Calculate the percentage for the range track
    const percentage = actualValue !== undefined
      ? Math.max(0, Math.min(100, ((actualValue - min) / (max - min)) * 100))
      : actualDefaultValue !== undefined
        ? Math.max(0, Math.min(100, ((actualDefaultValue - min) / (max - min)) * 100))
        : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange?.([newValue]);
      props.onChange?.(e);
    };

    return (
      <div className="relative w-full flex items-center">
        <div className="relative w-full h-2">
          {/* Background track */}
          <div className="absolute inset-0 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
          
          {/* Filled track based on value */}
          <div 
            className="absolute inset-0 h-2 rounded-full bg-blue-600 dark:bg-blue-500" 
            style={{ width: `${percentage}%` }} 
          />
        </div>
        
        {/* Hidden native input for accessibility and control */}
        <input
          type="range"
          ref={ref}
          className={cn(
            "absolute inset-0 h-2 w-full cursor-pointer opacity-0",
            className
          )}
          min={min}
          max={max}
          step={step}
          value={actualValue}
          defaultValue={actualDefaultValue}
          onChange={handleChange}
          {...props}
        />
        
        {/* Thumb that follows the value */}
        <div 
          className="absolute w-5 h-5 rounded-full bg-white border-2 border-blue-600 dark:border-blue-500 pointer-events-none"
          style={{ 
            left: `calc(${percentage}% - 0.625rem)`, // Center the thumb (10px)
            top: "50%",
            transform: "translateY(-50%)"
          }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider } 