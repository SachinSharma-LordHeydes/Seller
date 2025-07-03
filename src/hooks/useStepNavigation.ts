"use client";

import { useState, useCallback } from "react";

export interface Step {
  id: number;
  title: string;
  description: string;
}

export interface UseStepNavigationProps {
  steps: Step[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
}

export const useStepNavigation = ({ 
  steps, 
  initialStep = 1, 
  onStepChange 
}: UseStepNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= steps.length) {
      setCurrentStep(step);
      onStepChange?.(step);
    }
  }, [steps.length, onStepChange]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, steps.length, onStepChange]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, onStepChange]);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;
  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps[currentStep - 1];

  return {
    currentStep,
    currentStepData,
    isFirstStep,
    isLastStep,
    progress,
    goToStep,
    nextStep,
    prevStep,
  };
};
