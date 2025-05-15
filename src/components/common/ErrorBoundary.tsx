"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    // You could also log the error to an error reporting service here
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded">
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
          {/* You could add a button to try reloading or report the issue */}
        </div>
      );
    }

    return this.props.children;
  }
} 