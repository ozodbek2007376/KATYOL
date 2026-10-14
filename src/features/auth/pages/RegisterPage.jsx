import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { notifySuccess } from '@/services/notification.service';
import { ROUTES } from '@/constants/routes.constants';
import { ERP_ICONS } from '@/shared/icons';

export const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async (data) => {
    setErrorMessage('');
    setLoading(true);
    try {
      await authApi.register({
        phone: data.phone,
        password: data.password,
        fullName: data.fullName,
        organizationName: data.organizationName,
        branchName: data.branchName,
        currency: data.currency,
      });
      notifySuccess("Ro'yxatdan muvaffaqiyatli o'tildi. Tizimga kirishingiz mumkin.");
      navigate('/login');
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || err.message || "Xatolik yuz berdi. Malumotlarni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-login-container text-start animate-fade-in">
      <div className="text-center mb-3">
        <h4 className="fw-bold text-main mb-1">Ro'yxatdan o'tish</h4>
        <p className="text-muted-custom fs-7">Yangi tashkilot va filial yaratish</p>
      </div>

      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 fs-7 mb-3" role="alert">
          <i className={`bi ${ERP_ICONS.EXCLAMATION} fs-5`}></i>
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Telefon raqam */}
        <div className="mb-3">
          <label className="form-label fs-7 fw-medium text-main">Telefon raqam</label>
          <div className="input-group">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className="bi bi-telephone-fill"></i>
            </span>
            <input
              type="tel"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="+998901234567"
              {...register('phone', {
                required: "Telefon raqam kiritilishi shart",
                pattern: {
                  value: /^\+?[0-9]{9,15}$/,
                  message: "Noto'g'ri telefon raqami shakli",
                }
              })}
              onInput={(e) => {
                let clean = e.target.value.replace(/[^\d+]/g, '');
                if (clean.includes('+')) {
                  const hasLeading = clean.startsWith('+');
                  clean = (hasLeading ? '+' : '') + clean.replace(/\+/g, '');
                }
                e.target.value = clean;
              }}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
          </div>
        </div>

        {/* F.I.Sh (To'liq ism) */}
        <div className="mb-3">
          <label className="form-label fs-7 fw-medium text-main">To'liq ism (F.I.Sh)</label>
          <div className="input-group">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className="bi bi-person-fill"></i>
            </span>
            <input
              type="text"
              className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
              placeholder="Masalan: Abdullayev Vali"
              {...register('fullName', { required: "To'liq ism kiritilishi shart" })}
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
          </div>
        </div>

        {/* Tashkilot nomi */}
        <div className="mb-3">
          <label className="form-label fs-7 fw-medium text-main">Tashkilot nomi</label>
          <div className="input-group">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className="bi bi-building"></i>
            </span>
            <input
              type="text"
              className={`form-control ${errors.organizationName ? 'is-invalid' : ''}`}
              placeholder="Masalan: Kotyol Holding"
              {...register('organizationName', { required: "Tashkilot nomi kiritilishi shart" })}
            />
            {errors.organizationName && <div className="invalid-feedback">{errors.organizationName.message}</div>}
          </div>
        </div>

        {/* Filial nomi */}
        <div className="mb-3">
          <label className="form-label fs-7 fw-medium text-main">Filial nomi</label>
          <div className="input-group">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className="bi bi-geo-alt-fill"></i>
            </span>
            <input
              type="text"
              className={`form-control ${errors.branchName ? 'is-invalid' : ''}`}
              placeholder="Masalan: Toshkent filiali"
              {...register('branchName', { required: "Filial nomi kiritilishi shart" })}
            />
            {errors.branchName && <div className="invalid-feedback">{errors.branchName.message}</div>}
          </div>
        </div>

        {/* Valyuta */}
        <div className="mb-3">
          <label className="form-label fs-7 fw-medium text-main">Asosiy valyuta</label>
          <div className="input-group">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className="bi bi-cash-coin"></i>
            </span>
            <select
              className={`form-select ${errors.currency ? 'is-invalid' : ''}`}
              defaultValue="UZS"
              {...register('currency', { required: "Valyuta tanlanishi shart" })}
            >
              <option value="UZS">UZS (So'm)</option>
              <option value="USD">USD (Dollar)</option>
            </select>
            {errors.currency && <div className="invalid-feedback">{errors.currency.message}</div>}
          </div>
        </div>

        {/* Parol */}
        <div className="mb-3">
          <label className="form-label fs-7 fw-medium text-main">Parol</label>
          <div className="input-group">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className="bi bi-lock-fill"></i>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              {...register('password', {
                required: "Parol kiritilishi shart",
                minLength: { value: 6, message: "Parol kamida 6ta belgidan iborat bo'lishi kerak" }
              })}
            />
            <button
              type="button"
              className="btn btn-outline-secondary border-custom text-muted-custom"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
            </button>
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>
        </div>

        {/* Parolni tasdiqlash */}
        <div className="mb-4">
          <label className="form-label fs-7 fw-medium text-main">Parolni takrorlang</label>
          <div className="input-group">
            <span className="input-group-text bg-body-custom border-custom text-muted-custom">
              <i className="bi bi-lock-fill"></i>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: "Parolni tasdiqlash shart",
                validate: value => value === password || "Parollar mos kelmadi"
              })}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
          </div>
        </div>

        {/* Tugma */}
        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-medium d-flex align-items-center justify-content-center gap-2 mb-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Ro'yxatdan o'tilmoqda...</span>
            </>
          ) : (
            <>
              <i className="bi bi-person-plus-fill"></i>
              <span>Ro'yxatdan o'tish</span>
            </>
          )}
        </button>

        <div className="text-center">
          <span className="text-muted-custom fs-8">Profilingiz bormi? </span>
          <Link to="/login" className="text-primary fs-8 fw-medium text-decoration-none">
            Kirish
          </Link>
        </div>
      </form>
    </div>
  );
};
