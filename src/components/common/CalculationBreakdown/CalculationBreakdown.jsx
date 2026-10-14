import React, { useState } from 'react';
import { LuCalculator, LuChevronDown, LuChevronUp, LuInfo } from 'react-icons/lu';
import { getCurrencySymbol } from '@/utils/currency.utils';

export const CalculationBreakdown = ({
  title = "Hisob-kitob Shaffofligi va Formula",
  items = [],
  formula = "",
  totalLabel = "Jami HISOBLANGAN",
  totalValue = 0,
  currency = null,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const activeCurrency = currency || getCurrencySymbol();

  const formattedValue = typeof totalValue === 'number'
    ? (activeCurrency === '$' ? `$${totalValue.toLocaleString()}` : `${totalValue.toLocaleString()} so'm`)
    : totalValue;

  return (
    <div className="card border-custom bg-body-custom rounded-3 mb-3">
      <div
        className="card-header border-bottom-0 p-3 bg-primary bg-opacity-10 text-primary cursor-pointer d-flex align-items-center justify-content-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="d-flex align-items-center gap-2">
          <LuCalculator className="fs-5" />
          <span className="fw-bold fs-7 font-heading">{title}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <strong className="fs-7 text-primary">
            {formattedValue}
          </strong>
          {isExpanded ? <LuChevronUp /> : <LuChevronDown />}
        </div>
      </div>

      {isExpanded && (
        <div className="card-body p-3 border-top border-custom fs-7 animate-fade-in">
          {formula && (
            <div className="alert alert-light border border-custom py-2 px-3 mb-3 fs-8 text-muted-custom font-mono">
              <LuInfo className="me-1 text-primary" />
              <strong>Formula:</strong> {formula}
            </div>
          )}

          <div className="d-flex flex-column gap-2">
            {items.map((item, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center border-bottom border-custom pb-1 fs-8">
                <span className="text-muted-custom">{item.label}</span>
                <strong className="text-main">
                  {item.prefix || ''}{item.value}{item.suffix || ''}
                </strong>
              </div>
            ))}

            <div className="d-flex justify-content-between align-items-center pt-2 fw-bold text-primary fs-7">
              <span>{totalLabel}:</span>
              <span>{formattedValue}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
