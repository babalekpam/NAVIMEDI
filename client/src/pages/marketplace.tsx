import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Star, ShoppingCart, Eye, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PublicHeader } from "@/components/layout/public-header";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  status: string;
  imageUrls: string[];
  supplierName: string;
  supplierContact: {
    email: string;
    phone: string;
    address: string;
  };
  rating: number;
  reviews: number;
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/marketplace/products"],
  });

  const categories = [
    "All Categories",
    "Diagnostic Equipment", 
    "Surgical Instruments",
    "Patient Monitoring",
    "Laboratory Equipment",
    "Medical Supplies"
  ];

  const priceRanges = [
    "All Prices",
    "Under $100",
    "$100 - $500", 
    "$500 - $1,000",
    "$1,000 - $5,000",
    "Over $5,000"
  ];

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === "All Categories" || 
                           product.category === selectedCategory;
    
    const matchesPrice = !priceRange || priceRange === "All Prices" || 
                        checkPriceRange(product.price, priceRange);
    
    return matchesSearch && matchesCategory && matchesPrice && product.status === "active";
  });

  function checkPriceRange(price: number, range: string): boolean {
    switch (range) {
      case "Under $100": return price < 100;
      case "$100 - $500": return price >= 100 && price <= 500;
      case "$500 - $1,000": return price >= 500 && price <= 1000;
      case "$1,000 - $5,000": return price >= 1000 && price <= 5000;
      case "Over $5,000": return price > 5000;
      default: return true;
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Medical Equipment Marketplace
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Discover quality medical equipment from trusted suppliers worldwide
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products, suppliers, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-300">
              {filteredProducts.length} products found
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search criteria or browse different categories
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="relative">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-t-lg flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-blue-500 dark:text-blue-300" />
                    </div>
                  )}
                  <Badge
                    variant={product.stockQuantity > 0 ? "default" : "destructive"}
                    className="absolute top-2 right-2"
                  >
                    {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating || 4.5)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                      ({product.reviews || 12} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${product.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {product.stockQuantity}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    by <span className="font-medium">{product.supplierName}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{product.name}</DialogTitle>
                          <DialogDescription>
                            Complete product information and supplier details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                              <img
                                src={product.imageUrls[0]}
                                alt={product.name}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-16 w-16 text-blue-500 dark:text-blue-300" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Product Details</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <strong>SKU:</strong> {product.sku}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <strong>Category:</strong> {product.category}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <strong>Price:</strong> ${product.price.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong>Stock:</strong> {product.stockQuantity} units
                              </p>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {product.description}
                              </p>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-semibold mb-2">Supplier Information</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <strong>{product.supplierName}</strong>
                              </p>
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2" />
                                  {product.supplierContact?.email || "Contact via platform"}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {product.supplierContact?.phone || "Contact via platform"}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {product.supplierContact?.address || "Address available on request"}
                                </div>
                              </div>
                            </div>
                            
                            <Button className="w-full" size="lg">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Request Quote
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button size="sm" disabled={product.stockQuantity === 0}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}