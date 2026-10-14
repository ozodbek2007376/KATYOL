import React, { useState } from 'react';
import { SearchInput } from '../SearchInput/SearchInput';
import { Select } from '../Select/Select';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { LuSlidersHorizontal, LuChevronDown, LuChevronUp, LuRotateCcw } from 'react-icons/lu';

export const FilterBar = ({
  search = null,
  dateRange = null,
  primarySelects = [],
  advancedSelects = [],
  onReset = null,
  className = '',
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasAdvanced = advancedSelects.length > 0;

  return (
    <div className={`card border-custom bg-body-custom rounded-3 p-3 mb-4 shadow-sm ${className}`}>
      {/* Primary Filters Row */}
      <div className="row g-3 align-items-end">
        {search && (
          <div className="col-12 col-md-4">
            <SearchInput
              placeholder={search.placeholder || "Qidiruv..."}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
            />
          </div>
        )}

        {dateRange && (
          <>
            <div className="col-12 col-md-3">
              <Input
                label="Boshlanish Sanasi"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => dateRange.onStartDateChange(e.target.value)}
                containerClass="mb-0 text-start"
              />
            </div>
            <div className="col-12 col-md-3">
              <Input
                label="Yakunlanish Sanasi"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => dateRange.onEndDateChange(e.target.value)}
                containerClass="mb-0 text-start"
              />
            </div>
          </>
        )}

        {primarySelects.map((sel) => (
          <div key={sel.id || sel.label} className="col-12 col-md-3">
            <Select
              label={sel.label}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              options={sel.options}
              containerClass="mb-0 text-start"
            />
          </div>
        ))}

        {/* Action Controls (Expand Advanced / Reset) */}
        <div className="col-12 col-md-auto ms-auto d-flex align-items-center gap-2">
          {hasAdvanced && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="d-flex align-items-center gap-1"
            >
              <LuSlidersHorizontal />
              <span>Qo'shimcha filtrlar</span>
              {showAdvanced ? <LuChevronUp /> : <LuChevronDown />}
            </Button>
          )}

          {onReset && (
            <Button
              variant="outline-dark"
              size="sm"
              onClick={onReset}
              title="Filtrlarni tozalash"
              className="d-flex align-items-center gap-1"
            >
              <LuRotateCcw />
              <span>Tozalash</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Collapsible Filters Row */}
      {hasAdvanced && showAdvanced && (
        <div className="row g-3 pt-3 border-top border-custom mt-3 animate-fade-in">
          {advancedSelects.map((sel) => (
            <div key={sel.id || sel.label} className="col-12 col-md-3">
              <Select
                label={sel.label}
                value={sel.value}
                onChange={(e) => sel.onChange(e.target.value)}
                options={sel.options}
                containerClass="mb-0 text-start"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
