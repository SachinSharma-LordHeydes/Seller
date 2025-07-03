"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressDetails } from "@/interfaces/profileSetup.interface";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Home,
  MapPin,
} from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";

interface AddressStepProps {
  temporaryAddress: AddressDetails;
  permanentAddress: AddressDetails;
  onUpdateTemporary: (data: AddressDetails) => void;
  onUpdatePermanent: (data: AddressDetails) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Memoized AddressForm component to prevent unnecessary re-renders
const AddressForm = React.memo(({
  data,
  onChange,
  errors,
  type,
}: {
  data: AddressDetails;
  onChange: (field: keyof AddressDetails, value: string) => void;
  errors: Partial<AddressDetails>;
  type: "temporary" | "permanent";
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label
          htmlFor={`${type}-province`}
          className="text-sm font-medium text-gray-700"
        >
          Province/State *
        </Label>
        <Input
          id={`${type}-province`}
          type="text"
          placeholder="Enter province or state"
          value={data.province}
          onChange={(e) => onChange("province", e.target.value)}
          className={errors.province ? "border-red-500" : ""}
        />
        {errors.province && (
          <p className="text-sm text-red-600">{errors.province}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`${type}-city`}
          className="text-sm font-medium text-gray-700"
        >
          City *
        </Label>
        <Input
          id={`${type}-city`}
          type="text"
          placeholder="Enter city"
          value={data.city}
          onChange={(e) => onChange("city", e.target.value)}
          className={errors.city ? "border-red-500" : ""}
        />
        {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label
          htmlFor={`${type}-locality`}
          className="text-sm font-medium text-gray-700"
        >
          Locality *
        </Label>
        <Input
          id={`${type}-locality`}
          type="text"
          placeholder="Enter locality/area"
          value={data.locality}
          onChange={(e) => onChange("locality", e.target.value)}
          className={errors.locality ? "border-red-500" : ""}
        />
        {errors.locality && (
          <p className="text-sm text-red-600">{errors.locality}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`${type}-pinCode`}
          className="text-sm font-medium text-gray-700"
        >
          PIN Code *
        </Label>
        <Input
          id={`${type}-pinCode`}
          type="text"
          placeholder="Enter 6-digit PIN code"
          value={data.pinCode}
          onChange={(e) => onChange("pinCode", e.target.value)}
          className={errors.pinCode ? "border-red-500" : ""}
          maxLength={6}
        />
        {errors.pinCode && (
          <p className="text-sm text-red-600">{errors.pinCode}</p>
        )}
      </div>
    </div>

    <div className="space-y-2">
      <Label
        htmlFor={`${type}-addressLabel`}
        className="text-sm font-medium text-gray-700"
      >
        Address Label
      </Label>
      <Input
        id={`${type}-addressLabel`}
        type="text"
        placeholder="e.g., Home, Office, etc."
        value={data.addressLabel}
        onChange={(e) => onChange("addressLabel", e.target.value)}
      />
    </div>

    <div className="space-y-2">
      <Label
        htmlFor={`${type}-landMark`}
        className="text-sm font-medium text-gray-700"
      >
        Landmark
      </Label>
      <Input
        id={`${type}-landMark`}
        type="text"
        placeholder="Nearby landmark (optional)"
        value={data.landMark}
        onChange={(e) => onChange("landMark", e.target.value)}
      />
    </div>
  </div>
));

AddressForm.displayName = "AddressForm";

const AddressStep = ({
  temporaryAddress,
  permanentAddress,
  onUpdateTemporary,
  onUpdatePermanent,
  onNext,
  onPrevious,
}: AddressStepProps) => {
  const [tempFormData, setTempFormData] = useState(temporaryAddress);
  const [permFormData, setPermFormData] = useState(permanentAddress);
  const [tempErrors, setTempErrors] = useState<Partial<AddressDetails>>({});
  const [permErrors, setPermErrors] = useState<Partial<AddressDetails>>({});
  const [activeTab, setActiveTab] = useState("permanent");

  // Use refs to store the latest callback functions to avoid stale closures
  const onUpdateTempRef = React.useRef(onUpdateTemporary);
  const onUpdatePermRef = React.useRef(onUpdatePermanent);
  
  // Update refs when props change
  React.useEffect(() => {
    onUpdateTempRef.current = onUpdateTemporary;
  }, [onUpdateTemporary]);
  
  React.useEffect(() => {
    onUpdatePermRef.current = onUpdatePermanent;
  }, [onUpdatePermanent]);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleTempChange = useCallback((field: keyof AddressDetails, value: string) => {
    const updatedData = { ...tempFormData, [field]: value };
    setTempFormData(updatedData);
    
    // Update parent component with a small delay to avoid render conflicts
    requestAnimationFrame(() => {
      onUpdateTempRef.current(updatedData);
    });

    // Clear error for this field if it exists
    if (tempErrors[field]) {
      setTempErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [tempFormData, tempErrors]);

  const handlePermChange = useCallback((field: keyof AddressDetails, value: string) => {
    const updatedData = { ...permFormData, [field]: value };
    setPermFormData(updatedData);
    
    // Update parent component with a small delay to avoid render conflicts
    requestAnimationFrame(() => {
      onUpdatePermRef.current(updatedData);
    });

    // Clear error for this field if it exists
    if (permErrors[field]) {
      setPermErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [permFormData, permErrors]);

  const copyPermanentToTemporary = useCallback((checked: boolean) => {
    if (checked) {
      const copiedAddress = {
        ...permFormData,
        addressType: "TEMPORARY" as const,
      };
      setTempFormData(copiedAddress);
      setTempErrors({});
      
      // Update parent component
      requestAnimationFrame(() => {
        onUpdateTempRef.current(copiedAddress);
      });
    }
  }, [permFormData]);

  const validateAddress = useCallback((
    address: AddressDetails,
    setErrors: React.Dispatch<React.SetStateAction<Partial<AddressDetails>>>
  ) => {
    const newErrors: Partial<AddressDetails> = {};

    if (!address.province.trim()) newErrors.province = "Province is required";
    if (!address.pinCode.trim()) newErrors.pinCode = "PIN code is required";
    if (!address.locality.trim()) newErrors.locality = "Locality is required";
    if (!address.city.trim()) newErrors.city = "City is required";

    if (address.pinCode && !/^\d{6}$/.test(address.pinCode)) {
      newErrors.pinCode = "Please enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleNext = useCallback(() => {
    const isTempValid = validateAddress(tempFormData, setTempErrors);
    const isPermValid = validateAddress(permFormData, setPermErrors);

    if (isTempValid && isPermValid) {
      onNext();
    }
  }, [tempFormData, permFormData, validateAddress, onNext]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Address Details
        </h2>
        <p className="text-gray-600">
          Please provide both your temporary and permanent addresses
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="permanent"
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Permanent Address</span>
          </TabsTrigger>
          <TabsTrigger
            value="temporary"
            className="flex items-center space-x-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Temporary Address</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permanent" className="mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-green-900 mb-1">
              Permanent Address
            </h3>
            <p className="text-sm text-green-800">
              Your permanent residential address as per official documents
            </p>
          </div>
          <AddressForm
            data={permFormData}
            onChange={handlePermChange}
            errors={permErrors}
            type="permanent"
          />
        </TabsContent>

        <TabsContent value="temporary" className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Temporary Address
            </h3>
            <p className="text-sm text-blue-800">
              Your current residential address or temporary location
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="copy-address"
                onCheckedChange={copyPermanentToTemporary}
              />
              <Label
                htmlFor="copy-address"
                className="text-sm font-medium text-gray-700 cursor-pointer flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Same as permanent address</span>
              </Label>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Check this if your temporary address is the same as your permanent
              address
            </p>
          </div>

          <AddressForm
            data={tempFormData}
            onChange={handleTempChange}
            errors={tempErrors}
            type="temporary"
          />
        </TabsContent>
      </Tabs>

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

export default AddressStep;