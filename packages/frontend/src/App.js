import React, { useState, useEffect } from 'react';
import './App.css';

const HealthCheck = () => {
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';
    fetch(`${apiUrl}/health`)
      .then((res) => res.json())
      .then((data) => setHealthData(data))
      .catch(() => setHealthData({ status: 'error', message: 'Backend inalcanzable' }));
  }, []);

  return (
    <pre
      style={{
        padding: '20px',
        backgroundColor: '#282c34',
        color: 'white',
        margin: 0,
        height: '100vh',
      }}
    >
      {healthData ? JSON.stringify(healthData, null, 2) : 'Cargando estado...'}
    </pre>
  );
};

const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sweet Medical</h1>
        <p>
          Revisar estado en:{' '}
          <a href="/health" style={{ color: '#61dafb' }}>
            /health
          </a>
        </p>
      </header>
    </div>
  );
};

function App() {
  const currentPath = window.location.pathname;

  if (currentPath === '/health') {
    return <HealthCheck />;
  }

  return <Home />;
}

export default App;
