// components/SearchBar.js
import React, { useState } from 'react';
import { Paper, InputBase, IconButton, Divider, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearchChange, categoryNames }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('category');

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value, selectedCategory);
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    onSearchChange(searchTerm, category);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Prevent form submission
    // Implement search logic if needed
  };

  return (
    <Paper component="form" onSubmit={handleSearchSubmit} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
      <Select value={selectedCategory} onChange={handleCategoryChange} sx={{ minWidth: 120, mr: 1 }}>
        <MenuItem value="category">Category</MenuItem>
        <MenuItem value="hospital">Hospital</MenuItem>
        <MenuItem value="doctor">Doctor Email</MenuItem>
      </Select>
      <Divider orientation="vertical" sx={{ height: 28 }} />
      <InputBase
        placeholder={`Search ${selectedCategory}`}
        value={searchTerm}
        onChange={handleInputChange}
        sx={{ ml: 1, flex: 1 }}
      />
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
