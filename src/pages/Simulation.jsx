import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calculator } from 'lucide-react';

export default function Simulation() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [vehicle, setVehicle] = useState(null);
  
  // Form State
  const [initialPayment, setInitialPayment] = useState('');
  const [tea, setTea] = useState('10');
  const [months, setMonths] = useState('36');
  const [gracePeriod, setGracePeriod] = useState('0');
  const [graceType, setGraceType] = useState('ninguno');
  const [hasDesgravamen, setHasDesgravamen] = useState(true);
  const [vrRatio, setVrRatio] = useState('0'); // % of Smart Buy

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/api/vehicles/${vehicleId}`)
      .then(res => res.json())
      .then(data => {
        if(data.error) throw new Error(data.error);
        setVehicle(data);
      })
      .catch(err => {
        console.error(err);
        navigate('/catalog');
      });
  }, [vehicleId, navigate, user]);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const data = {
      userId: user.id,
      vehicleId: Number(vehicleId),
      initialPayment: Number(initialPayment),
      tea: Number(tea) / 100,
      months: Number(months),
      gracePeriod: Number(gracePeriod),
      graceType: gracePeriod > 0 ? graceType : 'ninguno',
      hasDesgravamen,
      vrRatio: Number(vrRatio) / 100
    };

    if (data.initialPayment > vehicle.price * 0.5) {
      return setError('La cuota inicial no puede exceder el 50% del precio del vehículo');
    }
    if (data.initialPayment < 0) return setError('La cuota inicial no puede ser negativa');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Error al simular');
      setResult(json);
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado');
    }
  };

  if (!vehicle) return null;

  return (
    <div className="container">
      <button onClick={() => navigate('/catalog')} className="btn-primary" style={{ marginBottom: '2rem', background: 'var(--bg-card)' }}>
        <ArrowLeft size={18} /> Volver al Catálogo
      </button>

      <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator /> Simular Crédito
          </h2>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{vehicle.brand} {vehicle.model}</h3>
            <p>Precio Total: <strong style={{ color: 'var(--success)' }}>${vehicle.price.toLocaleString()}</strong></p>
          </div>

          <form onSubmit={handleSimulate}>
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Cuota Inicial (USD) - Máx 50%</label>
                <input type="number" className="input-field" value={initialPayment} onChange={e => setInitialPayment(e.target.value)} required min="0" max={vehicle.price * 0.5} />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">TEA (%)</label>
                <input type="number" step="0.01" className="input-field" value={tea} onChange={e => setTea(e.target.value)} required min="1" max="100" />
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Plazo (Meses)</label>
                <select className="input-field" value={months} onChange={e => setMonths(e.target.value)}>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                  <option value="60">60 meses</option>
                  <option value="72">72 meses</option>
                </select>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Compra Inteligente (Valor Residual %)</label>
                <input type="number" className="input-field" value={vrRatio} onChange={e => setVrRatio(e.target.value)} required min="0" max="50" />
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Periodos de Gracia (Meses)</label>
                <input type="number" className="input-field" value={gracePeriod} onChange={e => setGracePeriod(e.target.value)} required min="0" max="12" />
              </div>
              {Number(gracePeriod) > 0 && (
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Tipo de Gracia</label>
                  <select className="input-field" value={graceType} onChange={e => setGraceType(e.target.value)}>
                    <option value="parcial">Parcial (Paga intereses)</option>
                    <option value="total">Total (No paga, capitaliza)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="desgravamen" checked={hasDesgravamen} onChange={e => setHasDesgravamen(e.target.checked)} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
              <label htmlFor="desgravamen" style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                Incluir Seguro de Desgravamen (0.05% mensual)
              </label>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              * Se incluye Seguro Vehicular Obligatorio (0.1% mensual del valor del vehículo).
            </p>

            {error && <p className="text-error" style={{ marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Generar Plan de Pagos</button>
          </form>
        </div>

        {result && (
          <div className="glass-panel" style={{ height: 'fit-content' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle /> Resultados de Simulación
            </h2>
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                <p className="input-label">VAN</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${result.financials.van.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                <p className="input-label">TCEA (Anual)</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>{(result.financials.tcea * 100).toFixed(2)}%</p>
              </div>
            </div>
            
            <p style={{ marginTop: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>El plan ha sido guardado en tu historial.</p>
          </div>
        )}
      </div>

      {result && (
        <div className="glass-panel" style={{ marginTop: '2rem', overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '1rem' }}>Cronograma de Pagos (Método Francés)</h2>
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Saldo Inicial</th>
                <th>Amortización</th>
                <th>Interés</th>
                <th>Desgravamen</th>
                <th>Seguro Veh.</th>
                <th>Cuota Total</th>
                <th>Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              {result.paymentPlan.map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td>${(row.balance + row.amortization).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td>${row.amortization.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td>${row.interest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td>${row.desgravamen.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td>${row.vehicleInsurance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>${row.quota.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td>${row.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
