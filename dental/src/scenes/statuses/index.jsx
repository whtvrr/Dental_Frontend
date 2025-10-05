import { 
  Box, 
  useTheme, 
  CircularProgress, 
  Alert, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tooltip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useApi } from "../../hooks/useApi";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const Statuses = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const api = useApi();
  
  const [statusesData, setStatusesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    color: '#4cceac',
    type: 'diagnosis',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});

  const statusTypes = [
    { value: '', label: 'Все', endpoint: '/statuses' },
    { value: 'diagnosis', label: 'Диагноз', endpoint: '/statuses/diagnosis' },
    { value: 'treatment', label: 'Лечение', endpoint: '/statuses/treatment' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'diagnosis': return colors.blueAccent[500];
      case 'treatment': return colors.greenAccent[500];
      default: return colors.grey[500];
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'diagnosis': return 'Диагноз';
      case 'treatment': return 'Лечение';
      default: return type;
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "title",
      headerName: "Название",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "type",
      headerName: "Тип",
      flex: 0.8,
      renderCell: ({ value }) => (
        <Chip
          label={getTypeLabel(value)}
          size="small"
          sx={{
            backgroundColor: getTypeColor(value),
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      ),
    },
    {
      field: "code",
      headerName: "Код",
      flex: 0.6,
    },
    {
      field: "description",
      headerName: "Описание",
      flex: 1.2,
      renderCell: ({ value }) => (
        <Tooltip title={value || ''} arrow>
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block'
          }}>
            {value}
          </span>
        </Tooltip>
      ),
    },
    {
      field: "color",
      headerName: "Цвет",
      flex: 0.6,
      renderCell: ({ value }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            width={20}
            height={20}
            borderRadius="50%"
            bgcolor={value}
            border={`1px solid ${colors.grey[300]}`}
          />
          <span>{value}</span>
        </Box>
      ),
    },
    {
      field: "is_active",
      headerName: "Активен",
      flex: 0.6,
      renderCell: ({ value }) => (
        <Chip
          label={value ? 'Да' : 'Нет'}
          size="small"
          color={value ? 'success' : 'default'}
          variant={value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: "created_at",
      headerName: "Создан",
      flex: 1,
      renderCell: ({ value }) => formatDate(value),
    },
    {
      field: "actions",
      headerName: "Действия",
      flex: 0.8,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => handleEdit(row)}
            sx={{ color: colors.blueAccent[400] }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(row)}
            sx={{ color: colors.redAccent[400] }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchStatuses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = statusTypes[currentTab].endpoint;
      const response = await api.get(`${endpoint}?offset=${offset}&limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data?.statuses) {
          setStatusesData(data.data.statuses || []);
        } else {
          setStatusesData([]);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [offset, currentTab]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setOffset(0);
  };

  const handleAdd = () => {
    setDialogMode('add');
    const defaultType = statusTypes[currentTab].value || 'diagnosis';
    setFormData({ 
      title: '', 
      description: '', 
      code: '', 
      color: '#4cceac',
      type: defaultType,
      is_active: true 
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEdit = (status) => {
    setDialogMode('edit');
    setSelectedStatus(status);
    setFormData({
      title: status.title,
      description: status.description,
      code: status.code,
      color: status.color,
      type: status.type,
      is_active: status.is_active
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleDeleteClick = (status) => {
    setSelectedStatus(status);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStatus(null);
    setFormData({ 
      title: '', 
      description: '', 
      code: '', 
      color: '#4cceac',
      type: 'diagnosis',
      is_active: true 
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Название обязательно';
    if (!formData.description.trim()) errors.description = 'Описание обязательно';
    if (!formData.code.trim()) errors.code = 'Код обязателен';
    if (!formData.color.trim()) errors.color = 'Цвет обязателен';
    if (!formData.type.trim()) errors.type = 'Тип обязателен';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let response;
      if (dialogMode === 'add') {
        response = await api.post('/statuses', formData);
      } else {
        response = await api.put(`/statuses/${selectedStatus.id}`, formData);
      }

      if (response.ok) {
        await fetchStatuses();
        handleCloseDialog();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Операция не удалась');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/statuses/${selectedStatus.id}`);
      
      if (response.ok) {
        await fetchStatuses();
        setDeleteConfirmOpen(false);
        setSelectedStatus(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Удаление не удалось');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'is_active' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header
          title="СТАТУСЫ"
          subtitle="Управление статусами диагнозов, лечения и зубов"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            backgroundColor: colors.greenAccent[600],
            '&:hover': {
              backgroundColor: colors.greenAccent[700],
            },
          }}
        >
          Добавить статус
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs for filtering by type */}
      <Box mb="20px">
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: colors.greenAccent[500],
            },
            '& .MuiTab-root': {
              color: colors.grey[100],
              '&.Mui-selected': {
                color: colors.greenAccent[500],
              },
            },
          }}
        >
          {statusTypes.map((type, index) => (
            <Tab key={index} label={type.label} />
          ))}
        </Tabs>
      </Box>
      
      <Box
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={statusesData}
            columns={columns}
            getRowId={(row) => row.id}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: colors.primary[300] + '20',
              },
            }}
          />
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[500],
            color: colors.grey[100]
          }
        }}
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Добавить статус' : 'Редактировать статус'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleInputChange('title')}
            error={!!formErrors.title}
            helperText={formErrors.title}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[400],
                color: colors.grey[100],
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.grey[100],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.greenAccent[500],
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.grey[100],
              },
            }}
          />
          
          <FormControl
            fullWidth
            margin="dense"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[400],
                color: colors.grey[100],
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.grey[100],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.greenAccent[500],
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.grey[100],
              },
            }}
          >
            <InputLabel>Тип</InputLabel>
            <Select
              value={formData.type}
              onChange={handleInputChange('type')}
              error={!!formErrors.type}
              label="Тип"
            >
              <MenuItem value="diagnosis">Диагноз</MenuItem>
              <MenuItem value="treatment">Лечение</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Код"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.code}
            onChange={handleInputChange('code')}
            error={!!formErrors.code}
            helperText={formErrors.code}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[400],
                color: colors.grey[100],
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.grey[100],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.greenAccent[500],
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.grey[100],
              },
            }}
          />

          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Цвет"
              type="color"
              value={formData.color}
              onChange={handleInputChange('color')}
              error={!!formErrors.color}
              helperText={formErrors.color}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.primary[400],
                  color: colors.grey[100],
                  '& fieldset': {
                    borderColor: colors.grey[300],
                  },
                  '&:hover fieldset': {
                    borderColor: colors.grey[100],
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.greenAccent[500],
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.grey[100],
                },
              }}
            />
            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleInputChange('is_active')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: colors.greenAccent[500],
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: colors.greenAccent[500],
                      },
                    }}
                  />
                }
                label="Активен"
                sx={{ color: colors.grey[100] }}
              />
            </Box>
          </Box>

          <TextField
            margin="dense"
            label="Описание"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange('description')}
            error={!!formErrors.description}
            helperText={formErrors.description}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[400],
                color: colors.grey[100],
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.grey[100],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.greenAccent[500],
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.grey[100],
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: colors.grey[100] }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit}
            sx={{ 
              color: colors.greenAccent[500],
              '&:hover': {
                backgroundColor: colors.greenAccent[500] + '20',
              },
            }}
          >
            {dialogMode === 'add' ? 'Добавить' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[500],
            color: colors.grey[100]
          }
        }}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить статус "{selectedStatus?.title}"?
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ color: colors.grey[100] }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDelete}
            sx={{ 
              color: colors.redAccent[500],
              '&:hover': {
                backgroundColor: colors.redAccent[500] + '20',
              },
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Statuses;