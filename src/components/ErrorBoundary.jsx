import { Component } from "react";
import { WarningIcon } from "./ui/icons";

/**
 * 错误边界组件 - 捕获子组件树中的 JavaScript 错误
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif" }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WarningIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">出错了</h2>
            <p className="text-sm text-gray-600 mb-6">应用遇到了一个错误，请刷新页面重试</p>
            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={this.handleRetry}
                className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                重试
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
