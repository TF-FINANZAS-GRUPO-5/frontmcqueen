import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Calculator, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Catalog() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/api/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error(err));
  }, [navigate, user]);

  const openModal = (v) => {
    setSelectedVehicle(v);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedVehicle(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (!selectedVehicle) return;
    const images = JSON.parse(selectedVehicle.images || '[]');
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!selectedVehicle) return;
    const images = JSON.parse(selectedVehicle.images || '[]');
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h2>Catálogo de <span style={{ color: 'var(--accent)' }}>Vehículos</span></h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ background: 'var(--bg-card)' }}>
            <LayoutDashboard size={18} /> Mis Simulaciones
          </button>
          <button className="btn-primary" onClick={() => { localStorage.clear(); navigate('/login'); }}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-3">
        {vehicles.map(v => (
          <div key={v.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img src={v.imageUrl} alt={`${v.brand} ${v.model}`} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{v.brand} {v.model}</h3>
              <p style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                ${v.price.toLocaleString()}
              </p>
              <button 
                className="btn-primary" 
                style={{ marginTop: 'auto', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onClick={() => openModal(v)}
              >
                <Info size={18} /> Ver especificaciones
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedVehicle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ 
            width: '90%', maxWidth: '800px', padding: '0', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh' 
          }}>
            <button 
              onClick={closeModal} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={24} />
            </button>
            
            <div style={{ position: 'relative', height: '400px', background: '#000' }}>
              {selectedVehicle.images ? (
                <>
                  <img 
                    src={JSON.parse(selectedVehicle.images)[currentImageIndex]} 
                    alt="Vehicle" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                  {JSON.parse(selectedVehicle.images).length > 1 && (
                    <>
                      <button onClick={prevImage} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}>
                        <ChevronLeft size={32} />
                      </button>
                      <button onClick={nextImage} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}>
                        <ChevronRight size={32} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <img src={selectedVehicle.imageUrl} alt="Vehicle" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedVehicle.brand} {selectedVehicle.model}</h2>
                  <p style={{ color: 'var(--accent)', fontSize: '1.75rem', fontWeight: 'bold' }}>${selectedVehicle.price.toLocaleString()}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                  <div>
                    <p className="input-label">Año</p>
                    <p style={{ fontWeight: '600' }}>{selectedVehicle.year || '2024'}</p>
                  </div>
                  <div>
                    <p className="input-label">Motor</p>
                    <p style={{ fontWeight: '600' }}>{selectedVehicle.engine || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="input-label">Transmisión</p>
                    <p style={{ fontWeight: '600' }}>{selectedVehicle.transmission || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn-primary" 
                style={{ width: '100%', fontSize: '1.25rem', padding: '1rem' }}
                onClick={() => navigate(`/simulation/${selectedVehicle.id}`)}
              >
                <Calculator size={24} /> Simular Crédito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
