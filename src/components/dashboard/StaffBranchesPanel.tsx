
import { useState, useEffect } from "react";
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
import { Users, Building } from "lucide-react";
import { format, parseISO } from "date-fns";

// Mock staff data with updated branch names
const staffData = [
  { id: "1", name: "Chika", role: "Admin", branch: "All Branches", lastActive: "Today, 2:30 PM", status: "Active" },
  { id: "2", name: "Maria Johnson", role: "BA", branch: "Branch 1", lastActive: "Today, 1:15 PM", status: "Active" },
  { id: "3", name: "Robert Wilson", role: "BA", branch: "Branch 2", lastActive: "Today, 3:45 PM", status: "Active" },
];

// Mock branches data with updated names
const branchesData = [
  { id: "1", name: "Branch 1", address: "123 Main St, New York, NY 10001", manager: "Maria Johnson (BA)", salesToday: "$3,456.78", status: "Open" },
  { id: "2", name: "Branch 2", address: "456 Market St, New York, NY 10002", manager: "Robert Wilson (BA)", salesToday: "$2,198.50", status: "Open" },
];

interface AttendanceRecord {
  id: string;
  userId: string;
  name: string;
  role: string;
  branch: string;
  status: string;
  timeIn: string;
  timeOut: string;
  date: string;
  duration: string;
}

const StaffBranchesPanel = () => {
  const [activeTab, setActiveTab] = useState("staff");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  useEffect(() => {
    // Load attendance records from localStorage (created by Clock In/Out)
    const records = JSON.parse(localStorage.getItem('staff-attendance') || '[]');
    setAttendanceRecords(records);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Staff & Branches
        </CardTitle>
        <CardDescription>View staff members and branch locations</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="staff" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff Members
            </TabsTrigger>
            <TabsTrigger value="branches">
              <Building className="h-4 w-4 mr-2" />
              Branch Locations
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Users className="h-4 w-4 mr-2" />
              Attendance Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="staff">
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
          
          <TabsContent value="attendance">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Attendance records are automatically generated when staff clock in and out.
              </p>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.branch}</TableCell>
                      <TableCell>{record.timeIn}</TableCell>
                      <TableCell>{record.timeOut}</TableCell>
                      <TableCell>{record.duration || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No attendance records found. Records are generated when staff clock in and out.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StaffBranchesPanel;
