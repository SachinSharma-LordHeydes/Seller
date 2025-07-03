"use client";

import React from "react";
import {
  FormField,
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "@/components/form-field";
import { ImageUpload } from "@/components/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { VideoUpload } from "@/components/video-upload";
import { IAddProduct } from "@/interfaces/IProducts.interface";
import { X } from "lucide-react";

interface ProductFormStepsProps {
  currentStep: number;
  formData: IAddProduct;
  errors: Record<string, string>;
  onUpdateField: (field: string, value: any) => void;
  productId?: string;
}

export function ProductFormSteps({
  currentStep,
  formData,
  errors,
  onUpdateField,
  productId,
}: ProductFormStepsProps) {
  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    onUpdateField("features", newFeatures);
  };

  const addFeature = (feature: string, value: string) => {
    if (feature.trim() && value.trim()) {
      onUpdateField("features", [...formData.features, { feature, value }]);
    }
  };

  switch (currentStep) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Product Title" error={errors.name} required>
              <ValidatedInput
                placeholder="Enter product title"
                value={formData.name}
                onChange={(e) => onUpdateField("name", e.target.value)}
                error={errors.name}
              />
            </FormField>
            <FormField label="Brand" error={errors.brand}>
              <ValidatedInput
                placeholder="Enter brand name"
                value={formData.brand}
                onChange={(e) => onUpdateField("brand", e.target.value)}
                error={errors.brand}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Category" error={errors.category} required>
              <ValidatedSelect
                value={formData.category}
                onValueChange={(value) => onUpdateField("category", value)}
                placeholder="Select category"
                error={errors.category}
              >
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
                <SelectItem value="sports">Sports & Outdoors</SelectItem>
                <SelectItem value="books">Books</SelectItem>
              </ValidatedSelect>
            </FormField>
            <FormField label="Subcategory" error={errors.subcategory}>
              <ValidatedSelect
                value={formData.subcategory}
                onValueChange={(value) => onUpdateField("subcategory", value)}
                placeholder="Select subcategory"
                error={errors.subcategory}
              >
                <SelectItem value="smartphones">Smartphones</SelectItem>
                <SelectItem value="laptops">Laptops</SelectItem>
                <SelectItem value="headphones">Headphones</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </ValidatedSelect>
            </FormField>
          </div>

          <FormField
            label="Product Description"
            error={errors.description}
            required
          >
            <ValidatedTextarea
              placeholder="Describe your product..."
              className="min-h-[120px]"
              value={formData.description}
              onChange={(e) => onUpdateField("description", e.target.value)}
              error={errors.description}
            />
          </FormField>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <FormField label="Key Features">
              <div className="space-y-2">
                <ValidatedInput placeholder="Add a feature and press Enter" />
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature.feature}: {feature.value}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFeature(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </FormField>
          </div>

          <Separator />

          <div className="space-y-4">
            <FormField label="Technical Specifications">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Color">
                  <ValidatedInput placeholder="e.g., Black, White, Blue" />
                </FormField>
                <FormField label="Material">
                  <ValidatedInput placeholder="e.g., Plastic, Metal, Fabric" />
                </FormField>
                <FormField label="Model Number">
                  <ValidatedInput placeholder="e.g., ABC-123" />
                </FormField>
                <FormField label="Warranty Period">
                  <ValidatedInput placeholder="e.g., 1 Year, 2 Years" />
                </FormField>
              </div>
            </FormField>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Selling Price" error={errors.price} required>
              <ValidatedInput
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => onUpdateField("price", e.target.value)}
                error={errors.price}
              />
            </FormField>
            <FormField label="Compare at Price" error={errors.comparePrice}>
              <ValidatedInput
                type="number"
                placeholder="0.00"
                value={formData.comparePrice}
                onChange={(e) => onUpdateField("comparePrice", e.target.value)}
                error={errors.comparePrice}
              />
            </FormField>
            <FormField label="Cost per Item" error={errors.costPrice}>
              <ValidatedInput
                type="number"
                placeholder="0.00"
                value={formData.costPrice}
                onChange={(e) => onUpdateField("costPrice", e.target.value)}
                error={errors.costPrice}
              />
            </FormField>
          </div>

          <Separator />

          <div className="space-y-4">
            <FormField label="Inventory">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="SKU (Stock Keeping Unit)"
                  error={errors.sku}
                  required
                >
                  <ValidatedInput
                    placeholder="e.g., ABC-123-XYZ"
                    value={formData.sku}
                    onChange={(e) => onUpdateField("sku", e.target.value)}
                    error={errors.sku}
                  />
                </FormField>
                <FormField label="Quantity" error={errors.quantity} required>
                  <ValidatedInput
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => onUpdateField("quantity", e.target.value)}
                    error={errors.quantity}
                  />
                </FormField>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trackQuantity"
                  checked={formData.trackQuantity}
                  onCheckedChange={(checked) =>
                    onUpdateField("trackQuantity", checked)
                  }
                />
                <FormField label="Track quantity" />
              </div>
            </FormField>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <FormField
            label="Product Images (Minimum 1 required)"
            error={errors.images}
            required
          >
            <ImageUpload
              value={formData.images}
              onChange={(images) => onUpdateField("images", images)}
              maxFiles={10}
              productId={productId}
            />
          </FormField>

          <Separator />

          <FormField label="Product Videos (Optional)">
            <VideoUpload
              value={formData.videos}
              onChange={(videos) => onUpdateField("videos", videos)}
              maxFiles={5}
              productId={productId}
            />
          </FormField>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Weight (kg)" error={errors.weight}>
              <ValidatedInput
                type="number"
                placeholder="0.0"
                value={formData.weight}
                onChange={(e) => onUpdateField("weight", e.target.value)}
                error={errors.weight}
              />
            </FormField>
            <FormField label="Length (cm)">
              <ValidatedInput type="number" placeholder="0" />
            </FormField>
            <FormField label="Width (cm)">
              <ValidatedInput type="number" placeholder="0" />
            </FormField>
          </div>

          <FormField label="Shipping Class">
            <ValidatedSelect
              value={formData.shippingClass}
              onValueChange={(value) => onUpdateField("shippingClass", value)}
              placeholder="Select shipping class"
            >
              <SelectItem value="standard">Standard Shipping</SelectItem>
              <SelectItem value="express">Express Shipping</SelectItem>
              <SelectItem value="overnight">Overnight Shipping</SelectItem>
              <SelectItem value="free">Free Shipping</SelectItem>
            </ValidatedSelect>
          </FormField>

          <FormField label="Delivery Options">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="standard-delivery" />
                <FormField label="Standard Delivery (5-7 days)" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="express-delivery" />
                <FormField label="Express Delivery (2-3 days)" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="same-day" />
                <FormField label="Same Day Delivery" />
              </div>
            </div>
          </FormField>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <FormField label="Return Policy">
            <ValidatedTextarea
              placeholder="Describe your return policy..."
              className="min-h-[120px]"
              value={formData.returnPolicy}
              onChange={(e) => onUpdateField("returnPolicy", e.target.value)}
            />
          </FormField>

          <FormField label="Warranty Information">
            <ValidatedTextarea
              placeholder="Describe warranty terms..."
              className="min-h-[120px]"
              value={formData.warranty}
              onChange={(e) => onUpdateField("warranty", e.target.value)}
            />
          </FormField>

          <FormField label="Additional Policies">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="exchange-allowed" />
                <FormField label="Allow exchanges" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="refund-allowed" />
                <FormField label="Allow refunds" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="international-shipping" />
                <FormField label="International shipping available" />
              </div>
            </div>
          </FormField>
        </div>
      );

    default:
      return null;
  }
}
