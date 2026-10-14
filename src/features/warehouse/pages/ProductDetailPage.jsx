import { formatCurrency } from '@/utils/currency.utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { productsApi } from '../api/productsApi';
import { recipesApi } from '@/features/recipes/api/recipesApi';
import { RecipeFormModal } from '@/features/recipes/components/RecipeFormModal';
import { ERP_ICONS } from '@/shared/icons';
import { ROUTES } from '@/constants/routes.constants';
import { WarehouseSubNav } from '@/features/warehouse/components/WarehouseSubNav';
import { notifySuccess } from '@/services/notification.service';
import { LuBookOpen, LuPlus, LuPencil } from 'react-icons/lu';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const loadProductDetails = async () => {
    setIsLoading(true);
    const [prodRes, actRes, recRes, allProdsRes] = await Promise.all([
      productsApi.getProductById(id),
      productsApi.getProductActivities(id),
      recipesApi.getRecipeById(id),
      productsApi.getProducts(),
    ]);
    if (prodRes.success) setProduct(prodRes.data);
    if (actRes.success) setActivities(actRes.data);
    if (recRes.success) setRecipe(recRes.data);
    if (allProdsRes.success) setProductsList(allProdsRes.data);
    setIsLoading(false);
  };

  const handleSaveRecipe = async (formData) => {
    let res;
    if (recipe) {
      res = await recipesApi.updateRecipe(id, { ...formData, productId: id });
    } else {
      res = await recipesApi.createRecipe({ ...formData, productId: id });
    }
    notifySuccess(res.message);
    setIsRecipeModalOpen(false);
    loadProductDetails();
  };

  if (isLoading || !product) {
    return (
      <div className="product-detail-page animate-fade-in pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const recipeItems = recipe && Array.isArray(recipe.items) ? recipe.items : [];

  const recipeColumns = [
    { header: 'Material Nomi', accessor: 'materialName' },
    {
      header: 'Material Turi',
      cell: (row) => (
        <span className="badge bg-info bg-opacity-10 text-info fs-8">
          {row.materialTypeName || '-'}
        </span>
      ),
    },
    {
      header: 'Sarf Miqdori',
      cell: (row) => (
        <strong className="text-main">
          {row.requiredQuantity || 0} {row.unitName || 'dona'}
        </strong>
      ),
    },
    {
      header: 'Isrofo (%)',
      cell: (row) => <span className="text-danger">+{Number(row.wastePercent) || 0}%</span>,
    },
    {
      header: 'Birlik Narxi',
      cell: (row) => <span>{formatCurrency(row.unitPrice)}</span>,
    },
    {
      header: 'Jami Narx',
      cell: (row) => (
        <strong className="text-primary">
          {formatCurrency(row.totalCost)}
        </strong>
      ),
    },
  ];

  return (
    <div className="product-detail-page animate-fade-in pb-5">
      <WarehouseSubNav />
      <PageHeader
        title={`Mahsulot Kartochkasi: ${product.name}`}
        subtitle={`Kodi: ${product.internalCode} — ${product.categoryName}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Mahsulotlar', path: ROUTES.PROTECTED.PRODUCTS },
          { label: product.name },
        ]}
        actions={
          <Link to={ROUTES.PROTECTED.PRODUCTS} className="btn btn-outline-secondary btn-sm">
            <i className={`bi ${ERP_ICONS.CHEVRON_LEFT} me-1`}></i> Ro'yxatga Qaytish
          </Link>
        }
      />

      <div className="row g-3">
        {/* Left Card: Basic Specs */}
        <div className="col-12 col-lg-4">
          <Card className="p-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{ width: '56px', height: '56px' }}
              >
                <i className={`bi ${ERP_ICONS.WAREHOUSE}`}></i>
              </div>
              <div>
                <h6 className="fw-bold text-main mb-0 font-heading">{product.name}</h6>
                <small className="text-muted-custom">SKU: {product.internalCode}</small>
              </div>
            </div>

            <div className="mb-3 d-flex align-items-center justify-content-between">
              <StatusBadge status={product.status} />
              <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">{product.materialTypeName}</span>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Xarid Stavkasi Narxi:</small>
                <strong className="text-primary fs-5">{formatCurrency(product.purchasePrice)}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Mavjud Ombor Zaxirasi:</small>
                <strong className="text-success fs-6">{product.currentStock} {product.unitName}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Minimal Zaxira Chegarasi:</small>
                <strong className="text-main">{product.minStock} {product.unitName}</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Details */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {/* Specs Card */}
            <Card title="Texnik Parametrlari va Tavsifi">
              <div className="row g-3 fs-7 mb-3">
                <div className="col-12 col-sm-6">
                  <small className="text-muted-custom d-block">Kategoriya:</small>
                  <strong className="text-main">{product.categoryName}</strong>
                </div>
                <div className="col-12 col-sm-6">
                  <small className="text-muted-custom d-block">Material Turi:</small>
                  <strong className="text-main">{product.materialTypeName}</strong>
                </div>
                <div className="col-12 col-sm-6">
                  <small className="text-muted-custom d-block">Rasmiy Ta'minotchi:</small>
                  <strong className="text-main">{product.supplierName}</strong>
                </div>
                <div className="col-12 col-sm-6">
                  <small className="text-muted-custom d-block">O'lchov Birligi:</small>
                  <strong className="text-main">{product.unitName}</strong>
                </div>
              </div>
              <p className="fs-7 text-main mb-0">{product.description || 'Texnik tavsif kiritilmagan.'}</p>
            </Card>

            {/* Recipe / BOM Integration Card */}
            {product.type === 'FINISHED_GOOD' && (
              <Card
                title="Mahsulot Retsepturasi va BOM (Bill of Materials)"
                actions={
                  recipe ? (
                    <Button variant="outline-primary" size="sm" onClick={() => setIsRecipeModalOpen(true)}>
                      <LuPencil className="me-1" /> Retseptni Tahrirlash
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => setIsRecipeModalOpen(true)}>
                      <LuPlus className="me-1" /> Retsept Yaratish
                    </Button>
                  )
                }
              >
                {recipe ? (
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="badge bg-success bg-opacity-10 text-success fs-7 fw-bold">v{recipe.version}</span>
                      <span className={`badge ${recipe.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} fs-8`}>
                        {recipe.status === 'ACTIVE' ? 'Faol Versiya' : 'Nofaol'}
                      </span>
                    </div>

                    <Table columns={recipeColumns} data={recipeItems} />

                    <div className="p-3 bg-body-custom rounded-3 border-custom mt-3">
                      <div className="row g-2 text-end fs-7">
                        <div className="col-6 col-md-4">
                          <span className="text-muted-custom d-block">Materiallar Sof Narxi:</span>
                          <strong className="text-main">{formatCurrency(recipe.baseMaterialCost)}</strong>
                        </div>
                        <div className="col-6 col-md-4">
                          <span className="text-muted-custom d-block">Taxminiy Isrofo:</span>
                          <strong className="text-danger">+{formatCurrency(recipe.estimatedWasteCost)}</strong>
                        </div>
                        <div className="col-12 col-md-4">
                          <span className="text-muted-custom d-block fw-bold">Taxminiy Tannarx:</span>
                          <strong className="text-primary fs-6">{formatCurrency(recipe.estimatedTotalCost)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-body-custom rounded-3 border-custom">
                    <LuBookOpen className="fs-3 text-muted-custom d-block mb-2 mx-auto" />
                    <p className="fs-7 text-muted-custom mb-0">Ushbu mahsulot uchun texnologik retseptura / BOM kiritilmagan.</p>
                  </div>
                )}
              </Card>
            )}

            {/* Warehouse Stock Location Placeholder */}
            <Card title="Omborxona va Sex Joylashuvi (Warehouse Location)">
              <div className="p-3 bg-body-custom rounded-3 border-custom text-center">
                <i className={`bi ${ERP_ICONS.WAREHOUSE} fs-3 text-muted-custom d-block mb-2`}></i>
                <p className="fs-7 text-muted-custom mb-0">
                  Ushbu xomashyoning muayyan ombor rastasi va yacheykalar bo'yicha harakatlari kelgusi **Omborxona va Zaxiralar (Warehouse)** modulida aks etadi.
                </p>
              </div>
            </Card>

            {/* Activity History */}
            <Card title="Mahsulot Harakatlari va Kirim Tarixi">
              <Timeline items={activities} />
            </Card>
          </div>
        </div>
      </div>

      <RecipeFormModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onSubmit={handleSaveRecipe}
        recipe={recipe}
        products={productsList}
      />
    </div>
  );
};
