// components/Button.js
import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// Accept the onClick handler as a prop
const ContainedButton = ({ text, onClick, className, type }) => {
  return (
    <Stack direction="row" justifyContent="center" spacing={2}>
      {/* Pass onClick handler and type to the Button component */}
      <Button variant="contained" style={{ backgroundColor: '#008A88' }} className={className} onClick={onClick} type={type}>
        {text}
      </Button>
    </Stack>
  );
};

export default ContainedButton;
