"use client";

import { useEffect } from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UploadLoadingProps {
  stage: string;
  progress: number;
  isActive: boolean;
}

const UploadLoading: React.FC<UploadLoadingProps> = ({ stage, progress, isActive }) => {
  useEffect(() => {
    if (!isActive) return;

    // Ensure progress doesn't exceed 100%
    if (progress >= 100) {
      setTimeout(() => {}, 500); // Small delay for finalizing animation
    }
  }, [isActive, progress]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg">
      <Card className="w-full max-w-md bg-white/95 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Upload className="w-8 h-8 text-primary animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-800">Uploading Product</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600 text-center">{stage}</p>
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">{Math.round(progress)}% Complete</p>
          </div>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadLoading;