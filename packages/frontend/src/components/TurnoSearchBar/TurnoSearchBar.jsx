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

  return <form className="turno-search" onSubmit={handleSearch}></form>;
};

export default TurnoSearchBar;
