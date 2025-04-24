import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Building } from "lucide-react";

// Mock staff data with updated branch names
const staffData = [
  { id: 1, name: "Chika", role: "Admin", branch: "All Branches", lastActive: "Today, 2:30 PM", status: "Active" },
  { id: 2, name: "Maria Johnson", role: "BA", branch: "Branch 1", lastActive: "Today, 1:15 PM", status: "Active" },
  { id: 3, name: "Robert Wilson", role: "BA", branch: "Branch 2", lastActive: "Today, 3:45 PM", status: "Active" },
];

// Mock branches data with updated names
const branchesData = [
  { id: 1, name: "Branch 1", address: "123 Main St, New York, NY 10001", manager: "Maria Johnson (BA)", salesToday: "$3,456.78", status: "Open" },
  { id: 2, name: "Branch 2", address: "456 Market St, New York, NY 10002", manager: "Robert Wilson (BA)", salesToday: "$2,198.50", status: "Open" },
];

const StaffBranchesPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Staff & Branches
        </CardTitle>
        <CardDescription>Manage your staff members and branch locations</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="staff">
          <TabsList className="mb-4">
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff Members
            </TabsTrigger>
            <TabsTrigger value="branches">
              <Building className="h-4 w-4 mr-2" />
              Branch Locations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="staff">
            <div className="flex justify-end mb-4">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffData.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.branch}</TableCell>
                    <TableCell>{staff.lastActive}</TableCell>
                    <TableCell>
                      <Badge variant={staff.status === "Active" ? "default" : "secondary"}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="branches">
            <div className="flex justify-end mb-4">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Today's Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchesData.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>{branch.manager}</TableCell>
                    <TableCell>{branch.salesToday}</TableCell>
                    <TableCell>
                      <Badge variant={branch.status === "Open" ? "default" : "secondary"}>
                        {branch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StaffBranchesPanel;
