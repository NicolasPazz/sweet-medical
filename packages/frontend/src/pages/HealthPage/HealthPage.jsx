import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '@/lib/api-utils';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 28, color: '#271f92' }} spin />;

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
      <Link to="/" className="mb-4 text-sm text-blue-400 hover:underline text-ellipsis">
        ← Volver al inicio
      </Link>

      {healthData ? (
        <pre className="flex-1 overflow-auto rounded-lg bg-zinc-800 p-4 text-sm">
          {JSON.stringify(healthData, null, 2)}
        </pre>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 16,
          }}
        >
          <Spin indicator={spinIcon} />
          <span
            style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 13 }}
            className="text-ellipsis"
          >
            Consultando estado del backend...
          </span>
        </div>
      )}
    </div>
  );
}
