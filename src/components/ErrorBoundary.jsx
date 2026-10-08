import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('rupeetrack_jwt_token');
      localStorage.removeItem('rupeetrack_auth_user');
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
          <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <span className="text-3xl">₹</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Application Notice</h2>
            <p className="mb-6 text-sm text-slate-400">
              An unexpected render state occurred. Click below to refresh your session smoothly.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-98"
            >
              Reload RupeeTrack App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
