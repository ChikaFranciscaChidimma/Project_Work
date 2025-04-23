
import React from "react";
import SalesChart from "./SalesChart";
import InventoryStatus from "./InventoryStatus";
import AlertsWidget from "./AlertsWidget";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Package, Users } from "lucide-react";

const statsCards = [
  {
    title: "Total Sales",
    value: "$12,456",
    change: "+12.5%",
    trend: "up",
    description: "vs last week",
    icon: DollarSign,
    iconColor: "bg-primary/20 text-primary",
  },
  {
    title: "Total Orders",
    value: "438",
    change: "+5.2%",
    trend: "up",
    description: "vs last week",
    icon: CreditCard,
    iconColor: "bg-secondary/20 text-secondary",
  },
  {
    title: "Active Customers",
    value: "237",
    change: "+18.7%",
    trend: "up",
    description: "vs last month",
    icon: Users,
    iconColor: "bg-accent/20 text-accent",
  },
  {
    title: "Low Stock Items",
    value: "3",
    change: "-2",
    trend: "down",
    description: "since yesterday",
    icon: Package,
    iconColor: "bg-warning/20 text-warning",
  },
];

const DashboardLayout = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div
                  className={`p-2 rounded-lg ${stat.iconColor}`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.trend === "up" ? (
                  <div className="bg-success/10 text-success flex items-center gap-1 text-xs font-medium py-1 px-2 rounded">
                    <ArrowUp className="h-3 w-3" />
                    {stat.change}
                  </div>
                ) : (
                  <div className="bg-destructive/10 text-destructive flex items-center gap-1 text-xs font-medium py-1 px-2 rounded">
                    <ArrowDown className="h-3 w-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SalesChart />
        <InventoryStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AlertsWidget />
        </div>
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Transactions will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
