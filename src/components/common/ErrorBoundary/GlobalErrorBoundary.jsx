import React from 'react';
import { LuTriangleAlert, LuRefreshCw, LuLayoutDashboard } from 'react-icons/lu';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Render Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-custom p-4 text-center">
          <div
            className="card border-custom shadow-lg p-4 p-md-5 rounded-4 animate-fade-in"
            style={{ maxWidth: '520px', width: '100%' }}
          >
            <div
              className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-3 mx-auto"
              style={{ width: '70px', height: '70px' }}
            >
              <LuTriangleAlert className="fs-1" />
            </div>

            <h5 className="fw-bold text-main mb-2 font-heading">
              Kutilmagan Texnik Xatolik Yuz Berdi
            </h5>

            <p className="fs-7 text-muted-custom mb-4">
              Tizimda ma'lumotlarni ko'rsatishda kichik uzilish yuz berdi. Xavotir olmang,
              ma'lumotlaringiz xavfsiz. Sahifani yangilash orqali davom etishingiz mumkin.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                onClick={this.handleReload}
              >
                <LuRefreshCw className="fs-6" /> Sahifani Yangilash
              </button>
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                onClick={this.handleGoHome}
              >
                <LuLayoutDashboard className="fs-6" /> Bosh Sahifaga Qaytish
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
