"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Star } from "lucide-react";

export interface Scores {
  overall: number;
  security: number;
  ux: number;
  vibes: number;
}

interface RateDialogProps {
  onSubmit: (scores: Scores) => Promise<void>;
  isLoading?: boolean;
  triggerClassName?: string;
}

export function RateDialog({ onSubmit, isLoading = false, triggerClassName }: RateDialogProps) {
  const [scores, setScores] = useState<Scores>({
    overall: 50,
    security: 50,
    ux: 50,
    vibes: 50,
  });
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      // Convert scores from 0-100 range to 0-1 range for API
      const normalizedScores = {
        overall: scores.overall / 100,
        security: scores.security / 100,
        ux: scores.ux / 100,
        vibes: scores.vibes / 100,
      };
      
      await onSubmit(normalizedScores);
      setOpen(false);
      // Reset scores after successful submission
      setScores({
        overall: 50,
        security: 50,
        ux: 50,
        vibes: 50,
      });
    } catch (error) {
      console.error("Failed to submit scores:", error);
    }
  };

  const ScoreBar = (key: keyof Scores, label: string) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
          {scores[key]}
        </span>
      </div>
      <Slider
        value={[scores[key]]}
        onValueChange={(value) => 
          setScores(prev => ({ ...prev, [key]: value[0] }))
        }
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`flex items-center gap-2 ${triggerClassName || ""}`}>
          <Star className="w-4 h-4" />
          Rate App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-semibold mb-4">
          Rate this app
        </DialogTitle>
        
        <div className="space-y-6">
          {ScoreBar("overall", "Overall")}
          {ScoreBar("security", "Security")}
          {ScoreBar("ux", "UX")}
          {ScoreBar("vibes", "Vibes")}
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Ratings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 