import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { LuPlus } from 'react-icons/lu';

export const QuickAddModal = ({ isOpen, onClose, onSubmit, entityTitle = "Yangi Element" }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, description });
    setName('');
    setDescription('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tezkor Qo'shish: ${entityTitle}`}
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} icon={<LuPlus />}>
            Qo'shish va Tanlash
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Input
            label={`${entityTitle} Nomi`}
            placeholder="Yangi nom kiring..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-2">
          <label className="form-label fs-7 fw-medium text-main">Qo'shimcha Tavsif</label>
          <textarea
            className="form-control fs-7"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qisqacha izoh..."
          ></textarea>
        </div>
      </form>
    </Modal>
  );
};
