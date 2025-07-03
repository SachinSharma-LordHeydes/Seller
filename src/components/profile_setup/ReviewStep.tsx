
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronLeft, User, MapPin, Store, FileText, Home, Building2 } from 'lucide-react';
import { ProfileFormData } from '@/interfaces/profileSetup.interface';

interface ReviewStepProps {
  data: ProfileFormData;
  onSubmit: () => void;
  onPrevious: () => void;
}

const ReviewStep = ({ data, onSubmit, onPrevious }: ReviewStepProps) => {
  const AddressCard = ({ 
    address, 
    title, 
    icon: Icon, 
    color 
  }: { 
    address: any; 
    title: string; 
    icon: any; 
    color: string; 
  }) => (
    <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center space-x-2 text-lg text-${color}-600`}>
          <Icon className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {address.addressLabel && (
          <div>
            <Badge variant="secondary" className="mb-2">
              {address.addressLabel}
            </Badge>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-600">Location</p>
          <p className="font-medium">
            {address.locality}, {address.city}
          </p>
          <p className="text-sm text-gray-600">
            {address.province} - {address.pinCode}
          </p>
        </div>
        {address.landMark && (
          <div>
            <p className="text-sm text-gray-600">Landmark</p>
            <p className="font-medium">{address.landMark}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review Your Information</h2>
        <p className="text-gray-600">Please review all details before submitting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{data.personalDetails.firstName} {data.personalDetails.lastName}</p>
            </div>
            {data.personalDetails.phoneNumber && (
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium">{data.personalDetails.phoneNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Store Details */}
        <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Store className="w-5 h-5 text-purple-600" />
              <span>Store Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Store Name</p>
              <p className="font-medium">{data.storeDetails.storeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Store Type</p>
              <Badge variant="outline">{data.storeDetails.storeType}</Badge>
            </div>
            {data.storeDetails.description && (
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm leading-relaxed">{data.storeDetails.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Addresses Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Addresses</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AddressCard 
            address={data.temporaryAddress}
            title="Temporary Address"
            icon={Building2}
            color="blue"
          />
          
          <AddressCard 
            address={data.permanentAddress}
            title="Permanent Address"
            icon={Home}
            color="green"
          />
          
          <AddressCard 
            address={data.storeAddress}
            title="Store Address"
            icon={Store}
            color="orange"
          />
        </div>
      </div>

      {/* Documentation */}
      <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <FileText className="w-5 h-5 text-orange-600" />
            <span>Documentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">PAN Number</p>
            <p className="font-mono font-medium text-lg tracking-wider">
              {data.documentation.panNumber}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">Verified Format</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">🎉 You're almost done!</h3>
        <p className="text-sm text-blue-800">
          By submitting this information, you confirm that all details are accurate and agree to our 
          terms of service. Your account will be reviewed and activated within 24-48 hours.
        </p>
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
          onClick={onSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 flex items-center space-x-2"
        >
          <span>Complete Setup</span>
          <CheckCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
