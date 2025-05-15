
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Button 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/login")}
          className="w-full mt-2"
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
