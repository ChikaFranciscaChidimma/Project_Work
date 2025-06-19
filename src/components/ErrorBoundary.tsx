// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  resetOnChange?: any[]; // Add this prop
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error when dependencies change
    if (this.state.hasError && this.props.resetOnChange) {
      const changed = this.props.resetOnChange.some(
        (dep, i) => dep !== prevProps.resetOnChange?.[i]
      );
      if (changed) {
        this.setState({ hasError: false });
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Application Error</AlertTitle>
            <AlertDescription>
              <div className="mb-2">
                <p className="font-medium">{this.state.error?.message}</p>
                {this.state.errorInfo && (
                  <details className="mt-2 text-sm">
                    <summary>Component stack</summary>
                    <pre className="mt-1 overflow-auto text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={this.handleReset}
                className="mt-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;