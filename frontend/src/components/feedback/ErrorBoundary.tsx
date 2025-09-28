import { Component, type ReactNode } from "react";
import { Button } from "../ui/Button";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: unknown) {
    console.error("ErrorBoundary", error, info);
  }
  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto py-24 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Eroare aplicație</h1>
          <p className="text-gray-600 mb-6">
            Ne pare rău, ceva nu a funcționat corect.
          </p>
          <Button onClick={this.reset}>Reîncarcă secțiunea</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
