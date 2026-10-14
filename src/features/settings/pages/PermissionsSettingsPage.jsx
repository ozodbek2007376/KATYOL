import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Select } from '@/components/common/Select/Select';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { SettingsSubNav } from '../components/SettingsSubNav';
import { PermissionMatrixTable } from '../components/PermissionMatrixTable';
import { settingsApi } from '../api/settingsApi';
import { notifySuccess } from '@/services/notification.service';
import { LuCheck } from 'react-icons/lu';

export const PermissionsSettingsPage = () => {
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [matrix, setMatrix] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rolesRes = await settingsApi.getRoles();
      let roles = [];
      if (rolesRes.success && Array.isArray(rolesRes.data)) {
        roles = rolesRes.data.map(r => ({ value: r.code || r.name, label: r.name }));
        setRoleOptions(roles);
      }

      const matrixRes = await settingsApi.getPermissionsMatrix();
      if (matrixRes.success && matrixRes.data) {
        const defaultRole = roles[0]?.value || 'ADMIN';
        setSelectedRole(defaultRole);
        setMatrix(matrixRes.data[defaultRole] || matrixRes.data || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (roleVal) => {
    setSelectedRole(roleVal);
    setIsLoading(true);
    try {
      const matrixRes = await settingsApi.getPermissionsMatrix();
      if (matrixRes.success && matrixRes.data) {
        setMatrix(matrixRes.data[roleVal] || matrixRes.data || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (moduleKey, actionKey) => {
    setMatrix((prev) => {
      const currentModule = prev[moduleKey] || { view: false, create: false, update: false, delete: false, export: false };
      return {
        ...prev,
        [moduleKey]: {
          ...currentModule,
          [actionKey]: !currentModule[actionKey],
        },
      };
    });
  };

  const handleSave = () => {
    notifySuccess("Ruxsatlar matritsasi muvaffaqiyatli saqlandi.");
  };

  return (
    <div className="permissions-settings-page animate-fade-in pb-5">
      <SettingsSubNav />

      <PageHeader
        title="Ruxsatlar Matritsasi"
        subtitle="Rollar bo'yicha modullarga kirish va amallar huquqlarini sozlash"
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sozlamalar', path: '/settings' },
          { label: 'Ruxsatlar' },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2" style={{ minWidth: '220px' }}>
            <Select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              options={roleOptions}
            />
            <Button variant="primary" size="sm" icon={<LuCheck />} onClick={handleSave}>
              Saqlash
            </Button>
          </div>
        }
      />

      <Card title={`'${selectedRole}' Roli uchun Modullar Huquqlari Matritsasi`} isLoading={isLoading}>
        <PermissionMatrixTable matrix={matrix} onTogglePermission={handleTogglePermission} />
      </Card>
    </div>
  );
};
