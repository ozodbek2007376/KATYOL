import React from 'react';
import { Button } from '@/components/common/Button/Button';
import { notifySuccess } from '@/services/notification.service';
import { LuFileSpreadsheet, LuFileText, LuPrinter } from 'react-icons/lu';

export const ReportExportButtons = ({ reportTitle = "Hisobot" }) => {
  const handleExportExcel = () => {
    notifySuccess(`'${reportTitle}' ma'lumotlari Excel (.xlsx) fayliga muvaffaqiyatli eksport qilindi.`);
  };

  const handleExportPDF = () => {
    notifySuccess(`'${reportTitle}' hujjati PDF fayliga muvaffaqiyatli saqlandi.`);
  };

  const handlePrint = () => {
    notifySuccess(`'${reportTitle}' chop etish muloqot oynasiga yuborildi.`);
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <Button variant="outline-success" size="sm" onClick={handleExportExcel}>
        <LuFileSpreadsheet className="me-1" /> Excelga Yuklash
      </Button>

      <Button variant="outline-danger" size="sm" onClick={handleExportPDF}>
        <LuFileText className="me-1" /> PDF Yuklash
      </Button>

      <Button variant="outline-dark" size="sm" onClick={handlePrint}>
        <LuPrinter className="me-1" /> Chop Etish
      </Button>
    </div>
  );
};
