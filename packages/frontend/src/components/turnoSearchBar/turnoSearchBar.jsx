import { useState } from 'react';
import { FaUserMd, FaSearch } from 'react-icons/fa';
import './TurnoSearchBar.css';

const TurnoSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form className="turno-search" onSubmit={handleSearch}>
      <div className="search-field">
        <label className="field-label">ESPECIALIDAD O MÉDICO</label>

        <div className="input-wrapper">
          <FaUserMd className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Ej: Cardiología, Dr. Pérez..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="search-button">
        <FaSearch className="button-icon" />
        Buscar
      </button>
    </form>
  );
};

export default TurnoSearchBar;