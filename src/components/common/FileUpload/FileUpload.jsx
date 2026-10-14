import React, { useState } from 'react';
import { ERP_ICONS } from '@/shared/icons';

export const FileUpload = ({
  onFileSelect,
  accept = '*',
  maxSizeMB = 5,
  label = 'Drag and drop files here or click to browse',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB`);
      return;
    }
    setError('');
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-100">
      <div
        className={`p-4 border-2 border-dashed rounded-3 text-center transition-all ${
          dragOver ? 'border-primary bg-primary-light' : 'border-custom bg-card-custom'
        }`}
        style={{ borderStyle: 'dashed', cursor: 'pointer' }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input').click()}
      >
        <input
          id="file-upload-input"
          type="file"
          className="d-none"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <i className={`bi ${ERP_ICONS.FILE_UPLOAD} text-primary fs-1 mb-2 d-block`}></i>
        <p className="mb-1 fs-7 fw-medium text-main">{selectedFile ? selectedFile.name : label}</p>
        <small className="text-muted-custom fs-8">Max size: {maxSizeMB}MB</small>
      </div>
      {error && <small className="text-danger mt-1 d-block fs-8">{error}</small>}
    </div>
  );
};
