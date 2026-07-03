import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

const CustomSelect = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div className="input-field" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setOpen(!open)}>
        {options.find(o => String(o.value) === String(value))?.label || 'Seleccionar'}
        <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-dark)', border: '1px solid var(--accent)', borderRadius: '8px', marginTop: '0.5rem', zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', background: String(value) === String(opt.value) ? 'var(--accent)' : 'transparent', transition: 'background 0.2s' }} onMouseEnter={(e) => { if(String(value) !== String(opt.value)) e.target.style.background = 'rgba(59, 130, 246, 0.2)' }} onMouseLeave={(e) => { if(String(value) !== String(opt.value)) e.target.style.background = 'transparent' }}>
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const NumberInput = ({ value, onChange, min, max, step = 1, float = false }) => {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input type="number" className="input-field" value={value} onChange={e => onChange(e.target.value)} min={min} max={max} step={float ? '0.01' : '1'} required style={{ paddingRight: '2.5rem' }} />
      <div style={{ position: 'absolute', right: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px', top: '50%', transform: 'translateY(-50%)', marginTop: '0.25rem', zIndex: 10 }}>
        <button type="button" onClick={() => onChange(String(Math.min(max, Number(value || 0) + step)))} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', padding: 0 }}><ChevronUp size={16} /></button>
        <button type="button" onClick={() => onChange(String(Math.max(min, Number(value || 0) - step)))} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', padding: 0 }}><ChevronDown size={16} /></button>
      </div>
    </div>
  )
}

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
  const [bank, setBank] = useState('bcp'); // Default bank

  const bankVrRatios = {
    'bcp': 40,
    'bbva': 30,
    'interbank': 35,
    'scotiabank': 45,
    'pichincha': 50
  };

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
      bank: bank,
      smartPercentage: bankVrRatios[bank] / 100,
      vrRatio: bankVrRatios[bank] / 100
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
                <NumberInput value={initialPayment} onChange={setInitialPayment} min={0} max={vehicle.price * 0.5} step={500} />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">TEA (%)</label>
                <NumberInput value={tea} onChange={setTea} min={1} max={100} step={1} float={true} />
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Plazo (Meses)</label>
                <div className="input-field" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}>
                  36 meses (Fijo)
                </div>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Banco (Compra Inteligente - % Residual)</label>
                <CustomSelect 
                  value={bank} 
                  onChange={setBank} 
                  options={[
                    {value: 'bcp', label: 'BCP (40%)'},
                    {value: 'interbank', label: 'Interbank (35%)'},
                    {value: 'bbva', label: 'BBVA (30%)'},
                    {value: 'scotiabank', label: 'Scotiabank (45%)'},
                    {value: 'pichincha', label: 'Pichincha (50%)'},
                  ]} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Periodos de Gracia (Meses)</label>
                <NumberInput value={gracePeriod} onChange={setGracePeriod} min={0} max={12} step={1} />
              </div>
              {Number(gracePeriod) > 0 && (
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Tipo de Gracia</label>
                  <CustomSelect 
                    value={graceType} 
                    onChange={setGraceType} 
                    options={[
                      {value: 'parcial', label: 'Parcial (Paga intereses)'},
                      {value: 'total', label: 'Total (No paga, capitaliza)'},
                    ]} 
                  />
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
            <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                <p className="input-label">VAN</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${result.financials.van.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                <p className="input-label">TIR (Mensual)</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>{(result.financials.tir * 100).toFixed(2)}%</p>
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
                <th>TEA</th>
                <th>TEM</th>
                <th>Gracia</th>
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
                  <td>{(row.tea * 100).toFixed(2)}%</td>
                  <td>{(row.tem * 100).toFixed(6)}%</td>
                  <td>{row.grace}</td>
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
