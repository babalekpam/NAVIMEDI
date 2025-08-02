import { useState } from 'react';
import { Package, TrendingUp, AlertTriangle, ShoppingCart, Truck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  avgDailyUsage: number;
  daysUntilEmpty: number;
  autoReorderEnabled: boolean;
  supplier: string;
  cost: number;
  lastOrderDate: string;
  predictedDemand: number;
}

interface SmartRecommendation {
  type: 'reorder' | 'reduce' | 'optimize';
  medication: string;
  currentStock: number;
  recommendedAction: string;
  potentialSaving: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export function SmartInventoryWidget() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'alerts' | 'recommendations'>('overview');

  const inventoryItems: InventoryItem[] = [
    {
      id: 'INV001',
      name: 'Metformin 500mg',
      currentStock: 245,
      minStock: 100,
      maxStock: 500,
      avgDailyUsage: 15,
      daysUntilEmpty: 16,
      autoReorderEnabled: true,
      supplier: 'Teva Pharmaceuticals',
      cost: 0.12,
      lastOrderDate: '2025-01-25',
      predictedDemand: 18
    },
    {
      id: 'INV002',
      name: 'Insulin Glargine',
      currentStock: 12,
      minStock: 25,
      maxStock: 100,
      avgDailyUsage: 3,
      daysUntilEmpty: 4,
      autoReorderEnabled: false,
      supplier: 'Sanofi',
      cost: 45.67,
      lastOrderDate: '2025-01-20',
      predictedDemand: 4
    },
    {
      id: 'INV003',
      name: 'Lisinopril 10mg',
      currentStock: 89,
      minStock: 75,
      maxStock: 300,
      avgDailyUsage: 12,
      daysUntilEmpty: 7,
      autoReorderEnabled: true,
      supplier: 'Mylan',
      cost: 0.08,
      lastOrderDate: '2025-01-22',
      predictedDemand: 14
    }
  ];

  const smartRecommendations: SmartRecommendation[] = [
    {
      type: 'reorder',
      medication: 'Insulin Glargine',
      currentStock: 12,
      recommendedAction: 'Immediate reorder - Critical stock level',
      potentialSaving: 0,
      urgency: 'critical'
    },
    {
      type: 'optimize',
      medication: 'Metformin 500mg',
      currentStock: 245,
      recommendedAction: 'Switch to bulk supplier for 15% cost reduction',
      potentialSaving: 156.78,
      urgency: 'medium'
    },
    {
      type: 'reduce',
      medication: 'Atorvastatin 20mg',
      currentStock: 450,
      recommendedAction: 'Reduce order quantity - Lower than predicted demand',
      potentialSaving: 89.45,
      urgency: 'low'
    }
  ];

  const getStockPercentage = (item: InventoryItem) => {
    return (item.currentStock / item.maxStock) * 100;
  };

  const getStockStatus = (item: InventoryItem) => {
    const percentage = getStockPercentage(item);
    if (percentage < 20) return { color: 'text-red-600 bg-red-50', label: 'Critical' };
    if (percentage < 40) return { color: 'text-orange-600 bg-orange-50', label: 'Low' };
    if (percentage < 80) return { color: 'text-green-600 bg-green-50', label: 'Good' };
    return { color: 'text-blue-600 bg-blue-50', label: 'High' };
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
  const criticalItems = inventoryItems.filter(item => getStockPercentage(item) < 20).length;
  const autoReorderItems = inventoryItems.filter(item => item.autoReorderEnabled).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Smart Inventory Management
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('overview')}
            >
              Overview
            </Button>
            <Button
              size="sm"
              variant={selectedTab === 'alerts' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('alerts')}
            >
              Alerts
            </Button>
            <Button
              size="sm"
              variant={selectedTab === 'recommendations' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('recommendations')}
            >
              AI Insights
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Total Items</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{inventoryItems.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Total Value</span>
                </div>
                <p className="text-2xl font-bold text-green-700">${totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Critical Items</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{criticalItems}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Auto-Reorder</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{autoReorderItems}</p>
              </div>
            </div>

            {/* Inventory Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Current Inventory</h3>
              {inventoryItems.map((item) => {
                const status = getStockStatus(item);
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Supplier: {item.supplier}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={status.color}>{status.label}</Badge>
                        <p className="text-sm text-gray-600 mt-1">${item.cost} per unit</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Current Stock</p>
                        <p className="font-semibold">{item.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Days Until Empty</p>
                        <p className="font-semibold">{item.daysUntilEmpty} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Daily Usage</p>
                        <p className="font-semibold">{item.avgDailyUsage}/day</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Predicted Demand</p>
                        <p className="font-semibold">{item.predictedDemand}/day</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Min: {item.minStock}</span>
                        <span>Current: {item.currentStock}</span>
                        <span>Max: {item.maxStock}</span>
                      </div>
                      <Progress value={getStockPercentage(item)} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {item.autoReorderEnabled ? (
                          <Badge className="text-green-600 bg-green-100">Auto-Reorder ON</Badge>
                        ) : (
                          <Badge variant="outline">Manual Reorder</Badge>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Reorder
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === 'alerts' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Inventory Alerts</h3>
            {inventoryItems
              .filter(item => getStockPercentage(item) < 40)
              .map((item) => {
                const status = getStockStatus(item);
                return (
                  <div key={item.id} className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-800">{item.name}</h4>
                        <p className="text-sm text-red-600">
                          Only {item.daysUntilEmpty} days of stock remaining
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          Current: {item.currentStock} | Min Required: {item.minStock}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <Truck className="w-4 h-4 mr-2" />
                          Rush Order
                        </Button>
                        <Button size="sm" variant="outline">
                          Contact Supplier
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">AI-Powered Recommendations</h3>
            {smartRecommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{rec.medication}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.recommendedAction}</p>
                  </div>
                  <Badge className={getUrgencyColor(rec.urgency)}>
                    {rec.urgency}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-600">Current Stock: </span>
                    <span className="font-medium">{rec.currentStock}</span>
                    {rec.potentialSaving > 0 && (
                      <>
                        <span className="text-gray-600 ml-4">Potential Saving: </span>
                        <span className="font-medium text-green-600">${rec.potentialSaving}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Accept</Button>
                    <Button size="sm" variant="outline">Dismiss</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}