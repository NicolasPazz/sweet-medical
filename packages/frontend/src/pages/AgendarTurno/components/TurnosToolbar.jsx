import './TurnosToolbar.css';

export default function TurnosToolbar({
  totalResults,
  loading,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) {
  return (
    <div className="resultados-barra">
      <div className="resultados-conteo">
        {totalResults > 0 ? (
          <span>
            Se encontraron <strong>{totalResults}</strong> turnos disponibles
          </span>
        ) : (
          !loading && <span>No se han realizado búsquedas o no hay turnos disponibles</span>
        )}
      </div>

      {totalResults > 0 && (
        <div className="controles-ordenamiento">
          <div className="ordenar-campo">
            <label htmlFor="sortBy">Ordenar por:</label>
            <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="costo">Costo Estimado</option>
              <option value="fecha">Fecha y Hora</option>
            </select>
          </div>
          <div className="ordenar-direccion">
            <label htmlFor="sortOrder">Dirección:</label>
            <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
