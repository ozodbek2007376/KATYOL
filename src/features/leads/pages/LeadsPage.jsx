import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../api/leadsApi';
import LeadsSubNav from '../components/LeadsSubNav';
import LeadsFilterBar from '../components/LeadsFilterBar';
import LeadFormModal from '../components/LeadFormModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('BOARD'); // 'BOARD' or 'LIST'
  const [filter, setFilter] = useState({ search: '', status: '', source: '' });
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // 'ACTIVE' or 'ARCHIVED'
  
  const [showModal, setShowModal] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null });
  const navigate = useNavigate();

  const [kanbanColumns, setKanbanColumns] = useState(() => {
    const saved = localStorage.getItem('lead_kanban_columns');
    return saved ? JSON.parse(saved) : [
      { id: 'NEW', title: 'Yangi' },
      { id: 'CONTACTED', title: "Bog'lanildi" },
      { id: 'OFFER', title: 'Taklif berildi' },
      { id: 'NEGOTIATION', title: 'Muzokara' },
      { id: 'WON', title: 'Yutilgan' },
      { id: 'LOST', title: "Yo'qotilgan" }
    ];
  });

  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [colFormList, setColFormList] = useState([]);

  const handleOpenColModal = () => {
    setColFormList([...kanbanColumns]);
    setIsColModalOpen(true);
  };

  const handleSaveColumns = () => {
    const filtered = colFormList.map(c => {
      let id = c.id;
      if (!id) {
        id = c.title.trim().toUpperCase().replace(/\s+/g, '_');
      }
      return { ...c, id };
    }).filter(c => c.title.trim() !== '');

    localStorage.setItem('lead_kanban_columns', JSON.stringify(filtered));
    setKanbanColumns(filtered);
    setIsColModalOpen(false);
    loadLeads();
  };

  const handleMoveColUp = (index) => {
    if (index === 0) return;
    const list = [...colFormList];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setColFormList(list);
  };

  const handleMoveColDown = (index) => {
    if (index === colFormList.length - 1) return;
    const list = [...colFormList];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setColFormList(list);
  };

  const handleAddColRow = () => {
    setColFormList([...colFormList, { id: '', title: '' }]);
  };

  const handleRemoveColRow = (index) => {
    const list = colFormList.filter((_, idx) => idx !== index);
    setColFormList(list);
  };

  const handleColTitleChange = (index, value) => {
    const list = [...colFormList];
    list[index] = { ...list[index], title: value };
    setColFormList(list);
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleSave = async (leadData) => {
    try {
      if (leadToEdit) {
        await leadsApi.updateLead(leadToEdit.id, leadData);
      } else {
        await leadsApi.createLead(leadData);
      }
      setShowModal(false);
      loadLeads();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await leadsApi.deleteLead(id);
      setConfirmDialog({ show: false, id: null });
      loadLeads();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStageUp = async (lead) => {
    const currentIndex = kanbanColumns.findIndex((col) => col.id === lead.status);
    if (currentIndex > -1 && currentIndex < kanbanColumns.length - 1) {
      try {
        await leadsApi.updateLead(lead.id, { status: kanbanColumns[currentIndex + 1].id });
        loadLeads();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleStageDown = async (lead) => {
    const currentIndex = kanbanColumns.findIndex((col) => col.id === lead.status);
    if (currentIndex > 0) {
      try {
        await leadsApi.updateLead(lead.id, { status: kanbanColumns[currentIndex - 1].id });
        loadLeads();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleArchive = async (id) => {
    try {
      const leadObj = leads.find((l) => l.id === id);
      if (leadObj) {
        await leadsApi.updateLead(id, { ...leadObj, status: 'ARCHIVED' });
        loadLeads();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestore = async (id) => {
    try {
      const leadObj = leads.find((l) => l.id === id);
      if (leadObj) {
        await leadsApi.updateLead(id, { ...leadObj, status: 'NEW' });
        loadLeads();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (statusFilter === 'ACTIVE') {
      if (l.status === 'ARCHIVED') return false;
    } else {
      if (l.status !== 'ARCHIVED') return false;
    }

    const searchMatch = (l.fullName?.toLowerCase().includes(filter.search.toLowerCase()) ||
      l.companyName?.toLowerCase().includes(filter.search.toLowerCase()) ||
      l.phone?.includes(filter.search));
    const statusMatch = filter.status ? l.status === filter.status : true;
    const sourceMatch = filter.source ? l.source === filter.source : true;
    return searchMatch && statusMatch && sourceMatch;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const reminders = leads.filter(l => l.nextContactDate === todayStr && l.status !== 'WON' && l.status !== 'LOST' && l.status !== 'ARCHIVED');

  const renderBoard = () => {
    const columns = kanbanColumns;

    return (
      <div className="d-flex overflow-auto pb-3 gap-3" style={{ minHeight: '60vh' }}>
        {columns.map(col => (
          <div key={col.id} className="card border-custom flex-shrink-0" style={{ width: '300px', backgroundColor: 'var(--erp-bg-card)' }}>
            <div className="card-header border-bottom-0 pb-0">
              <h6 className="text-main fw-bold mb-0">{col.title} ({filteredLeads.filter(l => l.status === col.id).length})</h6>
            </div>
            <div className="card-body d-flex flex-column gap-3">
              {filteredLeads.filter(l => l.status === col.id).map(lead => (
                <div key={lead.id} className="card border-custom p-3 cursor-pointer shadow-sm" style={{ backgroundColor: 'var(--erp-bg-body)' }} onClick={(e) => {
                  if(!e.target.closest('button')) navigate(`/leads/${lead.id}`);
                }}>
                  <div className="fw-bold text-main mb-1">{lead.companyName || lead.fullName}</div>
                  <div className="text-muted-custom small mb-2">{lead.phone}</div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="badge bg-primary bg-opacity-50">{lead.source}</span>
                    <div className="btn-group">
                      {col.id !== 'NEW' && (
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={(e) => { e.stopPropagation(); handleStageDown(lead); }} title="Oldingi bosqichga Qaytarish">
                          <i className="bi bi-arrow-left"></i>
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={(e) => { e.stopPropagation(); setLeadToEdit(lead); setShowModal(true); }}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      {col.id !== 'WON' && col.id !== 'LOST' && (
                        <button className="btn btn-sm btn-outline-success py-0 px-2" onClick={(e) => { e.stopPropagation(); handleStageUp(lead); }} title="Keyingi bosqichga o'tkazish">
                          <i className="bi bi-arrow-right"></i>
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline-warning py-0 px-2" onClick={(e) => { e.stopPropagation(); handleArchive(lead.id); }} title="Arxivlash">
                        <i className="bi bi-archive"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderList = () => (
    <div className="card border-custom">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Mijoz</th>
              <th>Telefon</th>
              <th>Kompaniya</th>
              <th>Status</th>
              <th>Manba</th>
              <th>Keyingi aloqa</th>
              <th className="text-end">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)} style={{cursor: 'pointer'}}>
                <td>{lead.fullName}</td>
                <td>{lead.phone}</td>
                <td>{lead.companyName}</td>
                <td><span className="badge bg-secondary">{lead.status}</span></td>
                <td>{lead.source}</td>
                <td>{lead.nextContactDate || '-'}</td>
                <td className="text-end" onClick={e => e.stopPropagation()}>
                  {statusFilter === 'ACTIVE' ? (
                    <>
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => { setLeadToEdit(lead); setShowModal(true); }}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleArchive(lead.id)} title="Arxivlash">
                        <i className="bi bi-archive"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmDialog({ show: true, id: lead.id })}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleRestore(lead.id)} title="Arxivdan chiqarish">
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmDialog({ show: true, id: lead.id })} title="Butkul o'chirish">
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <LeadsSubNav />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-main mb-0">Lidlar (Potensial Mijozlar)</h2>
        <div className="d-flex gap-2">
          <div className="btn-group me-2">
            <button className={`btn ${statusFilter === 'ACTIVE' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setStatusFilter('ACTIVE')}>
              Faol Lidlar
            </button>
            <button className={`btn ${statusFilter === 'ARCHIVED' ? 'btn-warning text-dark' : 'btn-outline-warning'}`} onClick={() => setStatusFilter('ARCHIVED')}>
              Arxiv
            </button>
          </div>

          {statusFilter === 'ACTIVE' && (
            <div className="btn-group">
              <button className={`btn ${viewMode === 'BOARD' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('BOARD')}>
                <i className="bi bi-kanban"></i> Doska
              </button>
              <button className={`btn ${viewMode === 'LIST' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('LIST')}>
                <i className="bi bi-list-task"></i> Ro'yxat
              </button>
            </div>
          )}

          {statusFilter === 'ACTIVE' && (
            <button className="btn btn-outline-secondary" onClick={handleOpenColModal} title="Ustunlarni sozlash">
              <i className="bi bi-gear me-1"></i> Ustunlar Sozlamalari
            </button>
          )}

          <button className="btn btn-primary" onClick={() => { setLeadToEdit(null); setShowModal(true); }}>
            <i className="bi bi-plus-lg me-2"></i>Yangi Lid
          </button>
        </div>
      </div>

      {reminders.length > 0 && (
        <div className="alert alert-warning bg-warning bg-opacity-25 text-warning border-warning mb-4">
          <i className="bi bi-bell-fill me-2"></i> 
          <strong>Bugun bog'lanish kerak bo'lgan lidlar:</strong> {reminders.map(r => r.companyName || r.fullName).join(', ')}
        </div>
      )}

      <LeadsFilterBar filter={filter} setFilter={setFilter} />

      {loading ? (
        <div className="text-center text-main my-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        statusFilter === 'ARCHIVED' ? renderList() : (viewMode === 'BOARD' ? renderBoard() : renderList())
      )}

      <LeadFormModal 
        show={showModal} 
        handleClose={() => setShowModal(false)} 
        handleSave={handleSave} 
        leadToEdit={leadToEdit} 
      />

      {confirmDialog.show && (
        <ConfirmDialog
          isOpen={confirmDialog.show}
          onClose={() => setConfirmDialog({ show: false, id: null })}
          onConfirm={() => handleDelete(confirmDialog.id)}
          title="Lidni o'chirish"
          message="Haqiqatan ham bu lidni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        />
      )}

      {isColModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-custom" style={{ backgroundColor: 'var(--erp-bg-card)', color: 'var(--erp-text-main)' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Lidlar Doskasi Ustunlari</h5>
                <button type="button" className="btn-close" onClick={() => setIsColModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted-custom small">
                  Kanban doskasidagi ustunlarni qo'shishingiz, tartibini o'zgartirishingiz, nomini tahrirlashingiz yoki o'chirishingiz mumkin.
                </p>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                  {colFormList.map((col, index) => (
                    <div key={index} className="d-flex align-items-center gap-2 border-custom p-2 rounded" style={{ backgroundColor: 'var(--erp-bg-body)' }}>
                      <span className="text-secondary fw-semibold fs-7" style={{ width: '25px' }}>{index + 1}.</span>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder="Ustun nomi..." 
                        value={col.title} 
                        onChange={(e) => handleColTitleChange(index, e.target.value)} 
                      />
                      <div className="btn-group btn-group-sm flex-shrink-0">
                        <button 
                          className="btn btn-outline-secondary py-0 px-2" 
                          onClick={() => handleMoveColUp(index)}
                          disabled={index === 0}
                          title="Tepaga"
                        >
                          <i className="bi bi-arrow-up"></i>
                        </button>
                        <button 
                          className="btn btn-outline-secondary py-0 px-2" 
                          onClick={() => handleMoveColDown(index)}
                          disabled={index === colFormList.length - 1}
                          title="Pastga"
                        >
                          <i className="bi bi-arrow-down"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger py-0 px-2" 
                          onClick={() => handleRemoveColRow(index)}
                          title="O'chirish"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-sm btn-outline-primary mt-3 w-100 d-flex align-items-center justify-content-center gap-1" onClick={handleAddColRow}>
                  <i className="bi bi-plus-lg"></i> Yangi ustun qo'shish
                </button>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsColModalOpen(false)}>Bekor qilish</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveColumns}>Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
