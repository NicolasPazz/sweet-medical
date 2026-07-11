/**
 * Ítem del carrito de preselección (DTO de búsqueda normalizado).
 * @typedef {Object} CartTurnItem
 * @property {string} id
 * @property {number|null|undefined} costoEstimado
 * @property {string|null} [cobertura]
 * @property {object|null} [medico]
 * @property {string|null} [fecha]
 * @property {string|null} [hora]
 * @property {string|null} [sede]
 * @property {string|null} [estado]
 */

/**
 * Mapea un turno del endpoint de búsqueda al formato del carrito.
 * Usa solo `costoEstimado` (cálculo con cobertura); no usa `costo` de dominio.
 * @param {object} turnoDto - Respuesta de TurnoBusquedaService / TurnoMapper
 * @returns {CartTurnItem}
 */
export function mapTurnoBusquedaToCartItem(turnoDto) {
  return {
    id: String(turnoDto.id ?? turnoDto.id_turno),
    costoEstimado: turnoDto.costoEstimado,
    cobertura: turnoDto.cobertura ?? null,
    medico: turnoDto.profesional ?? turnoDto.medico ?? null,
    fecha: turnoDto.fecha ?? null,
    hora: turnoDto.hora ?? null,
    sede: turnoDto.sede ?? null,
    estado: turnoDto.estado ?? null,
  };
}
