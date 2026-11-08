import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('30FIT ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[80vh] flex flex-col justify-center items-center text-center p-6 space-y-6 animate-fadeIn select-none bg-[#0d0f12] text-white">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)]">
            <AlertTriangle size={36} />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {this.props.fallbackTitle || 'UNABLE TO RESUME WORKOUT'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Your saved workout is still safely stored locally. We encountered a display glitch while restoring the screen.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-white/40 text-left overflow-x-auto max-w-sm mx-auto">
                {this.state.error.message}
              </div>
            )}
          </div>

          <div className="w-full max-w-xs space-y-2.5 pt-2">
            <button
              onClick={this.handleTryAgain}
              className="w-full py-3.5 rounded-2xl bg-[#a3e635] text-black font-black text-sm hover:bg-[#bef264] transition shadow-[0_0_20px_rgba(163,230,53,0.35)] active:scale-98 flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>TRY AGAIN</span>
            </button>

            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>RETURN TO DASHBOARD</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

