import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye } from 'lucide-react';

export default function Dashboard() {
  const [simulations, setSimulations] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/api/simulations/user/${user.id}`)
      .then(res => res.json())
      .then(data => setSimulations(data))
      .catch(err => console.error(err));
  }, [navigate, user]);

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Mis Simulaciones <span style={{ color: 'var(--accent)' }}>Recientes</span></h2>
        <button className="btn-primary" onClick={() => navigate('/catalog')} style={{ background: 'var(--bg-card)' }}>
          <ArrowLeft size={18} /> Catálogo
        </button>
      </header>

      {simulations.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Aún no has realizado ninguna simulación.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>TEA</th>
                <th>Plazo</th>
                <th>VAN</th>
                <th>TCEA</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map(sim => (
                <tr key={sim.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} color="var(--text-secondary)" />
                      {new Date(sim.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{sim.vehicle.brand} {sim.vehicle.model}</td>
                  <td>{(sim.tea * 100).toFixed(2)}%</td>
                  <td>{sim.months} meses</td>
                  <td style={{ color: 'var(--success)' }}>${sim.van.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{(sim.tcea * 100).toFixed(2)}%</td>
                  <td>
                    <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => navigate(`/simulation/${sim.vehicleId}`)}>
                      <Eye size={14} /> Nueva
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
