import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { SettingsSubNav } from '../components/SettingsSubNav';
import { StageDragItem } from '../components/StageDragItem';
import { settingsApi } from '../api/settingsApi';
import { notifySuccess, notifyError } from '@/services/notification.service';
import { LuPlus } from 'react-icons/lu';

export const ProductionStagesSettingsPage = () => {
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    setIsLoading(true);
    const res = await settingsApi.getProductionStages();
    if (res.success && Array.isArray(res.data)) {
      const sorted = res.data.sort((a, b) => a.stageOrder - b.stageOrder);
      setStages(sorted);
    }
    setIsLoading(false);
  };

  const handleOpenModal = () => {
    setName('');
    setCode('');
    setDefaultPrice('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    const nextOrder = stages.length + 1;
    const res = await settingsApi.createProductionStage({
      name,
      code: code || name.toUpperCase().replace(/\s+/g, '_'),
      stageOrder: nextOrder,
      defaultPrice: Number(defaultPrice) || 150000,
    });

    if (res.success) {
      notifySuccess("Yangi texnologik bosqich qo'shildi.");
      await loadStages();
    } else {
      notifyError("Texnologik bosqich yaratishda xatolik yuz berdi.");
    }
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stages.findIndex((item) => item.id === active.id);
      const newIndex = stages.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(stages, oldIndex, newIndex);

      setStages(reordered);
      setIsLoading(true);

      try {
        for (let i = 0; i < reordered.length; i++) {
          const item = reordered[i];
          const newOrder = i + 1;
          if (item.stageOrder !== newOrder) {
            await settingsApi.updateProductionStage(item.id, {
              name: item.name,
              code: item.code,
              stageOrder: newOrder,
              defaultPrice: item.defaultPrice,
            });
          }
        }
        notifySuccess("Texnologik bosqichlar ketma-ketligi yangilandi.");
        await loadStages();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="production-stages-settings-page animate-fade-in pb-5">
      <SettingsSubNav />

      <PageHeader
        title="Ishlab Chiqarish Texnologik Bosqichlari"
        subtitle="Sex zanjiri ketma-ketligi va standart bosqich narxlari. Elementlarni tortib tartibni o'zgartiring."
        breadcrumbs={[
          { label: 'Bosh sahifa', path: '/' },
          { label: 'Sozlamalar', path: '/settings' },
          { label: 'Bosqichlar' },
        ]}
        actions={
          <Button variant="primary" size="sm" icon={<LuPlus />} onClick={handleOpenModal}>
            Yangi Bosqich Qo'shish
          </Button>
        }
      />

      <Card title="Texnologik Ketma-ketlik va Bosqichlar" isLoading={isLoading}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="stages-list py-2">
              {stages.map((stage, idx) => (
                <StageDragItem key={stage.id} stage={stage} index={idx} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yangi Texnologik Bosqich Yaratish"
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || !name.trim()}
            >
              Saqlash
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Input
            label="Bosqich Nomi (masalan: Tokarlik ishlovi)"
            placeholder="Tokarlik ishlovi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Kodi (masalan: TOKARLIK)"
            placeholder="TOKARLIK"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            label="Standart Me'yor Narxi (so'm)"
            placeholder="150000"
            type="number"
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
