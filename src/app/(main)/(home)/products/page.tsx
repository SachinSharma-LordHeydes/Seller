"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { gql, useQuery } from "@apollo/client";
import { Download, Edit, Eye, Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define the GraphQL query
const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    getAllproducts {
      id
      name
      description
      price
      sku
      stock
      status
      sellerId
      images {
        id
        url
        altText
        isPrimary
      }
      features {
        id
        feature
        value
      }
    }
  }
`;

export default function ProductsPage() {
  const { data, loading, error } = useQuery(GET_ALL_PRODUCTS);
  console.log("data-->",data)
  const [searchQuery, setSearchQuery] = useState(""); // For search functionality
  const router = useRouter();

  // Handle loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-3 sm:space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading products...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex-1 space-y-3 sm:space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Error: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle empty data
  const productsData = data?.getAllproducts || [];
  if (productsData.length === 0) {
    return (
      <div className="flex-1 space-y-3 sm:space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No products found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter products based on search query
  const filteredProducts = productsData.filter(
    (product: any) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-3 sm:space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Products
        </h2>
        <div className="flex items-center space-x-2">
          <Button asChild size="sm">
            <Link href="/products/add">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Add Product</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm bg-transparent"
          >
            <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm bg-transparent"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Product Inventory
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your product catalog and inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] text-xs sm:text-sm">
                    Product
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">
                    SKU
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">
                    Category
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Price</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">
                    Stock
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <img
                          src={
                            product.images.find((img: any) => img.isPrimary)
                              ?.url ||
                            product.images[0]?.url ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={product.name}
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {product.sku}
                          </div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {/* Category not in schema, omit or fetch */}
                            N/A
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-xs sm:text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                      {/* Category not in schema, omit or fetch */}
                      N/A
                    </TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                      <span
                        className={product.stock === 0 ? "text-red-600" : ""}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "ACTIVE"
                            ? "default"
                            : product.status === "OUT_OF_STOCK"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {product.status.toLowerCase().replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            router.push(`/products/view/${product.id}`)
                          }
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            router.push(`/products/edit/${product.id}`)
                          }
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
