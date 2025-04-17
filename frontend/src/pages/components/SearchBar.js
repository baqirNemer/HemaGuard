import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar({ onSearchChange }) {
  const handleInputChange = (event) => {
    const searchTerm = event.target.value;
    onSearchChange(searchTerm); // Invoke callback with search term
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Prevent form submission (if needed)
    // Implement search logic here if needed
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px', marginBottom: '4px' }}>
      <Paper
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, marginTop: '4px', marginBottom: '4px' }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search"
          inputProps={{ 'aria-label': 'search google maps' }}
          onChange={handleInputChange}
        />
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      </Paper>
    </div>
  );
}
