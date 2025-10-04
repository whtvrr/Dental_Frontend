import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import AnatomicalToothSVG from './AnatomicalToothSVG';

const ToothComponent = ({
  number,
  conditions = {},
  onSurfaceClick,
  isSelected,
  statusesMap = {},
  readOnly = false
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 1,
      borderRadius: 1,
      backgroundColor: isSelected ? (theme.palette.mode === 'dark' ? colors.blueAccent[800] : colors.blueAccent[100]) : 'transparent',
      transition: 'all 0.3s ease',
      minWidth: 130,
      position: 'relative'
    }}>
      <AnatomicalToothSVG
        number={number}
        conditions={conditions}
        onSurfaceClick={onSurfaceClick}
        isSelected={isSelected}
        statusesMap={statusesMap}
        readOnly={readOnly}
      />
      
    </Box>
  );
};

export default ToothComponent;