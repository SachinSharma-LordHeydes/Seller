"use client";

import AddressStep from "@/components/profile_setup/AddressStep";
import DocumentationStep from "@/components/profile_setup/DocumentationStep";
import PersonalDetailsStep from "@/components/profile_setup/PersonalDetailsStep";
import ReviewStep from "@/components/profile_setup/ReviewStep";
import StoreAddressStep from "@/components/profile_setup/StoreAddressStep";
import StoreDetailsStep from "@/components/profile_setup/StoreDetailsStep";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProfileFormData } from "@/interfaces/profileSetup.interface";
import { profileFormVar } from "@/lib/state/profileSetupState";
import { userVar } from "@/lib/state/userState";
import { gql, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const COMPLETE_PROFILE_SETUP = gql`
  mutation CompleteProfileSetup($input: ProfileSetupInput!) {
    completeProfileSetup(input: $input) {
      success
      message
      profileId
    }
  }
`;

const GET_USER_DETAILS = gql`
  query Me {
    me {
      id
      email
      role
      profile {
        id
      }
    }
  }
`;

const Page = () => {
  const router = useRouter();
  const [completeProfileSetup] = useMutation(COMPLETE_PROFILE_SETUP);
  const { data, loading } = useQuery(GET_USER_DETAILS);
  const formData = useReactiveVar(profileFormVar);

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!loading && data?.me) {
      userVar(data.me);
      if (data.me.profile) router.push("/"); // skip if already set
    }
  }, [loading, data]);

  // if (loading) return <Loading />;

  const updateFormData = (stepData: any, stepKey: keyof ProfileFormData) => {
    profileFormVar({
      ...formData,
      [stepKey]: {
        ...formData[stepKey],
        ...stepData,
      },
    });
  };

  const handleNext = () => currentStep < 6 && setCurrentStep(currentStep + 1);
  const handlePrevious = () =>
    currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    try {
      const { data } = await completeProfileSetup({
        variables: { input: formData },
      });
      if (data.completeProfileSetup.success) {
        router.push("/");
      } else {
        console.log("Error:", data.completeProfileSetup.message);
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsStep
            data={formData.personalDetails}
            onUpdate={(data) => updateFormData(data, "personalDetails")}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <AddressStep
            temporaryAddress={formData.temporaryAddress}
            permanentAddress={formData.permanentAddress}
            onUpdateTemporary={(data) =>
              updateFormData(data, "temporaryAddress")
            }
            onUpdatePermanent={(data) =>
              updateFormData(data, "permanentAddress")
            }
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <StoreDetailsStep
            data={formData.storeDetails}
            onUpdate={(data) => updateFormData(data, "storeDetails")}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <StoreAddressStep
            data={formData.storeAddress}
            onUpdate={(data) => updateFormData(data, "storeAddress")}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <DocumentationStep
            data={formData.documentation}
            onUpdate={(data) => updateFormData(data, "documentation")}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <ReviewStep
            data={formData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  const steps = [
    {
      number: 1,
      title: "Personal Details",
      description: "Basic information about you",
    },
    {
      number: 2,
      title: "Addresses",
      description: "Your temporary and permanent addresses",
    },
    {
      number: 3,
      title: "Store Details",
      description: "Information about your store",
    },
    {
      number: 4,
      title: "Store Address",
      description: "Your store location details",
    },
    {
      number: 5,
      title: "Documentation",
      description: "Legal documents and verification",
    },
    {
      number: 6,
      title: "Review",
      description: "Review and confirm your details",
    },
  ];

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Set up your seller profile in just a few simple steps
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex justify-between mb-8 overflow-x-auto">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center space-y-2 min-w-0 px-2 ${
                step.number <= currentStep ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold ${
                  step.number <= currentStep
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {step.number}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs hidden sm:block">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
