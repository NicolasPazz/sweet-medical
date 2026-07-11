import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Spinner.css';

/**
 * Spinner reutilizable basado en Ant Design <Spin>.
 *
 * Props:
 *   size     — 'small' | 'default' (default) | 'large'
 *   text     — string opcional debajo del anillo
 *   inline   — boolean: layout horizontal (útil dentro de botones o cards)
 */
export default function Spinner({ size = 'default', text = 'Cargando...', inline = false }) {
  const indicator = (
    <LoadingOutlined
      style={{ fontSize: size === 'large' ? 36 : size === 'small' ? 18 : 26, color: '#271f92' }}
      spin
    />
  );

  if (inline) {
    return (
      <span className="sm-spinner-inline">
        <Spin indicator={indicator} size={size} />
        {text && <span className="sm-spinner-inline-text text-ellipsis">{text}</span>}
      </span>
    );
  }

  return (
    <div className="sm-spinner-wrapper">
      <Spin indicator={indicator} size={size} />
      {text && <span className="sm-spinner-text text-ellipsis">{text}</span>}
    </div>
  );
}
