
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by error boundary:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" /> 
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {this.state.error?.message || "An error occurred while rendering this component."}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
