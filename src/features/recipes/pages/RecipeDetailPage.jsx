import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuChevronLeft, LuCircleCheck, LuBookOpen, LuHistory, LuDollarSign } from 'react-icons/lu';
import { Card } from '@/components/common/Card/Card';
import { Table } from '@/components/common/Table/Table';
import { Button } from '@/components/common/Button/Button';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { Timeline } from '@/components/common/Timeline/Timeline';
import { RecipesSubNav } from '../components/RecipesSubNav';
import { recipesApi } from '../api/recipesApi';
import { notifySuccess } from '@/services/notification.service';
import { formatCurrency } from '@/utils/currency.utils';
import { ROUTES } from '@/constants/routes.constants';

export const RecipeDetailPage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipeDetails();
  }, [id]);

  const loadRecipeDetails = async () => {
    setIsLoading(true);
    const res = await recipesApi.getRecipeById(id);
    if (res.success) setRecipe(res.data);
    setIsLoading(false);
  };

  const handleActivateVersion = async () => {
    if (!recipe) return;
    const res = await recipesApi.activateVersion(recipe.id);
    notifySuccess(res.message);
    loadRecipeDetails();
  };

  if (isLoading || !recipe) {
    return (
      <div className="recipe-detail-page animate-fade-in pb-5">
        <RecipesSubNav />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  const items = Array.isArray(recipe.items) ? recipe.items : [];

  // Cost calculations with safe numeric parsing
  const baseMaterialCost = items.reduce(
    (acc, row) => acc + (Number(row.requiredQuantity) || 0) * (Number(row.unitPrice) || 0),
    0
  );
  const estimatedWasteCost = items.reduce(
    (acc, row) =>
      acc +
      (Number(row.requiredQuantity) || 0) *
        (Number(row.unitPrice) || 0) *
        ((Number(row.wastePercent) || 0) / 100),
    0
  );
  const totalProductionCost = baseMaterialCost + estimatedWasteCost;

  const itemColumns = [
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
      header: 'Jami Xarajat',
      cell: (row) => (
        <strong className="text-primary">
          {formatCurrency(row.totalCost)}
        </strong>
      ),
    },
  ];

  const versionColumns = [
    {
      header: 'Versiya',
      cell: (row) => (
        <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8 fw-bold">
          v{row.version}
        </span>
      ),
    },
    { header: 'Yaratilgan Sana', accessor: 'createdDate' },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`badge ${row.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} fs-8`}>
          {row.status === 'ACTIVE' ? 'Faol Versiya' : 'Nofaol'}
        </span>
      ),
    },
    { header: 'Izoh', accessor: 'note' },
  ];

  const timelineItems = (recipe.timeline || []).map((tl) => ({
    id: tl.id,
    title: tl.title,
    description: tl.description,
    timestamp: tl.timestamp,
    icon: 'bi-gear-wide-connected',
  }));

  return (
    <div className="recipe-detail-page animate-fade-in pb-5">
      <RecipesSubNav />

      <PageHeader
        title={`Retsept Tafsiloti: ${recipe.recipeName}`}
        subtitle={`Tayyor Mahsulot: ${recipe.productName} — Versiya: v${recipe.version}`}
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Retseptlar', path: ROUTES.PROTECTED.RECIPES },
          { label: recipe.recipeName },
        ]}
        actions={
          <div className="d-flex align-items-center gap-2">
            <Link to={ROUTES.PROTECTED.RECIPES} className="btn btn-outline-secondary btn-sm">
              <LuChevronLeft className="me-1" /> Ro'yxatga Qaytish
            </Link>
            {recipe.status !== 'ACTIVE' && (
              <Button variant="success" size="sm" onClick={handleActivateVersion}>
                <LuCircleCheck className="me-1" /> Ushbu Versiyani Faollashtirish
              </Button>
            )}
          </div>
        }
      />

      <div className="row g-3">
        {/* Left Side: Recipe Summary & Cost Estimation Card */}
        <div className="col-12 col-lg-4">
          <Card className="p-4 mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{ width: '56px', height: '56px' }}
              >
                <LuBookOpen />
              </div>
              <div>
                <h6 className="fw-bold text-main mb-0 font-heading">{recipe.recipeName}</h6>
                <span className="badge bg-secondary bg-opacity-10 text-secondary fs-8">
                  Versiya v{recipe.version}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <span className={`badge ${recipe.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} fs-8`}>
                {recipe.status === 'ACTIVE' ? 'Faol Versiya' : 'Nofaol'}
              </span>
            </div>

            <hr className="border-custom my-3" />

            <div className="text-start fs-7 d-flex flex-column gap-2">
              <div>
                <small className="text-muted-custom d-block">Tayyor Mahsulot:</small>
                <strong className="text-main">{recipe.productName}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Masalliqlar Turlari Soni:</small>
                <strong className="text-main">{items.length} ta xomashyo</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">Yaratilgan Sana:</small>
                <strong className="text-main">{recipe.createdDate}</strong>
              </div>
              <div>
                <small className="text-muted-custom d-block">So'nggi Yangilanish:</small>
                <strong className="text-main">{recipe.updatedDate}</strong>
              </div>
            </div>

            <hr className="border-custom my-3" />

            {/* Estimated Cost Breakdown */}
            <h6 className="fw-bold text-main mb-2 font-heading fs-7 d-flex align-items-center gap-1">
              <LuDollarSign className="text-primary" /> <span>Taxminiy Xarajatlar Taqsimoti</span>
            </h6>

            <div className="text-start fs-7 d-flex flex-column gap-1 bg-body-custom p-3 rounded-3 border-custom">
              <div className="d-flex justify-content-between">
                <span className="text-muted-custom">Materiallar Sof Narxi:</span>
                <span>{formatCurrency(baseMaterialCost)}</span>
              </div>
              <div className="d-flex justify-content-between text-danger">
                <span>Taxminiy Isrofo Summasi:</span>
                <span>+{formatCurrency(estimatedWasteCost)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold pt-2 border-top border-custom text-primary fs-6">
                <span>1 Birlik Tannarxi:</span>
                <span>{formatCurrency(totalProductionCost)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Ingredient List, Version History & Timeline */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {/* Ingredients Table */}
            <Card title="Retsept Tarkibiy Masalliqlar Ro'yxati">
              <Table columns={itemColumns} data={items} />
            </Card>

            {/* Description Card */}
            <Card title="Texnologik Izoh va Standartlar">
              <p className="fs-7 text-main mb-0">
                {recipe.description || 'Texnologik izoh kiritilmagan.'}
              </p>
            </Card>

            {/* Versions History */}
            <Card title="Retsept Versiyalari Tarixi">
              <Table columns={versionColumns} data={recipe.versionsHistory || []} />
            </Card>

            {/* Timeline */}
            <Card title="Retsept Harakatlari Tarixi">
              <Timeline items={timelineItems} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
