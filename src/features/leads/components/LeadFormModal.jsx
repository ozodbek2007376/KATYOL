import React, { useState, useEffect } from 'react';

const LeadFormModal = ({ show, handleClose, handleSave, leadToEdit }) => {
  const initialForm = {
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    status: 'NEW',
    source: 'Telegram',
    notes: '',
    nextContactDate: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (leadToEdit) {
      setFormData(leadToEdit);
    } else {
      setFormData(initialForm);
    }
  }, [leadToEdit, show]);

  const handleChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'phone') {
      val = val.replace(/[^\d+]/g, '');
      if (val.includes('+')) {
        const hasLeading = val.startsWith('+');
        val = (hasLeading ? '+' : '') + val.replace(/\+/g, '');
      }
    }
    setFormData({ ...formData, [e.target.name]: val });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSave(formData);
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-custom shadow-lg">
          <div className="modal-header border-bottom-0">
            <h5 className="modal-title text-main">{leadToEdit ? 'Lidni tahrirlash' : 'Yangi Lid'}</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={onSubmit} id="leadForm">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-main">To'liq ism *</label>
                  <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-main">Telefon *</label>
                  <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-main">Email</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-main">Kompaniya nomi</label>
                  <input type="text" className="form-control" name="companyName" value={formData.companyName} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-main">Status</label>
                  <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                    {(() => {
                      const saved = localStorage.getItem('lead_kanban_columns');
                      const cols = saved ? JSON.parse(saved) : [
                        { id: 'NEW', title: 'Yangi' },
                        { id: 'CONTACTED', title: "Bog'lanildi" },
                        { id: 'OFFER', title: 'Taklif berildi' },
                        { id: 'NEGOTIATION', title: 'Muzokara' },
                        { id: 'WON', title: 'Yutilgan' },
                        { id: 'LOST', title: "Yo'qotilgan" }
                      ];
                      return cols.map((col) => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ));
                    })()}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-main">Manba</label>
                  <select className="form-select" name="source" value={formData.source} onChange={handleChange}>
                    <option value="Telegram">Telegram</option>
                    <option value="Telefon">Telefon</option>
                    <option value="Tavsiya">Tavsiya</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-main">Keyingi aloqa sanasi</label>
                  <input type="date" className="form-control" name="nextContactDate" value={formData.nextContactDate} onChange={handleChange} />
                </div>
                <div className="col-md-12">
                  <label className="form-label text-main">Izoh</label>
                  <textarea className="form-control" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer border-top-0">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Bekor qilish</button>
            <button type="submit" form="leadForm" className="btn btn-primary">Saqlash</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadFormModal;
