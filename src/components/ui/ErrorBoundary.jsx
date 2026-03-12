import { Component } from "react";
import { WarningIcon } from "../ui/icons";

/**
 * Error Boundary 组件
 * 捕获子组件错误并显示友好的错误界面
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WarningIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              哎呀，出错了
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              应用遇到了一些问题。请刷新页面重试，如果问题持续存在，请联系支持。
            </p>
            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-xs font-medium text-gray-500 cursor-pointer mb-2">
                  错误详情（开发模式）
                </summary>
                <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
