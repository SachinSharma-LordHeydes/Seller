"use client";

import {
  FormField,
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "@/components/form-field";
import { ImageUpload } from "@/components/image-upload";
import UploadLoading from "@/components/loading/UploadLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { SelectItem } from "@/components/ui/select"; // Added missing import
import { Separator } from "@/components/ui/separator";
import { VideoUpload } from "@/components/video-upload";
import { IAddProduct, ProductStatus } from "@/interfaces/IProducts.interface";
import { gql, useMutation, useQuery } from "@apollo/client";
import { ArrowLeft, ArrowRight, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Features and details" },
  { id: 3, title: "Pricing & Inventory", description: "Price and stock" },
  { id: 4, title: "Media Upload", description: "Images and videos" },
  { id: 5, title: "Shipping", description: "Delivery options" },
  { id: 6, title: "Policies", description: "Returns and warranty" },
];
const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    getProductById(id: $id) {
      id
      name
      description
      price
      sku
      stock
      status
      sellerId
      images {
        id
        url
        altText
        isPrimary
      }
      video {
        id
        url
        publicId
      }
      features {
        id
        feature
        value
      }
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      description
      price
      sku
      stock
      status
      sellerId
      images {
        id
        url
        altText
        isPrimary
      }
      video {
        id
        url
        publicId
      }
      features {
        id
        feature
        value
      }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id },
  });
  const [updateProduct, { loading: updateLoading }] =
    useMutation(UPDATE_PRODUCT);
  const [deleteProduct, { loading: deleteLoading }] =
    useMutation(DELETE_PRODUCT);

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [createdProductId] = useState<string | null>(null);

  console.log("data--->", data);

  const [formData, setFormData] = useState<IAddProduct>({
    name: "",
    brand: "",
    category: "",
    subcategory: "",
    description: "",
    features: [],
    specifications: {},
    price: "",
    comparePrice: "",
    costPrice: "",
    sku: "",
    trackQuantity: true,
    quantity: "",
    images: [],
    videos: [],
    weight: "",
    dimensions: "",
    shippingClass: "",
    returnPolicy: "",
    warranty: "",
    status: ProductStatus.PENDING,
    stock: 0,
  });

  useEffect(() => {
    if (data?.getProductById) {
      const product = data.getProductById;
      console.log("Raw product data from GraphQL:", product);

      const newFormData = {
        name: product.name || "",
        brand: "",
        category: "",
        subcategory: "",
        description: product.description || "",
        features: product.features || [],
        specifications: {},
        price: product.price?.toString() || "",
        comparePrice: "",
        costPrice: "",
        sku: product.sku || "",
        trackQuantity: product.stock !== undefined,
        quantity: product.stock ? product.stock.toString() : "",
        images: product.images || [],
        videos: product.video || [], // Make sure this matches the GraphQL response
        weight: "",
        dimensions: "",
        shippingClass: "",
        returnPolicy: "",
        warranty: "",
        status: product.status || ProductStatus.PENDING,
        stock: product.stock || 0,
      };

      console.log("Form data being set:", newFormData);
      setFormData(newFormData);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading product...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data?.getProductById) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              {error ? `Error: ${error.message}` : "Product not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = (currentStep / steps.length) * 100;

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (formData.name.length > 100)
          newErrors.name = "Name must be less than 100 characters";
        if (formData.description && formData.description.length < 10)
          newErrors.description = "Description must be at least 10 characters";
        break;
      case 3:
        if (!formData.price) {
          newErrors.price = "Price is required";
        } else {
          const price = Number.parseFloat(formData.price);
          if (isNaN(price) || price <= 0)
            newErrors.price = "Price must be a valid positive number";
        }
        if (!formData.sku.trim()) newErrors.sku = "SKU is required";
        if (!formData.quantity) {
          newErrors.quantity = "Quantity is required";
        } else {
          const quantity = Number.parseInt(formData.quantity, 10);
          if (isNaN(quantity) || quantity < 0)
            newErrors.quantity = "Quantity must be a valid non-negative number";
        }
        break;
      case 4:
        if (formData.images.length < 1)
          newErrors.images = "At least one image is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Enhanced handleSave function with detailed progress tracking
  const handleSave = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    setUploadStage("Validating Product Data");
    setUploadProgress(0);

    try {
      // Stage 1: Validation
      setUploadStage("Validating Product Data");
      setUploadProgress(10);
      
      const stockValue = Number.parseInt(formData.quantity, 10);
      if (isNaN(stockValue) || stockValue < 0) {
        setErrors({ quantity: "Quantity must be a valid non-negative number" });
        setIsLoading(false);
        setUploadStage("");
        setUploadProgress(0);
        return;
      }

      const priceValue = Number.parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        setErrors({ price: "Price must be a valid positive number" });
        setIsLoading(false);
        setUploadStage("");
        setUploadProgress(0);
        return;
      }

      // Stage 2: Preparing Data
      setUploadStage("Preparing Product Data");
      setUploadProgress(25);
      
      // Prepare the input object with proper validation
      const input = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: priceValue,
        sku: formData.sku.trim(),
        stock: stockValue,
        status: formData.status || "PENDING",
        // Only include arrays if they have content
        ...(formData.images.length > 0 && {
          images: formData.images.map((img) => ({
            url: img.url,
            altText: img.altText || null,
            isPrimary: img.isPrimary || false,
          })),
        }),
        ...(formData.videos.length > 0 && {
          video: formData.videos
            .filter((vid) => vid.url && !vid.url.startsWith("blob:")) // Filter out blob URLs
            .map((vid) => ({
              url: vid.url,
              publicId: vid.publicId || null,
            })),
        }),
        ...(formData.features.length > 0 && {
          features: formData.features.map((f) => ({
            feature: f.feature,
            value: f.value || null,
          })),
        }),
        // Always include specifications as an empty array to avoid issues
        specifications: [],
      };

      // Remove any undefined values
      Object.keys(input).forEach((key) => {
        if (input[key] === undefined) {
          delete input[key];
        }
      });

      console.log("Mutation input:", JSON.stringify(input, null, 2));

      // Stage 3: Processing Images
      if (formData.images.length > 0) {
        setUploadStage(`Processing ${formData.images.length} Images`);
        setUploadProgress(40);
      }

      // Stage 4: Processing Videos
      if (formData.videos.length > 0) {
        setUploadStage(`Processing ${formData.videos.length} Videos`);
        setUploadProgress(60);
      }

      // Stage 5: Updating Product
      setUploadStage("Updating Product in Database");
      setUploadProgress(80);

      const response = await updateProduct({
        variables: { id, input },
      });

      console.log("Mutation response:", response);

      // Stage 6: Finalizing
      setUploadStage("Finalizing Update");
      setUploadProgress(95);

      if (response.data?.updateProduct) {
        const updatedProduct = response.data.updateProduct;
        console.log("Updated product from server:", updatedProduct);
        
        // Success - finalize
        setUploadStage("Update Complete");
        setUploadProgress(100);
        
        // Update form data with the server response to reflect changes
        const updatedFormData = {
          ...formData,
          name: updatedProduct.name || "",
          description: updatedProduct.description || "",
          price: updatedProduct.price?.toString() || "",
          sku: updatedProduct.sku || "",
          quantity: updatedProduct.stock ? updatedProduct.stock.toString() : "",
          stock: updatedProduct.stock || 0,
          status: updatedProduct.status || ProductStatus.PENDING,
          images: updatedProduct.images || [],
          videos: updatedProduct.video || [], // Ensure videos are properly updated
          features: updatedProduct.features || [],
        };
        
        console.log("Updated form data:", updatedFormData);
        setFormData(updatedFormData);
        
        // Small delay to show completion, then show success message
        setTimeout(() => {
          setUploadStage("");
          setUploadProgress(0);
          setIsLoading(false);
          
          // Show success message (you can add a toast notification here)
          console.log("Product updated successfully!");
          
          // Optional: redirect after a longer delay if needed
          // setTimeout(() => router.push("/products"), 2000);
        }, 1000);
      } else {
        throw new Error("Update failed - no data returned");
      }
    } catch (err: any) {
      console.error("Update error:", err);

      let errorMessage = "Failed to update product";

      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        console.log(
          "GraphQL Errors:",
          JSON.stringify(err.graphQLErrors, null, 2)
        );
        errorMessage = err.graphQLErrors[0].message || errorMessage;
      }

      if (err.networkError) {
        console.log("Network Error:", err.networkError);
        errorMessage = "Network error occurred";
      }

      setErrors({
        form: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setUploadStage("");
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        await deleteProduct({ variables: { id } });
        router.push("/products");
      } catch (err) {
        console.error("Delete error:", err);
        setErrors({ form: "Failed to delete product" });
      }
      setIsLoading(false);
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    updateFormData("features", newFeatures);
  };

  const addFeature = (feature: string, value: string) => {
    if (feature.trim() && value.trim()) {
      updateFormData("features", [...formData.features, { feature, value }]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Product Title" error={errors.name} required>
                <ValidatedInput
                  placeholder="Enter product title"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  error={errors.name}
                />
              </FormField>
              <FormField label="Brand" error={errors.brand}>
                <ValidatedInput
                  placeholder="Enter brand name"
                  value={formData.brand}
                  onChange={(e) => updateFormData("brand", e.target.value)}
                  error={errors.brand}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Category" error={errors.category} required>
                <ValidatedSelect
                  value={formData.category}
                  onValueChange={(value) => updateFormData("category", value)}
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
                  onValueChange={(value) =>
                    updateFormData("subcategory", value)
                  }
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
                onChange={(e) => updateFormData("description", e.target.value)}
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
                    <Badge variant="secondary">
                      Wireless Connectivity
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
                    <Badge variant="secondary">
                      Long Battery Life
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
                    <Badge variant="secondary">
                      Water Resistant
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
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
                  onChange={(e) => updateFormData("price", e.target.value)}
                  error={errors.price}
                />
              </FormField>
              <FormField label="Compare at Price" error={errors.comparePrice}>
                <ValidatedInput
                  type="number"
                  placeholder="0.00"
                  value={formData.comparePrice}
                  onChange={(e) =>
                    updateFormData("comparePrice", e.target.value)
                  }
                  error={errors.comparePrice}
                />
              </FormField>
              <FormField label="Cost per Item" error={errors.costPrice}>
                <ValidatedInput
                  type="number"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={(e) => updateFormData("costPrice", e.target.value)}
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
                      onChange={(e) => updateFormData("sku", e.target.value)}
                      error={errors.sku}
                    />
                  </FormField>
                  <FormField label="Quantity" error={errors.quantity} required>
                    <ValidatedInput
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) =>
                        updateFormData("quantity", e.target.value)
                      }
                      error={errors.quantity}
                    />
                  </FormField>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trackQuantity"
                    checked={formData.trackQuantity}
                    onCheckedChange={(checked) =>
                      updateFormData("trackQuantity", checked)
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
              label="Product Images (Minimum 5 required)"
              error={errors.images}
              required
            >
              <ImageUpload
                value={formData.images}
                onChange={(images) => updateFormData("images", images)}
                maxFiles={10}
                productId={createdProductId || undefined}
              />
            </FormField>

            <Separator />

            <FormField label="Product Videos (Optional)">
              <VideoUpload
                value={formData.videos}
                onChange={(videos) => updateFormData("videos", videos)}
                maxFiles={5}
                productId={createdProductId || undefined}
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
                  onChange={(e) => updateFormData("weight", e.target.value)}
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
                onValueChange={(value) =>
                  updateFormData("shippingClass", value)
                }
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
                onChange={(e) => updateFormData("returnPolicy", e.target.value)}
              />
            </FormField>

            <FormField label="Warranty Information">
              <ValidatedTextarea
                placeholder="Describe warranty terms..."
                className="min-h-[120px]"
                value={formData.warranty}
                onChange={(e) => updateFormData("warranty", e.target.value)}
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
  };

  return (
    <div className="relative flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <UploadLoading
            stage={uploadStage}
            progress={uploadProgress}
            isActive={isLoading}
          />
        </div>
      )}
      <div className={isLoading ? "blur-sm" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading || deleteLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
          </div>
        </div>

        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.form}
          </div>
        )}

        <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Step {currentStep} of {steps.length}
                </CardTitle>
                <CardDescription>
                  {steps[currentStep - 1]?.title}
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
        </Card>

        <div className="flex justify-center">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-2 text-sm">
                  <div
                    className={
                      currentStep >= step.id
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {step.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
            <CardDescription>
              {steps[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isLoading || updateLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading || updateLoading ? "Saving..." : "Save Changes"}
            </Button>
            {currentStep === steps.length ? (
              <Button
                onClick={handleSave}
                disabled={isLoading || updateLoading}
              >
                Update Product
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
