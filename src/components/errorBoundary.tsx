import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
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
    console.error('Error sin capturar:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md p-6">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'Ha ocurrido un error inesperado.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
