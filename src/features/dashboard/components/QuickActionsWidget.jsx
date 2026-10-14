import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { ERP_ICONS } from '@/shared/icons';
import { notifyInfo } from '@/services/notification.service';

export const QuickActionsWidget = () => {
  const handleQuickAction = (actionName) => {
    notifyInfo(`'${actionName}' funksiyasi tez orada faollashtiriladi.`);
  };

  return (
    <Card title="Tezkor Amallar va Yaratish" className="mb-4">
      <div className="row g-2">
        <div className="col-12 col-sm-6 col-md-3">
          <Button
            variant="outline-primary"
            className="w-100 py-3 d-flex flex-column align-items-center justify-content-center gap-2"
            onClick={() => handleQuickAction('Yangi Buyurtma')}
          >
            <i className={`bi ${ERP_ICONS.SALES} fs-3`}></i>
            <span className="fs-7 fw-semibold">Yangi Buyurtma</span>
          </Button>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <Button
            variant="outline-primary"
            className="w-100 py-3 d-flex flex-column align-items-center justify-content-center gap-2"
            onClick={() => handleQuickAction('Yangi Mahsulot')}
          >
            <i className={`bi ${ERP_ICONS.WAREHOUSE} fs-3`}></i>
            <span className="fs-7 fw-semibold">Yangi Mahsulot</span>
          </Button>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <Button
            variant="outline-primary"
            className="w-100 py-3 d-flex flex-column align-items-center justify-content-center gap-2"
            onClick={() => handleQuickAction('Yangi Mijoz')}
          >
            <i className={`bi ${ERP_ICONS.CUSTOMERS} fs-3`}></i>
            <span className="fs-7 fw-semibold">Yangi Mijoz</span>
          </Button>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <Button
            variant="outline-primary"
            className="w-100 py-3 d-flex flex-column align-items-center justify-content-center gap-2"
            onClick={() => handleQuickAction('Yangi Xodim')}
          >
            <i className={`bi ${ERP_ICONS.EMPLOYEES} fs-3`}></i>
            <span className="fs-7 fw-semibold">Yangi Xodim</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
