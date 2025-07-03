import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonalDetails } from "@/interfaces/profileSetup.interface";
import { ChevronRight, Phone, User } from "lucide-react";
import { useState } from "react";

interface PersonalDetailsStepProps {
  data: PersonalDetails;
  onUpdate: (data: PersonalDetails) => void;
  onNext: () => void;
}

const PersonalDetailsStep = ({
  data,
  onUpdate,
  onNext,
}: PersonalDetailsStepProps) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Partial<PersonalDetails>>({});

  const handleChange = (field: keyof PersonalDetails, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<PersonalDetails> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (
      formData.phoneNumber &&
      !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))
    ) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">Tell us about yourself to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className="text-sm font-medium text-gray-700"
          >
            First Name *
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={`transition-colors ${
              errors.firstName
                ? "border-red-500 focus:border-red-500"
                : "focus:border-blue-500"
            }`}
          />
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="lastName"
            className="text-sm font-medium text-gray-700"
          >
            Last Name *
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className={`transition-colors ${
              errors.lastName
                ? "border-red-500 focus:border-red-500"
                : "focus:border-blue-500"
            }`}
          />
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="phoneNumber"
          className="text-sm font-medium text-gray-700"
        >
          Phone Number
        </Label>
        <div className="relative">
          <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className={`pl-10 transition-colors ${
              errors.phoneNumber
                ? "border-red-500 focus:border-red-500"
                : "focus:border-blue-500"
            }`}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;
