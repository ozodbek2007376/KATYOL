import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { EntityPreviewCard } from '@/components/common/EntityPreviewCard/EntityPreviewCard';
import { CalculationBreakdown } from '@/components/common/CalculationBreakdown/CalculationBreakdown';
import { Button } from '@/components/common/Button/Button';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import { dynamicSettingsService } from '@/services/dynamicSettings.service';
import { businessRulesService } from '@/services/businessRules.service';
import { documentNumberingService } from '@/services/documentNumbering.service';
import { recipesApi } from '@/features/recipes/api/recipesApi';
import { ROUTES } from '@/constants/routes.constants';
import { LuChevronDown, LuChevronUp, LuSlidersHorizontal } from 'react-icons/lu';

export const BoilerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  boiler = null,
  recipes = [],
}) => {
  const [recipeOptions, setRecipeOptions] = useState(recipes.map((r) => ({ value: r.id, label: `${r.recipeName} (v${r.version})` })));
  const [warrantyOptions, setWarrantyOptions] = useState(dynamicSettingsService.getWarrantyTypeOptions());
  const [insuranceOptions, setInsuranceOptions] = useState(dynamicSettingsService.getInsuranceTypeOptions());
  const allStages = dynamicSettingsService.getProductionStages();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRecipeData, setSelectedRecipeData] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);

  const [formData, setFormData] = useState({
    modelName: '',
    internalCode: '',
    recipeId: '',
    warrantyTypeId: warrantyOptions[0]?.value || '',
    warrantyDuration: 12,
    insuranceTypeId: insuranceOptions[0]?.value || '',
    selectedStageIds: allStages.map((s) => s.id),
    status: 'ACTIVE',
    description: '',
  });

  useEffect(() => {
    setRecipeOptions(recipes.map((r) => ({ value: r.id, label: `${r.recipeName} (v${r.version})` })));
  }, [recipes]);

  useEffect(() => {
    if (boiler) {
      setFormData({
        modelName: boiler.modelName || '',
        internalCode: boiler.internalCode || '',
        recipeId: boiler.recipeId || (recipeOptions[0]?.value || ''),
        warrantyTypeId: boiler.warrantyTypeId || (warrantyOptions[0]?.value || ''),
        warrantyDuration: boiler.warrantyDuration || 12,
        insuranceTypeId: boiler.insuranceTypeId || (insuranceOptions[0]?.value || ''),
        selectedStageIds: boiler.selectedStageIds || allStages.map((s) => s.id),
        status: boiler.status || 'ACTIVE',
        description: boiler.description || '',
      });
    } else if (isOpen) {
      setFormData({
        modelName: '',
        internalCode: documentNumberingService.generateNumber('BOILER'),
        recipeId: recipeOptions[0]?.value || '',
        warrantyTypeId: warrantyOptions[0]?.value || '',
        warrantyDuration: 12,
        insuranceTypeId: insuranceOptions[0]?.value || '',
        selectedStageIds: allStages.map((s) => s.id),
        status: 'ACTIVE',
        description: '',
      });
      setShowAdvanced(false);
    }
  }, [boiler, isOpen]);

  // Recalculate estimated cost breakdown via businessRulesService on recipe/stage selection
  useEffect(() => {
    if (isOpen && formData.recipeId) {
      recipesApi.getRecipeById(formData.recipeId).then((res) => {
        if (res.success) {
          setSelectedRecipeData(res.data);
          const matCost = res.data?.estimatedCost || 1500;
          const stageCost = formData.selectedStageIds.length * 75;
          const laborCost = 50;

          // Pure Business Rules Engine Calculation
          const breakdown = businessRulesService.calculateBoilerCost({
            materialCost: matCost,
            stageCost,
            laborCost,
            overheadRate: 0.05,
          });

          setCostBreakdown(breakdown);
        }
      });
    }
  }, [formData.recipeId, formData.selectedStageIds, isOpen]);

  const handleAddNewRecipe = (newRecord) => {
    const newRec = { value: `rec_${Date.now()}`, label: `${newRecord.name} (v1.0)` };
    setRecipeOptions((prev) => [...prev, newRec]);
    setFormData((prev) => ({ ...prev, recipeId: newRec.value }));
    return newRec;
  };

  const handleAddNewWarranty = (newRecord) => {
    const newWar = { value: `war_${Date.now()}`, label: newRecord.name };
    setWarrantyOptions((prev) => [...prev, newWar]);
    setFormData((prev) => ({ ...prev, warrantyTypeId: newWar.value }));
    return newWar;
  };

  const handleAddNewInsurance = (newRecord) => {
    const newIns = { value: `ins_${Date.now()}`, label: newRecord.name };
    setInsuranceOptions((prev) => [...prev, newIns]);
    setFormData((prev) => ({ ...prev, insuranceTypeId: newIns.value }));
    return newIns;
  };

  const toggleStage = (stageId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedStageIds.includes(stageId);
      const updated = isSelected
        ? prev.selectedStageIds.filter((id) => id !== stageId)
        : [...prev.selectedStageIds, stageId];
      return { ...prev, selectedStageIds: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedRec = recipeOptions.find((r) => r.value === formData.recipeId);
    const selectedWar = warrantyOptions.find((w) => w.value === formData.warrantyTypeId);
    const selectedIns = insuranceOptions.find((i) => i.value === formData.insuranceTypeId);

    onSubmit({
      ...formData,
      recipeName: selectedRec ? selectedRec.label : '',
      warrantyTypeName: selectedWar ? selectedWar.label : '',
      insuranceTypeName: selectedIns ? selectedIns.label : '',
      estimatedCost: costBreakdown?.totalCost || 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={boiler ? "Kotyol Modelini Tahrirlash" : "Yangi Kotyol Modeli Qo'shish"}
      size="xl"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {boiler ? 'Saqlash' : "Modelni Qo'shish"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Core Header Fields */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-12">
            <Input
              label="Kotyol Modeli Nomi"
              placeholder="Kotyol Heavy Industry KV-200 Sanoat Pechi"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              required
            />
          </div>

          {/* Dynamic Recipe Select & Read-Only Preview Card */}
          <div className="col-12 col-md-6">
            <DynamicSelect
              label="Biriktiriladigan Retseptura"
              value={formData.recipeId}
              onChange={(e) => setFormData({ ...formData, recipeId: e.target.value })}
              options={recipeOptions}
              managePath={ROUTES.PROTECTED.RECIPES}
              onAddNew={handleAddNewRecipe}
              entityTitle="Retseptura"
              required
            />
            {/* Read-Only Recipe Preview */}
            <EntityPreviewCard type="RECIPE" data={selectedRecipeData} />
          </div>

          <div className="col-12 col-md-6">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Faol (Active - Katalogda ko\'rinadi)' },
                { value: 'INACTIVE', label: 'Nofaol (Inactive)' },
              ]}
            />
          </div>
        </div>

        {/* Collapsible Section for Progressive Disclosure */}
        <div className="border-custom rounded-3 p-2 mb-3 bg-body-custom">
          <button
            type="button"
            className="btn btn-link text-decoration-none text-main fs-7 fw-semibold d-flex align-items-center justify-content-between w-100 p-1"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="d-flex align-items-center gap-2">
              <LuSlidersHorizontal className="text-primary" />
              <span>Qo'shimcha Texnik Parametrlar, Kafolat, Sug'urta va Bosqichlar</span>
            </div>
            {showAdvanced ? <LuChevronUp /> : <LuChevronDown />}
          </button>

          {showAdvanced && (
            <div className="row g-3 pt-3 border-top border-custom mt-2">
              {/* Dynamic Warranty Select */}
              <div className="col-12 col-md-4">
                <DynamicSelect
                  label="Zavod Kafolati Turi"
                  value={formData.warrantyTypeId}
                  onChange={(e) => setFormData({ ...formData, warrantyTypeId: e.target.value })}
                  options={warrantyOptions}
                  managePath={ROUTES.PROTECTED.SETTINGS_WARRANTY_TYPES}
                  onAddNew={handleAddNewWarranty}
                  entityTitle="Kafolat Turi"
                />
              </div>

              {/* Warranty Duration */}
              <div className="col-12 col-md-2">
                <Input
                  label="Muddat (oy)"
                  type="number"
                  min={1}
                  max={120}
                  value={formData.warrantyDuration}
                  onChange={(e) => setFormData({ ...formData, warrantyDuration: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Dynamic Insurance Select */}
              <div className="col-12 col-md-6">
                <DynamicSelect
                  label="Korxona Sug'urtasi Turi"
                  value={formData.insuranceTypeId}
                  onChange={(e) => setFormData({ ...formData, insuranceTypeId: e.target.value })}
                  options={insuranceOptions}
                  managePath={ROUTES.PROTECTED.SETTINGS_INSURANCE_TYPES}
                  onAddNew={handleAddNewInsurance}
                  entityTitle="Sug'urta Turi"
                />
              </div>

              {/* Default Production Stages Checkboxes */}
              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main d-block">
                  Standart Ishlab Chiqarish Bosqichlari Zanjiri
                </label>
                <div className="d-flex flex-wrap gap-2 p-2 bg-surface rounded-3 border-custom">
                  {allStages.map((stg) => {
                    const checked = formData.selectedStageIds.includes(stg.id);
                    return (
                      <div
                        key={stg.id}
                        className={`form-check form-check-inline px-3 py-1 rounded-2 border-custom cursor-pointer transition-all ${
                          checked ? 'bg-primary bg-opacity-10 border-primary' : 'bg-body-custom'
                        }`}
                        onClick={() => toggleStage(stg.id)}
                      >
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                        />
                        <label className="form-check-label fs-8 fw-medium text-main ms-1 cursor-pointer">
                          {stg.stageOrder}. {stg.stageName} (${stg.defaultPrice})
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Texnik Parametrlari va Tavsifi</label>
                <textarea
                  className="form-control fs-7"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Pechni tayyorlash shartlari va GOST talablari..."
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label fs-7 fw-medium text-main">Texnik Chizma va Sertifikatlarni Yuklash</label>
                <FileUpload label="Kotyol rasmi va sertifikatlarni yuklash" maxSizeMB={5} />
              </div>
            </div>
          )}
        </div>

        {/* Calculation Transparency Breakdown Card */}
        {costBreakdown && (
          <CalculationBreakdown
            title="Avtomatik Tannarx Kalkulyatsiyasi va Shaffof Formula"
            formula={costBreakdown.formula}
            totalLabel="Jami Kotyol Tannarxi"
            totalValue={costBreakdown.totalCost}
            defaultExpanded={true}
            items={[
              { label: "Xomashyo Sarfiyati (Recipe BOM):", value: formatCurrency(costBreakdown.materialCost) },
              { label: "Zavod Bosqichlari Xarajatlari:", value: formatCurrency(costBreakdown.stageCost) },
              { label: "Usta va Ishchi Mehnati Sarfi:", value: formatCurrency(costBreakdown.laborCost) },
              { label: `Qo'shimcha Sex Xarajatlari (${costBreakdown.overheadRatePercent}%):`, value: formatCurrency(costBreakdown.overheadCost) },
            ]}
          />
        )}
      </form>
    </Modal>
  );
};
