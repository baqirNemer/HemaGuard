import React, { useState } from 'react';
import ResponsiveAppBar from './components/Navbar';
import ResponsiveFooter from './components/footer';
import SearchBar from './components/SearchBar';
import CardController from './components/CardController';

function Hospitals() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="App">
      <ResponsiveAppBar />
      <SearchBar onSearchChange={handleSearchChange} />
      <CardController searchTerm={searchTerm} />
      <ResponsiveFooter />
    </div>
  );
}

export default Hospitals;
