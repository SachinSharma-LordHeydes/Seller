"use client";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { TopProducts } from "@/components/dashboard/top-products";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

const GET_USER_DETAILS = gql`
  query GetAuth {
    auth @client {
      id
      profile {
        id
      }
    }
  }
`;

const page = () => {
  const router = useRouter();
  const { data, loading } = useQuery(GET_USER_DETAILS);

  useEffect(() => {
    if (!loading && data?.auth && !data.auth.profile) {
      router.push("/profile_setup");
    }
  }, [loading, data]);
  // if (loading) return <Loading />;

  return (
    <div className="flex-1 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-3 sm:space-y-4">
          <DashboardOverview />
          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Sales Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Suspense
                  fallback={<div className="text-sm">Loading chart...</div>}
                >
                  <SalesChart />
                </Suspense>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-sm">
                  You have 265 orders this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopProducts />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage your store efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-3 sm:space-y-4">
          <DashboardOverview />
          <SalesChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default page;
