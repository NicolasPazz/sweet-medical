import './CoverageBadge.css';

export default function CoverageBadge({ cobertura }) {
  const getCoverageLabel = (cobertura) => {
    switch (cobertura) {
      case 'TOTAL':
        return { text: 'Cubierto', className: 'etiqueta-total' };
      case 'PARCIAL':
        return { text: 'Parcial', className: 'etiqueta-parcial' };
      case 'NO_CUBIERTA':
      default:
        return { text: 'No cubierto', className: 'etiqueta-no' };
    }
  };

  const badge = getCoverageLabel(cobertura);

  return <span className={`badge ${badge.className}`}>{badge.text}</span>;
}
