"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
    children: [
      { title: "All Products", href: "/products" },
      { title: "Add Product", href: "/products/add" },
      // { title: "Categories", href: "/products/categories" },
      { title: "Inventory", href: "/products/inventory" },
    ],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: TrendingUp,
    // children: [
    //   { title: "Campaigns", href: "/marketing/campaigns" },
    //   { title: "Discounts", href: "/marketing/discounts" },
    //   { title: "Promotions", href: "/marketing/promotions" },
    //   { title: "Ads", href: "/marketing/ads" },
    // ],
  },
  {
    title: "Finances",
    href: "/finances",
    icon: CreditCard,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedItems.includes(title);

  return (
    <div className="pb-12 w-full md:w-64 bg-card border-r h-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-2">
            <Store className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            <h2 className="text-base sm:text-lg font-semibold">Seller Hub</h2>
          </div>
        </div>
        <div className="px-3">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {sidebarNavItems.map((item, index) => (
                <div key={index}>
                  {item.children ? (
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm p-2"
                        onClick={() => toggleExpanded(item.title)}
                      >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                        {isExpanded(item.title) ? (
                          <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
                        )}
                      </Button>
                      {isExpanded(item.title) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child, childIndex) => (
                            <Button
                              key={childIndex}
                              asChild
                              variant={
                                pathname === child.href ? "secondary" : "ghost"
                              }
                              size="sm"
                              className="w-full justify-start text-xs p-2"
                            >
                              <Link href={child.href}>
                                <span className="truncate">{child.title}</span>
                              </Link>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      asChild
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm p-2"
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
