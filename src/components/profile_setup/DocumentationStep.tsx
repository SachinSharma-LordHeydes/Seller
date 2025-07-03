"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { DocumentationDetails } from '@/interfaces/profileSetup.interface';

interface DocumentationStepProps {
  data: DocumentationDetails;
  onUpdate: (data: DocumentationDetails) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const DocumentationStep = ({ data, onUpdate, onNext, onPrevious }: DocumentationStepProps) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Partial<DocumentationDetails>>({});

  const handleChange = (field: keyof DocumentationDetails, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateForm = () => {
    const newErrors: Partial<DocumentationDetails> = {};
    
    if (!formData.panNumber.trim()) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!validatePAN(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handlePANChange = (value: string) => {
    // Convert to uppercase and limit to 10 characters
    const formattedValue = value.toUpperCase().slice(0, 10);
    handleChange('panNumber', formattedValue);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Documentation</h2>
        <p className="text-gray-600">Legal verification for your seller account</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900 mb-1">Why do we need this?</h3>
            <p className="text-sm text-yellow-800">
              PAN verification is required by Indian tax regulations for all sellers. 
              This helps us comply with legal requirements and ensures secure transactions.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="panNumber" className="text-sm font-medium text-gray-700">
          PAN Number *
        </Label>
        <Input
          id="panNumber"
          type="text"
          placeholder="Enter PAN number (e.g., ABCDE1234F)"
          value={formData.panNumber}
          onChange={(e) => handlePANChange(e.target.value)}
          className={`font-mono text-lg tracking-wider ${errors.panNumber ? 'border-red-500' : ''}`}
          maxLength={10}
        />
        {errors.panNumber && <p className="text-sm text-red-600">{errors.panNumber}</p>}
        <p className="text-sm text-gray-500">
          Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">📋 PAN Number Guidelines:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Must be exactly 10 characters long</li>
          <li>• Format: AAAAA1111A (5 letters, 4 numbers, 1 letter)</li>
          <li>• All letters must be uppercase</li>
          <li>• Make sure it matches your official PAN card</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Privacy Note:</strong> Your PAN information is encrypted and stored securely. 
              We use this only for tax compliance and will never share it with third parties.
            </p>
          </div>
        </div>
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

export default DocumentationStep;
