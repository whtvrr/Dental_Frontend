import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import ToothComponent from './ToothComponent';
import ConditionModal from './ConditionModal';
import { TOOTH_NUMBERS } from '../../data/dentalConditions';
import { useDentalChart } from '../../hooks/useDentalChart';
import { useStatuses } from '../../hooks/useStatuses';

const DentalChart = ({ patientId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedSurface, setSelectedSurface] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const { toothConditions, updateToothCondition, loading } = useDentalChart(patientId);
  const { statusesMap, loading: statusesLoading } = useStatuses();

  const handleToothSurfaceClick = useCallback((toothNumber, surface = 'crown') => {
    setSelectedTooth(toothNumber);
    setSelectedSurface(surface);
    setModalOpen(true);
  }, []);

  const handleConditionSelect = useCallback(async (condition) => {
    if (selectedTooth && selectedSurface) {
      await updateToothCondition(selectedTooth, selectedSurface, condition);
      setModalOpen(false);
      setSelectedTooth(null);
      setSelectedSurface(null);
    }
  }, [selectedTooth, selectedSurface, updateToothCondition]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedTooth(null);
    setSelectedSurface(null);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            mb: 2, 
            fontWeight: 700,
            color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]
          }}
        >
          Зубная формула
        </Typography>
        <Typography 
          variant="h6" 
          sx={{
            color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]
          }}
        >
          Интерактивная карта состояния зубов пациента
        </Typography>
      </Box>

      {/* Professional Layout Container */}
      <Paper sx={{ 
        p: 4,
        backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : '#ffffff',
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[300]}`,
        boxShadow: theme.shadows[3]
      }}>
        
        {/* Upper Jaw */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              textAlign: 'center', 
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[800]
            }}
          >
            Верхняя челюсть
          </Typography>
          
          {/* Pink gum background for upper jaw */}
          <Box sx={{
            background: `linear-gradient(to bottom, 
              ${theme.palette.mode === 'dark' ? '#2d1b2e' : '#fce4ec'} 0%, 
              ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 100%)`,
            borderRadius: 2,
            p: 2,
            mb: 2
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              gap: 1
            }}>
              {TOOTH_NUMBERS.upper.map((number) => (
                <ToothComponent
                  key={number}
                  number={number}
                  conditions={toothConditions[number] || {}}
                  onSurfaceClick={handleToothSurfaceClick}
                  isSelected={selectedTooth === number}
                  statusesMap={statusesMap}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Lower Jaw */}
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              textAlign: 'center', 
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[800]
            }}
          >
            Нижняя челюсть
          </Typography>
          
          {/* Pink gum background for lower jaw */}
          <Box sx={{
            background: `linear-gradient(to top, 
              ${theme.palette.mode === 'dark' ? '#2d1b2e' : '#fce4ec'} 0%, 
              ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 100%)`,
            borderRadius: 2,
            p: 2
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              gap: 1
            }}>
              {TOOTH_NUMBERS.lower.map((number) => (
                <ToothComponent
                  key={number}
                  number={number}
                  conditions={toothConditions[number] || {}}
                  onSurfaceClick={handleToothSurfaceClick}
                  isSelected={selectedTooth === number}
                  statusesMap={statusesMap}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      <ConditionModal
        open={modalOpen}
        onClose={handleModalClose}
        onSelect={handleConditionSelect}
        selectedTooth={selectedTooth}
        selectedSurface={selectedSurface}
      />
    </Box>
  );
};

export default DentalChart;