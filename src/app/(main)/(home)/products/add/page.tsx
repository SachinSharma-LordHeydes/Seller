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
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { VideoUpload } from "@/components/video-upload";
import { IAddProduct, ProductStatus } from "@/interfaces/IProducts.interface";
import { gql, useMutation } from "@apollo/client";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Features and details" },
  { id: 3, title: "Pricing & Inventory", description: "Price and stock" },
  { id: 4, title: "Media Upload", description: "Images and videos" },
  { id: 5, title: "Shipping", description: "Delivery options" },
  { id: 6, title: "Policies", description: "Returns and warranty" },
];

const ADD_PRODUCT = gql`
  mutation AddProduct($input: AddProductInput!) {
    addProduct(input: $input) {
      id
      name
      sku
      price
      stock
      images {
        id
        url
        isPrimary
      }
      features {
        id
        feature
        value
      }
    }
  }
`;

export const GENERATE_UPLOAD_URL = gql`
  mutation GenerateUploadUrl($productId: ID!, $isImage: Boolean!) {
    generateUploadUrl(productId: $productId, isImage: $isImage) {
      url
      signature
      timestamp
      apiKey
      publicId
    }
  }
`;

export const SAVE_PRODUCT_MEDIA = gql`
  mutation SaveProductMedia(
    $productId: ID!
    $url: String!
    $publicId: String
    $altText: String
    $isPrimary: Boolean
    $isImage: Boolean!
  ) {
    saveProductMedia(
      productId: $productId
      url: $url
      publicId: $publicId
      altText: $altText
      isPrimary: $isPrimary
      isImage: $isImage
    )
  }
`;

export default function AddProductPage() {
  const [addProduct, { loading }] = useMutation(ADD_PRODUCT);
  const [generateUploadUrl] = useMutation(GENERATE_UPLOAD_URL);
  const [saveProductMedia] = useMutation(SAVE_PRODUCT_MEDIA);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdProductId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter();

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

  const progress = (currentStep / steps.length) * 100;

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (formData.name.length > 100)
          newErrors.name = "name must be less than 100 characters";
        if (!formData.category) newErrors.category = "Category is required";
        if (formData.description.length < 10)
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
          const quantity = Number.parseInt(formData.quantity);
          if (isNaN(quantity) || quantity < 0)
            newErrors.quantity = "Quantity must be a valid non-negative number";
        }
        break;

      case 4:
        if (formData.images.length < 5)
          newErrors.images = "At least 5 images are required";
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
    if (field === "images" && Array.isArray(value)) {
      const cleanImages = value.filter((img) => img != null);
      setFormData({ ...formData, [field]: cleanImages });
    } else {
      setFormData({ ...formData, [field]: value });
    }

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setIsUploading(true);
    setUploadStage("Creating Product");
    setUploadProgress(0);
    try {
      console.log("Starting product creation...");

      const productInput = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sku: formData.sku,
        stock: parseInt(formData.quantity, 10),
        features: formData.features.map((f) => ({
          feature: f.key,
          value: f.value,
        })),
        specifications: Object.entries(formData.specifications).map(
          ([key, value]) => ({
            key,
            value,
          })
        ),
        images: [],
      };

      const result = await addProduct({ variables: { input: productInput } });
      const createdProduct = result.data.addProduct;

      console.log("Product created successfully:", createdProduct);

      setUploadStage("Uploading Images");
      setUploadProgress(10); // 10% for product creation

      const totalTasks = 1 + formData.images.length + formData.videos.length;
      let completedTasks = 1;

      if (formData.images.length > 0) {
        console.log(
          `Processing ${formData.images.length} images for upload...`
        );

        const imageUploadPromises = formData.images.map(
          async (image, index) => {
            try {
              if (image.id || !image.file) {
                console.log(`Skipping image ${index}: already processed`);
                return image;
              }

              console.log(`Uploading image ${index}:`, image.altText);

              const { data: uploadData } = await generateUploadUrl({
                variables: {
                  productId: createdProduct.id,
                  isImage: true,
                },
              });

              const { url, signature, timestamp, apiKey, publicId } =
                uploadData.generateUploadUrl;

              console.log("url-->", url);

              // Create form data for Cloudinary upload
              const uploadFormData = new FormData(); // Renamed from formData
              uploadFormData.append("file", image.file);
              uploadFormData.append("signature", signature);
              uploadFormData.append("timestamp", timestamp);
              uploadFormData.append("api_key", apiKey);
              uploadFormData.append("public_id", publicId);

              // Upload to Cloudinary
              const uploadResponse = await fetch(url, {
                method: "POST",
                body: uploadFormData,
              });

              if (!uploadResponse.ok) {
                throw new Error(
                  `Cloudinary upload failed: ${uploadResponse.statusText}`
                );
              }

              const uploadResult = await uploadResponse.json();
              console.log(
                `Image ${index} uploaded to Cloudinary:`,
                uploadResult.secure_url
              );

              // Save media reference in database
              const { data: saveData } = await saveProductMedia({
                variables: {
                  productId: createdProduct.id,
                  url: uploadResult.secure_url,
                  publicId: uploadResult.public_id,
                  altText: image.altText || image.file.name,
                  isPrimary: image.isPrimary || false,
                  isImage: true,
                },
              });

              console.log(
                `Image ${index} saved to database with ID:`,
                saveData.saveProductMedia
              );
              completedTasks += 1;
              setUploadProgress((completedTasks / totalTasks) * 100);

              return {
                ...image,
                id: saveData.saveProductMedia,
                url: uploadResult.secure_url,
                uploading: false,
                file: undefined, // Clear file reference
              };
            } catch (error: any) {
              console.error(`Failed to upload image ${index}:`, error);
              return {
                ...image,
                error: error.message,
                uploading: false,
              };
            }
          }
        );

        const uploadResults = await Promise.all(imageUploadPromises);
        console.log("All image uploads completed:", uploadResults);

        updateFormData("images", uploadResults);
      }

      if (formData.videos.length > 0) {
        console.log(
          `Processing ${formData.videos.length} videos for upload...`
        );

        const videoUploadPromises = formData.videos.map(
          async (video, index) => {
            try {
              if (!video.file) {
                console.log(`Skipping video ${index}: no file`);
                return video;
              }

              console.log(`Uploading video ${index}`);
              // Generate upload URL for video
              setUploadStage(
                `Uploading Video ${index + 1} of ${formData.videos.length}`
              );
              const { data: uploadData } = await generateUploadUrl({
                variables: {
                  productId: createdProduct.id,
                  isImage: false,
                },
              });

              const { url, signature, timestamp, apiKey, publicId } =
                uploadData.generateUploadUrl;

              // Create form data for Cloudinary upload
              const uploadFormData = new FormData(); // Renamed from formData
              uploadFormData.append("file", video.file);
              uploadFormData.append("signature", signature);
              uploadFormData.append("timestamp", timestamp);
              uploadFormData.append("api_key", apiKey);
              uploadFormData.append("public_id", publicId);
              uploadFormData.append("resource_type", "video");

              // Upload to Cloudinary
              const uploadResponse = await fetch(url, {
                method: "POST",
                body: uploadFormData,
              });

              if (!uploadResponse.ok) {
                throw new Error(
                  `Video upload failed: ${uploadResponse.statusText}`
                );
              }

              const uploadResult = await uploadResponse.json();
              console.log(
                `Video ${index} uploaded to Cloudinary:`,
                uploadResult.secure_url
              );

              // Save video reference in database
              const { data: saveData } = await saveProductMedia({
                variables: {
                  productId: createdProduct.id,
                  url: uploadResult.secure_url,
                  publicId: uploadResult.public_id,
                  isImage: false,
                },
              });

              console.log(
                `Video ${index} saved to database with ID:`,
                saveData.saveProductMedia
              );

              return {
                ...video,
                id: saveData.saveProductMedia,
                url: uploadResult.secure_url,
                uploading: false,
                file: undefined,
              };
            } catch (error: any) {
              console.error(`Failed to upload video ${index}:`, error);
              return {
                ...video,
                error: error.message,
                uploading: false,
              };
            }
          }
        );

        const videoUploadResults = await Promise.all(videoUploadPromises);
        console.log("All video uploads completed:", videoUploadResults);

        updateFormData("videos", videoUploadResults);
      }
      router.push("/products");
      setUploadStage("Finalizing");
      setUploadProgress(100);
      console.log("Product creation and media upload completed successfully!");
    } catch (err: any) {
      console.error("Failed to create product:", err);
      console.error("Error details:", err.message);
    } finally {
      setIsUploading(false);
      setUploadStage("");
      setUploadProgress(0);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Product Title" error={errors.title} required>
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
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <UploadLoading
            stage={uploadStage}
            progress={uploadProgress}
            isActive={isUploading}
          />
        </div>
      )}
      <div className={isUploading ? "blur-sm" : ""}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
        </div>

        <div className="grid gap-6">
          {/* Progress Header */}
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

          {/* Step Navigation */}
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
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-muted mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
              <CardDescription>
                {steps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isUploading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" disabled={isUploading}>
                Save Draft
              </Button>
              {currentStep === steps.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || isUploading}
                >
                  {loading || isUploading ? "Publishing..." : "Publish Product"}
                </Button>
              ) : (
                <Button onClick={nextStep} disabled={isUploading}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
