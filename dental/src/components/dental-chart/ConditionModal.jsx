// File: src/components/dental-chart/ConditionModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import {
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';

const ConditionModal = ({
  open,
  onClose,
  onSelect,
  selectedTooth,
  selectedSurface,
  statusesMap = {},
  statusesLoading = false
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const handleManageStatuses = () => {
    onClose(); // Close the modal first
    navigate('/statuses'); // Navigate to statuses management page
  };

  const formatSurfaceName = (surface) => {
    const surfaceNames = {
      crown: 'Коронка',
      root: 'Корень',
      occlusal: 'Жевательная поверхность',
      incisal: 'Режущий край',
      mesial: 'Медиальная поверхность',
      distal: 'Дистальная поверхность',
      lingual: 'Язычная поверхность',
      cervical: 'Пришеечная область',
      pulp: 'Пульпа',
      jaw: 'Челюстная кость',
      gum_mesial: 'Десна медиальная',
      gum_distal: 'Десна дистальная',
      cusp: 'Бугор',
      buccal_cusp: 'Щечный бугор',
      lingual_cusp: 'Язычный бугор',
      cusp_mb: 'Медиально-щечный бугор',
      cusp_db: 'Дистально-щечный бугор',
      cusp_ml: 'Медиально-язычный бугор',
      cusp_dl: 'Дистально-язычный бугор',
      central_fossa: 'Центральная ямка',
      root_mesial: 'Медиальный корень',
      root_distal: 'Дистальный корень'
    };
    
    // Handle numbered roots and channels
    if (surface.startsWith('root_')) {
      const rootNumber = surface.split('_')[1];
      return `Корень ${rootNumber}`;
    }
    
    if (surface.startsWith('channel_')) {
      const parts = surface.split('_');
      if (parts.length >= 3) {
        return `Канал ${parts[1]}-${parts[2]}`;
      } else if (parts.length >= 2) {
        return `Канал ${parts[1]}`;
      }
      return 'Канал';
    }
    
    return surfaceNames[surface] || surface;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          backgroundColor: colors.primary[400],
          maxHeight: '85vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: colors.grey[100], 
        backgroundColor: colors.primary[500],
        borderBottom: `1px solid ${colors.grey[600]}`
      }}>
        <Typography variant="h5">
          Состояние зуба {selectedTooth}
        </Typography>
        {selectedSurface && (
          <Typography variant="subtitle1" color={colors.grey[300]}>
            {formatSurfaceName(selectedSurface)}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {statusesLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <Typography color={colors.grey[100]}>Загрузка статусов...</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {Object.entries(statusesMap).map(([key, condition]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: colors.primary[500],
                    border: `1px solid ${colors.grey[600]}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: colors.primary[600],
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${colors.grey[800]}`
                    }
                  }}
                  onClick={() => onSelect(key)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: condition.color,
                        border: `2px solid ${colors.grey[500]}`,
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        color={colors.grey[100]}
                        sx={{ fontWeight: 500 }}
                      >
                        {condition.label}
                      </Typography>
                      {condition.type && condition.type !== 'normal' && (
                        <Typography 
                          variant="caption" 
                          color={colors.grey[300]}
                          sx={{ display: 'block' }}
                        >
                          {condition.type === 'diagnosis' ? 'Диагноз' : 
                           condition.type === 'treatment' ? 'Лечение' : condition.type}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Manage Statuses Section */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleManageStatuses}
            sx={{ 
              color: colors.blueAccent[400],
              borderColor: colors.blueAccent[400],
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                backgroundColor: colors.blueAccent[400] + '20',
                borderColor: colors.blueAccent[300],
              }
            }}
          >
            Управление статусами
          </Button>
          <Typography 
            variant="body2" 
            color={colors.grey[300]} 
            sx={{ mt: 1, fontSize: '0.875rem' }}
          >
            Добавить, изменить или удалить статусы зубов
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        backgroundColor: colors.primary[500],
        borderTop: `1px solid ${colors.grey[600]}`
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: colors.grey[300],
            '&:hover': {
              backgroundColor: colors.grey[700]
            }
          }}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConditionModal;