import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/authApi';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { ERP_ICONS } from '@/shared/icons';

export const ChangePasswordPage = () => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      notifySuccess("Parol muvaffaqiyatli o'zgartirildi.");
      reset();
    } catch (err) {
      notifyError(err.message || "Parolni o'zgartirishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-page animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="mb-4 text-center text-sm-start">
        <h4 className="fw-bold text-main mb-1">Parolni O'zgartirish</h4>
        <p className="text-muted-custom fs-7 mb-0">Xavfsizlik uchun yangi kuchli parol o'rnating</p>
      </div>

      <Card title="Xavfsizlik Sozlamalari">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Current Password */}
          <div className="mb-3">
            <label className="form-label fs-7 fw-medium text-main">Joriy Parol</label>
            <div className="input-group">
              <span className="input-group-text bg-body-custom border-custom text-muted-custom">
                <i className="bi bi-key-fill"></i>
              </span>
              <input
                type={showCurrent ? 'text' : 'password'}
                className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                {...register('currentPassword', { required: 'Joriy parol kiritilishi shart' })}
              />
              <button
                type="button"
                className="btn btn-outline-secondary border-custom text-muted-custom"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                <i className={`bi ${showCurrent ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
              </button>
              {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword.message}</div>}
            </div>
          </div>

          {/* New Password */}
          <div className="mb-3">
            <label className="form-label fs-7 fw-medium text-main">Yangi Parol</label>
            <div className="input-group">
              <span className="input-group-text bg-body-custom border-custom text-muted-custom">
                <i className="bi bi-shield-lock-fill"></i>
              </span>
              <input
                type={showNew ? 'text' : 'password'}
                className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                {...register('newPassword', {
                  required: 'Yangi parol kiritilishi shart',
                  minLength: { value: 6, message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" },
                })}
              />
              <button
                type="button"
                className="btn btn-outline-secondary border-custom text-muted-custom"
                onClick={() => setShowNew(!showNew)}
              >
                <i className={`bi ${showNew ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
              </button>
              {errors.newPassword && <div className="invalid-feedback">{errors.newPassword.message}</div>}
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="mb-4">
            <label className="form-label fs-7 fw-medium text-main">Yangi Parolni Tasdiqlash</label>
            <div className="input-group">
              <span className="input-group-text bg-body-custom border-custom text-muted-custom">
                <i className="bi bi-shield-check"></i>
              </span>
              <input
                type={showConfirm ? 'text' : 'password'}
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Parolni tasdiqlash shart',
                  validate: (val) => val === newPasswordValue || "Kiritilgan parollar bir-biriga mos kelmadi",
                })}
              />
              <button
                type="button"
                className="btn btn-outline-secondary border-custom text-muted-custom"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <i className={`bi ${showConfirm ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
              </button>
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-100" isLoading={isLoading} icon={ERP_ICONS.CHECK}>
            Parolni Yangilash
          </Button>
        </form>
      </Card>
    </div>
  );
};
