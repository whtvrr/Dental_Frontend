import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import AnatomicalToothSVG from './AnatomicalToothSVG';

const ToothComponent = ({ 
  number, 
  conditions = {}, 
  onSurfaceClick, 
  isSelected 
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 0.5,
      borderRadius: 1,
      backgroundColor: isSelected ? (theme.palette.mode === 'dark' ? colors.blueAccent[800] : colors.blueAccent[100]) : 'transparent',
      transition: 'all 0.3s ease',
      minWidth: 65,
      position: 'relative'
    }}>
      <AnatomicalToothSVG
        number={number}
        conditions={conditions}
        onSurfaceClick={onSurfaceClick}
        isSelected={isSelected}
      />
      
      {/* Tooth number below diagram */}
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 0.5, 
          fontWeight: 600,
          fontSize: '0.8rem',
          color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]
        }}
      >
        {number}
      </Typography>
    </Box>
  );
};

export default ToothComponent;