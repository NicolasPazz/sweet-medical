import './TurnosPagination.css';

export default function TurnosPagination({ page, totalPages, onPageChange }) {
  return (
    <div className="paginacion-contenedor">
      <button
        className="paginacion-boton"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        &laquo; Anterior
      </button>
      <span className="paginacion-info">
        Página <strong>{page}</strong> de {totalPages}
      </span>
      <button
        className="paginacion-boton"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Siguiente &raquo;
      </button>
    </div>
  );
}
