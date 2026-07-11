import './Toast.css';

export default function Toast({ mensaje, tipo = 'success' }) {
  if (!mensaje) return null;

  return <div className={`toast toast-${tipo} text-ellipsis`}>{mensaje}</div>;
}
