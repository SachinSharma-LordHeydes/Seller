"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function ProfileSetupLoading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Setting up your profile...</p>
        </CardContent>
      </Card>
    </div>
  );
}
