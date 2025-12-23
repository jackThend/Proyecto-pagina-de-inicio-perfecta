import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-4xl font-bold text-rose-500 mb-4">Algo salió mal</h1>
          <p className="text-xl mb-6">La aplicación ha encontrado un error crítico.</p>
          <div className="bg-black/30 p-4 rounded-lg text-left font-mono text-sm text-rose-300 max-w-2xl overflow-auto border border-rose-500/30">
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
