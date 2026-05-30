import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '@/lib/api-utils';

export default function HealthPage() {
  const [healthData, setHealthData] = useState(null);
  useEffect(() => {
    fetch(apiUrl('/health'))
      .then((res) => res.json())
      .then((data) => setHealthData(data))
      .catch(() => setHealthData({ status: 'error', message: 'Backend inalcanzable' }));
  }, []);

  return (
    <div className="flex min-h-full flex-col bg-zinc-900 p-6 text-zinc-100">
      <Link to="/" className="mb-4 text-sm text-blue-400 hover:underline">
        ← Volver al inicio
      </Link>
      <pre className="flex-1 overflow-auto rounded-lg bg-zinc-800 p-4 text-sm">
        {healthData ? JSON.stringify(healthData, null, 2) : 'Cargando estado...'}
      </pre>
    </div>
  );
}
