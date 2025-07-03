import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-3 sm:space-y-4 p-4 md:p-8 pt-6 animate-in fade-in-50 duration-500">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <Skeleton className="h-8 w-32 sm:h-9 sm:w-40" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Search and filters skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Skeleton className="h-10 flex-1" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Products table skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Table header skeleton */}
            <div className="grid grid-cols-7 gap-4 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            {/* Table rows skeleton */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 py-3 items-center">
                {/* Product info */}
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 sm:hidden" />
                  </div>
                </div>
                
                {/* SKU */}
                <Skeleton className="h-4 w-20 hidden sm:block" />
                
                {/* Category */}
                <Skeleton className="h-4 w-16 hidden md:block" />
                
                {/* Price */}
                <Skeleton className="h-4 w-16" />
                
                {/* Stock */}
                <Skeleton className="h-4 w-12 hidden sm:block" />
                
                {/* Status */}
                <Skeleton className="h-6 w-16 rounded-full" />
                
                {/* Actions */}
                <div className="flex space-x-1">
                  <Skeleton className="h-7 w-7 rounded" />
                  <Skeleton className="h-7 w-7 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
