import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorState from "./ErrorState";

export interface ErrorBoundaryFallbackProps {
  error: Error | null;
  reset: () => void;
}

export type ErrorBoundaryFallback =
  | ReactNode
  | ((props: ErrorBoundaryFallbackProps) => ReactNode);

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ErrorBoundaryFallback;
  onReset?: () => void;
  level?: "root" | "route";
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[ErrorBoundary:${this.props.level ?? "root"}] Uncaught error:`,
      error,
      errorInfo
    );
  }

  public reset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback({
            error: this.state.error,
            reset: this.reset,
          });
        }
        return this.props.fallback;
      }

      if (this.props.level === "route") {
        return (
          <ErrorState
            code="Application Error"
            title="Something Went Wrong"
            message={
              this.state.error?.message ||
              "An unexpected error occurred while loading this page. You can try again or return to the homepage."
            }
            onRetry={this.reset}
          />
        );
      }

      // Root level fallback (zero wouter dependencies, works outside Router context)
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 text-slate-900 font-sans">
          <div className="w-full max-w-lg p-8 sm:p-12 bg-white rounded-2xl shadow-xl shadow-black/5 border border-slate-100 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Application Error
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Something Went Wrong
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {this.state.error?.message ||
                  "A critical system error occurred. We apologize for the inconvenience."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-xl font-semibold bg-[#1F4E79] text-white hover:bg-[#1F4E79]/90 shadow-lg shadow-[#1F4E79]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F4E79] focus:ring-offset-2"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-xl font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
