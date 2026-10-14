import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { DynamicSelect } from '@/components/common/DynamicSelect/DynamicSelect';
import { Button } from '@/components/common/Button/Button';
import { RecipeItemsTable } from './RecipeItemsTable';
import { ROUTES } from '@/constants/routes.constants';
import { LuChevronDown, LuChevronUp, LuSlidersHorizontal } from 'react-icons/lu';

export const RecipeFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  recipe = null,
  products = [],
}) => {
  const [productOptions, setProductOptions] = useState(products.map((p) => ({ value: p.id || p.productId, label: p.name || p.productName })));
  const [productList, setProductList] = useState(products);

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setProductOptions(products.map((p) => ({ value: p.id || p.productId, label: p.name || p.productName })));
    setProductList(products);
  }, [products]);

  const [formData, setFormData] = useState({
    recipeName: '',
    productId: '',
    version: '1.0',
    status: 'ACTIVE',
    description: '',
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (recipe) {
      setFormData({
        recipeName: recipe.recipeName || '',
        productId: recipe.productId || (productOptions[0]?.value || ''),
        version: recipe.version || '1.0',
        status: recipe.status || 'ACTIVE',
        description: recipe.description || '',
      });
      setItems(recipe.items || []);
    } else if (isOpen) {
      setFormData({
        recipeName: '',
        productId: '',
        version: '1.0',
        status: 'ACTIVE',
        description: '',
      });

      setItems([]);
      setShowAdvanced(false);
    }
  }, [recipe, isOpen]);

  const handleAddNewProduct = (newRecord) => {
    const newProd = {
      id: `prod_${Date.now()}`,
      name: newRecord.name,
      unitName: 'dona',
      purchasePrice: 15.0,
    };
    setProductList((prev) => [...prev, newProd]);
    const opt = { value: newProd.id, label: newProd.name };
    setProductOptions((prev) => [...prev, opt]);
    setFormData((prev) => ({ ...prev, productId: opt.value, recipeName: `${newProd.name} Resepturasi` }));
    return opt;
  };

  // Instant calculations
  const totalMaterialCount = items.length;
  const baseMaterialCost = items.reduce((acc, row) => acc + (parseFloat(row.requiredQuantity) || 0) * (parseFloat(row.unitPrice) || 0), 0);
  const estimatedWasteCost = items.reduce((acc, row) => acc + (parseFloat(row.requiredQuantity) || 0) * (parseFloat(row.unitPrice) || 0) * ((parseFloat(row.wastePercent) || 0) / 100), 0);
  const estimatedTotalCost = baseMaterialCost + estimatedWasteCost;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    const selectedProd = productList.find((p) => (p.id || p.productId) === formData.productId);

    onSubmit({
      ...formData,
      productName: selectedProd ? (selectedProd.name || selectedProd.productName) : '',
      items,
      totalMaterialCount,
      baseMaterialCost,
      estimatedWasteCost,
      estimatedTotalCost,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recipe ? "Retseptni Tahrirlash" : "Yangi Retseptura Yaratish"}
      size="xl"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {recipe ? 'Saqlash' : "Retseptni Saqlash"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Core Mandatory Header Fields */}
        <div className="row g-3 mb-3">
          <div className="col-12">
            <Input
              label="Retsept Nomi"
              placeholder="Sanoat Gidravlik Klapani 150mm Resepturasi"
              value={formData.recipeName}
              onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
              required
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
              <span>Qo'shimcha Versiya Sozlamalari va Texnologik Izoh</span>
            </div>
            {showAdvanced ? <LuChevronUp /> : <LuChevronDown />}
          </button>

          {showAdvanced && (
            <div className="row g-3 pt-3 border-top border-custom mt-2">
              <div className="col-12 col-md-4">
                <Input
                  label="Retsept Versiyasi"
                  placeholder="1.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'ACTIVE', label: 'Faol — Ishlab chiqarishga ruxsat' },
                    { value: 'INACTIVE', label: 'Nofaol — Arxiv' },
                  ]}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fs-7 fw-medium text-main">Texnologik Izoh va Tavsif</label>
                <textarea
                  className="form-control fs-7"
                  rows="1"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sanoat standarti..."
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Recipe Items Table */}
        <RecipeItemsTable
          items={items}
          onItemsChange={setItems}
          products={productList}
          onAddNewMaterial={handleAddNewProduct}
        />

        {/* Calculations Summary Card */}
        <div className="p-3 bg-body-custom rounded-3 border-custom mt-3">
          <div className="row g-2 text-end fs-7">
            <div className="col-6 col-md-3">
              <span className="text-muted-custom d-block">Masalliqlar Soni:</span>
              <strong className="text-main">{totalMaterialCount} turdagi</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted-custom d-block">Materiallar Sof Narxi:</span>
              <strong className="text-main">{formatCurrency(baseMaterialCost)}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted-custom d-block">Taxminiy Isrofo:</span>
              <strong className="text-danger">+{formatCurrency(estimatedWasteCost)}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted-custom d-block fw-bold">Taxminiy Tannarx:</span>
              <strong className="text-primary fs-5">{formatCurrency(estimatedTotalCost)}</strong>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
