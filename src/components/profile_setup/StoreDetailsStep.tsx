import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StoreDetails } from "@/interfaces/profileSetup.interface";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { useState } from "react";
interface StoreDetailsStepProps {
  data: StoreDetails;
  onUpdate: (data: StoreDetails) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StoreDetailsStep = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: StoreDetailsStepProps) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Partial<StoreDetails>>({});

  const handleChange = (field: keyof StoreDetails, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<StoreDetails> = {};

    if (!formData.storeName.trim())
      newErrors.storeName = "Store name is required";
    if (!formData.storeType.trim())
      newErrors.storeType = "Store type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const storeTypes = [
    "Electronics",
    "Clothing & Fashion",
    "Home & Garden",
    "Sports & Fitness",
    "Books & Media",
    "Health & Beauty",
    "Toys & Games",
    "Automotive",
    "Grocery & Food",
    "Arts & Crafts",
    "Pet Supplies",
    "Other",
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Store Information
        </h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="storeName"
          className="text-sm font-medium text-gray-700"
        >
          Store Name *
        </Label>
        <Input
          id="storeName"
          type="text"
          placeholder="Enter your store name"
          value={formData.storeName}
          onChange={(e) => handleChange("storeName", e.target.value)}
          className={errors.storeName ? "border-red-500" : ""}
        />
        {errors.storeName && (
          <p className="text-sm text-red-600">{errors.storeName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="storeType"
          className="text-sm font-medium text-gray-700"
        >
          Store Type *
        </Label>
        <Input
          id="storeType"
          type="text"
          placeholder="e.g., Electronics, Clothing, etc."
          value={formData.storeType}
          onChange={(e) => handleChange("storeType", e.target.value)}
          className={errors.storeType ? "border-red-500" : ""}
          list="storeTypes"
        />
        <datalist id="storeTypes">
          {storeTypes.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
        {errors.storeType && (
          <p className="text-sm text-red-600">{errors.storeType}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Store Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your store, products, and what makes you unique..."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="resize-none"
        />
        <p className="text-sm text-gray-500">
          {formData.description.length}/500 characters
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          💡 Tips for a great store description:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Mention your specialty and unique selling points</li>
          <li>• Include years of experience or expertise</li>
          <li>• Highlight quality, customer service, or special offers</li>
          <li>• Keep it engaging and customer-focused</li>
        </ul>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-8 py-2 flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 flex items-center space-x-2"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StoreDetailsStep;
