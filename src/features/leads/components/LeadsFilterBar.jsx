import React from 'react';

const LeadsFilterBar = ({ filter, setFilter }) => {
  const handleChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  return (
    <div className="card border-custom mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Qidirish (Ism, Kompaniya, Telefon)..." 
              name="search"
              value={filter.search || ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              name="status"
              value={filter.status || ''}
              onChange={handleChange}
            >
              <option value="">Barcha statuslar</option>
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
          <div className="col-md-3">
            <select 
              className="form-select" 
              name="source"
              value={filter.source || ''}
              onChange={handleChange}
            >
              <option value="">Barcha manbalar</option>
              <option value="Telegram">Telegram</option>
              <option value="Telefon">Telefon</option>
              <option value="Tavsiya">Tavsiya</option>
              <option value="Facebook">Facebook</option>
              <option value="Boshqa">Boshqa</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsFilterBar;
