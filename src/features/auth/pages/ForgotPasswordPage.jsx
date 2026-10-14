import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ROUTES } from '@/constants/routes.constants';
import { ERP_ICONS } from '@/shared/icons';

export const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await authApi.forgotPassword(data.identifier);
      setSuccessMessage(res.message);
    } catch (err) {
      setErrorMessage(err.message || "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-forgot-password-container text-start animate-fade-in">
      <div className="text-center mb-3">
        <h4 className="fw-bold text-main mb-1">Parolni tiklash</h4>
        <p className="text-muted-custom fs-7">Foydalanuvchi nomi yoki email manzilingizni kiriting</p>
      </div>

      {successMessage ? (
        <div className="text-center py-3">
          <div className="mb-3 text-success">
            <i className={`bi ${ERP_ICONS.CHECK}`} style={{ fontSize: '2.5rem' }}></i>
          </div>
          <p className="fs-7 text-main mb-4">{successMessage}</p>
          <Link to={ROUTES.PUBLIC.LOGIN} className="btn btn-primary w-100">
            Tizimga kirish sahifasiga qaytish
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && (
            <div className="alert alert-danger py-2 px-3 fs-7 mb-3" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fs-7 fw-medium text-main">
              Foydalanuvchi nomi yoki Email
            </label>
            <input
              type="text"
              className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
              placeholder="alex.vance@kotyol.com"
              {...register('identifier', { required: "Foydalanuvchi nomi yoki email kiritilishi shart" })}
            />
            {errors.identifier && <div className="invalid-feedback">{errors.identifier.message}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={isLoading}>
            {isLoading ? 'Yuborilmoqda...' : 'Tiklash ko\'rsatmasini yuborish'}
          </button>

          <div className="text-center">
            <Link to={ROUTES.PUBLIC.LOGIN} className="text-muted-custom fs-7 text-decoration-none">
              <i className={`bi ${ERP_ICONS.CHEVRON_LEFT} me-1`}></i> Kirish sahifasiga qaytish
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
