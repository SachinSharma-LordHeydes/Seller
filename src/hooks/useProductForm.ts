"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { debounce } from "@/lib/utils";
import { validateProductForm } from "@/lib/validation/schemas";
import { ProductStatus, type ProductFormData, type FormImageData, type FormVideoData } from "@/types";
import { PRODUCT_CONFIG } from "@/lib/constants";

export interface FormErrors {
  [key: string]: string;
}

export interface UseProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit?: (data: ProductFormData) => Promise<void>;
  autoSave?: boolean;
  autoSaveDelay?: number;
  validateOnChange?: boolean;
}

const getDefaultFormData = (): ProductFormData => ({
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  costPrice: "",
  sku: "",
  stock: "",
  status: ProductStatus.DRAFT,
  categoryId: "",
  images: [],
  videos: [],
  features: [],
  tags: [],
  weight: "",
  dimensions: "",
  shippingClass: "",
  returnPolicy: "",
  warranty: "",
  seoTitle: "",
  seoDescription: "",
});

export const useProductForm = ({
  initialData,
  onSubmit,
  autoSave = false,
  autoSaveDelay = 2000,
  validateOnChange = true,
}: UseProductFormProps = {}) => {
  // Initialize form data
  const [formData, setFormData] = useState<ProductFormData>(() => ({
    ...getDefaultFormData(),
    ...initialData,
  }));
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Memoized validation
  const validationResult = useMemo(() => {
    return validateProductForm(formData);
  }, [formData]);
  
  const isValid = validationResult.success;
  
  // Update errors when validation changes
  useEffect(() => {
    if (validateOnChange && !validationResult.success) {
      setErrors(validationResult.errors || {});
    } else if (validationResult.success) {
      setErrors({});
    }
  }, [validationResult, validateOnChange]);
  
  // Debounced auto-save
  const debouncedAutoSave = useMemo(
    () => debounce(async (data: ProductFormData) => {
      if (autoSave && onSubmit && isValid && isDirty) {
        try {
          await onSubmit(data);
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    }, autoSaveDelay),
    [autoSave, onSubmit, isValid, isDirty, autoSaveDelay]
  );
  
  // Trigger auto-save when form data changes
  useEffect(() => {
    if (isDirty) {
      debouncedAutoSave(formData);
    }
  }, [formData, isDirty, debouncedAutoSave]);
  
  // Generic field updater
  const updateField = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => {
      // Handle special cases for arrays
      if (field === "images" && Array.isArray(value)) {
        const cleanImages = value.filter(img => img != null);
        return { ...prev, [field]: cleanImages };
      }
      
      return { ...prev, [field]: value };
    });
    
    setIsDirty(true);
    
    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Batch field updater
  const updateFieldBatch = useCallback((updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    if (updatedFields.some(field => errors[field])) {
      setErrors(prev => {
        const newErrors = { ...prev };
        updatedFields.forEach(field => delete newErrors[field]);
        return newErrors;
      });
    }
  }, [errors]);
  
  // Image management
  const addImage = useCallback((image: FormImageData) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, image],
    }));
    setIsDirty(true);
  }, []);
  
  const removeImage = useCallback((index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      
      // If we removed the primary image, make the first image primary
      if (newImages.length > 0 && prev.images[index]?.isPrimary) {
        newImages[0].isPrimary = true;
      }
      
      return { ...prev, images: newImages };
    });
    setIsDirty(true);
  }, []);
  
  const updateImage = useCallback((index: number, updates: Partial<FormImageData>) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, ...updates } : img
      ),
    }));
    setIsDirty(true);
  }, []);
  
  const setPrimaryImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
    setIsDirty(true);
  }, []);
  
  // Video management
  const addVideo = useCallback((video: FormVideoData) => {
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, video],
    }));
    setIsDirty(true);
  }, []);
  
  const removeVideo = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  }, []);
  
  const updateVideo = useCallback((index: number, updates: Partial<FormVideoData>) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((video, i) => 
        i === index ? { ...video, ...updates } : video
      ),
    }));
    setIsDirty(true);
  }, []);
  
  // Feature management
  const addFeature = useCallback((feature: string, value: string) => {
    if (feature.trim() && value.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, { feature: feature.trim(), value: value.trim() }],
      }));
      setIsDirty(true);
    }
  }, []);
  
  const removeFeature = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  }, []);
  
  const updateFeature = useCallback((index: number, feature: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => 
        i === index ? { feature: feature.trim(), value: value.trim() } : f
      ),
    }));
    setIsDirty(true);
  }, []);
  
  // Validation functions
  const validateField = useCallback((field: keyof ProductFormData): boolean => {
    // Simple field validation
    const value = formData[field];
    let isValid = true;
    let errorMessage = '';
    
    switch (field) {
      case 'name':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          errorMessage = 'Product name is required';
          isValid = false;
        } else if (value.length > 100) {
          errorMessage = 'Product name must be less than 100 characters';
          isValid = false;
        }
        break;
      case 'description':
        if (!value || typeof value !== 'string' || value.trim().length < 10) {
          errorMessage = 'Product description must be at least 10 characters';
          isValid = false;
        }
        break;
      case 'price':
        if (!value || isNaN(parseFloat(value as string)) || parseFloat(value as string) <= 0) {
          errorMessage = 'Price must be a valid positive number';
          isValid = false;
        }
        break;
      case 'sku':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          errorMessage = 'SKU is required';
          isValid = false;
        }
        break;
      case 'stock':
        if (value === undefined || value === null || isNaN(parseInt(value as string)) || parseInt(value as string) < 0) {
          errorMessage = 'Stock must be a valid non-negative number';
          isValid = false;
        }
        break;
    }
    
    if (isValid) {
      // Clear field error if validation passes
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } else {
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
    
    return isValid;
  }, [formData, errors]);
  
  const validateAll = useCallback((): boolean => {
    const result = validateProductForm(formData);
    
    if (!result.success) {
      setErrors(result.errors || {});
      return false;
    }
    
    setErrors({});
    return true;
  }, [formData]);
  
  // Form submission
  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      if (!validateAll()) {
        throw new Error("Form validation failed");
      }
      
      await onSubmit(formData);
      setIsDirty(false);
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || "Submission failed",
      }));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validateAll]);
  
  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ ...getDefaultFormData(), ...initialData });
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialData]);
  
  // Computed values
  const progress = useMemo(() => {
    const requiredFields = ['name', 'description', 'price', 'sku', 'stock', 'categoryId'];
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof ProductFormData];
      return value && String(value).trim() !== '';
    });
    
    // Add points for optional but valuable fields
    let bonus = 0;
    if (formData.images.length >= PRODUCT_CONFIG.minImages) bonus += 10;
    if (formData.features.length > 0) bonus += 5;
    if (formData.videos.length > 0) bonus += 5;
    if (formData.seoTitle) bonus += 5;
    if (formData.seoDescription) bonus += 5;
    
    const baseProgress = (filledFields.length / requiredFields.length) * 70;
    return Math.min(100, Math.round(baseProgress + bonus));
  }, [formData]);
  
  const missingFields = useMemo(() => {
    const required = ['name', 'description', 'price', 'sku', 'stock', 'categoryId'];
    return required.filter(field => {
      const value = formData[field as keyof ProductFormData];
      return !value || String(value).trim() === '';
    });
  }, [formData]);
  
  const canSubmit = useMemo(() => {
    return isValid && !isSubmitting && missingFields.length === 0;
  }, [isValid, isSubmitting, missingFields]);

  return {
    // Form data
    formData,
    
    // Form state
    isValid,
    isDirty,
    isSubmitting,
    errors,
    
    // Form actions
    updateField,
    updateFieldBatch,
    resetForm,
    validateField,
    validateAll,
    handleSubmit,
    
    // Specialized updaters
    addImage,
    removeImage,
    updateImage,
    setPrimaryImage,
    addVideo,
    removeVideo,
    updateVideo,
    addFeature,
    removeFeature,
    updateFeature,
    
    // Computed values
    progress,
    missingFields,
    canSubmit,
    
    // Legacy compatibility
    validateStep: validateAll,
    setErrors,
  };
};
