
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddressDetails } from '@/interfaces/profileSetup.interface';

interface StoreAddressStepProps {
  data: AddressDetails;
  onUpdate: (data: AddressDetails) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StoreAddressStep = ({ data, onUpdate, onNext, onPrevious }: StoreAddressStepProps) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Partial<AddressDetails>>({});

  const handleChange = (field: keyof AddressDetails, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<AddressDetails> = {};
    
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'PIN code is required';
    if (!formData.locality.trim()) newErrors.locality = 'Locality is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    
    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Please enter a valid 6-digit PIN code';
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
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Store Address</h2>
        <p className="text-gray-600">Where is your store located?</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-orange-900 mb-2">📍 Important Note</h3>
        <p className="text-sm text-orange-800">
          This address will be used for product delivery, customer visits, and business correspondence. 
          Make sure it's accurate and accessible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="store-province" className="text-sm font-medium text-gray-700">
            Province/State *
          </Label>
          <Input
            id="store-province"
            type="text"
            placeholder="Enter province or state"
            value={formData.province}
            onChange={(e) => handleChange('province', e.target.value)}
            className={errors.province ? 'border-red-500' : ''}
          />
          {errors.province && <p className="text-sm text-red-600">{errors.province}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-city" className="text-sm font-medium text-gray-700">
            City *
          </Label>
          <Input
            id="store-city"
            type="text"
            placeholder="Enter city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="store-locality" className="text-sm font-medium text-gray-700">
            Locality *
          </Label>
          <Input
            id="store-locality"
            type="text"
            placeholder="Enter locality/area"
            value={formData.locality}
            onChange={(e) => handleChange('locality', e.target.value)}
            className={errors.locality ? 'border-red-500' : ''}
          />
          {errors.locality && <p className="text-sm text-red-600">{errors.locality}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-pinCode" className="text-sm font-medium text-gray-700">
            PIN Code *
          </Label>
          <Input
            id="store-pinCode"
            type="text"
            placeholder="Enter 6-digit PIN code"
            value={formData.pinCode}
            onChange={(e) => handleChange('pinCode', e.target.value)}
            className={errors.pinCode ? 'border-red-500' : ''}
            maxLength={6}
          />
          {errors.pinCode && <p className="text-sm text-red-600">{errors.pinCode}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-addressLabel" className="text-sm font-medium text-gray-700">
          Store Address Label
        </Label>
        <Input
          id="store-addressLabel"
          type="text"
          placeholder="e.g., Main Store, Branch Office, etc."
          value={formData.addressLabel}
          onChange={(e) => handleChange('addressLabel', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="store-landMark" className="text-sm font-medium text-gray-700">
          Landmark
        </Label>
        <Input
          id="store-landMark"
          type="text"
          placeholder="Nearby landmark (helps customers find you)"
          value={formData.landMark}
          onChange={(e) => handleChange('landMark', e.target.value)}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for store address:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure the address is complete and accurate</li>
          <li>• Add clear landmarks to help customers find your store</li>
          <li>• Use a descriptive address label for easy identification</li>
          <li>• This address will appear on your store profile</li>
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

export default StoreAddressStep;
