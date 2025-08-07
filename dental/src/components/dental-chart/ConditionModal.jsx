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
  TextField,
  Collapse,
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { DENTAL_CONDITIONS } from '../../data/dentalConditions';
import ColorPicker from './ColorPicker';

const ConditionModal = ({ 
  open, 
  onClose, 
  onSelect, 
  selectedTooth, 
  selectedSurface 
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: '',
    shortName: '',
    color: '#ffffff'
  });

  const handleAddCondition = () => {
    if (newCondition.name && newCondition.color) {
      const conditionKey = newCondition.shortName || 
        newCondition.name.toLowerCase().replace(/\s+/g, '_');
      
      // In a real app, this would make an API call
      DENTAL_CONDITIONS[conditionKey] = {
        label: newCondition.name,
        color: newCondition.color
      };
      
      onSelect(conditionKey);
      setNewCondition({ name: '', shortName: '', color: '#ffffff' });
      setShowAddForm(false);
    }
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
        <Grid container spacing={2}>
          {Object.entries(DENTAL_CONDITIONS).map(([key, condition]) => (
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
                  <Typography 
                    variant="body2" 
                    color={colors.grey[100]}
                    sx={{ fontWeight: 500 }}
                  >
                    {condition.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Add New Condition Section */}
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={showAddForm ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowAddForm(!showAddForm)}
            sx={{ 
              color: colors.greenAccent[400],
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Добавить новое состояние
          </Button>
          
          <Collapse in={showAddForm}>
            <Paper sx={{ 
              mt: 2, 
              p: 3, 
              backgroundColor: colors.primary[500],
              border: `1px solid ${colors.grey[600]}`
            }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Название"
                    value={newCondition.name}
                    onChange={(e) => setNewCondition(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: colors.grey[100]
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.grey[300]
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: colors.grey[600]
                        },
                        '&:hover fieldset': {
                          borderColor: colors.grey[500]
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.blueAccent[400]
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Короткое название"
                    value={newCondition.shortName}
                    onChange={(e) => setNewCondition(prev => ({ 
                      ...prev, 
                      shortName: e.target.value 
                    }))}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: colors.grey[100]
                      },
                      '& .MuiInputLabel-root': {
                        color: colors.grey[300]
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: colors.grey[600]
                        },
                        '&:hover fieldset': {
                          borderColor: colors.grey[500]
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.blueAccent[400]
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color={colors.grey[300]} sx={{ mb: 1 }}>
                    Цвет
                  </Typography>
                  <ColorPicker
                    value={newCondition.color}
                    onChange={(color) => setNewCondition(prev => ({ 
                      ...prev, 
                      color 
                    }))}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCondition}
                    disabled={!newCondition.name || !newCondition.color}
                    sx={{
                      backgroundColor: colors.greenAccent[600],
                      color: colors.grey[100],
                      '&:hover': {
                        backgroundColor: colors.greenAccent[700]
                      },
                      '&:disabled': {
                        backgroundColor: colors.grey[700],
                        color: colors.grey[500]
                      }
                    }}
                  >
                    Сохранить
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
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