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
  Fab,
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

const Complaints = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const api = useApi();
  
  const [complaintsData, setComplaintsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  
  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
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
      field: "category",
      headerName: "Категория",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Описание",
      flex: 1.5,
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
      field: "created_at",
      headerName: "Дата создания",
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

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/complaints?offset=${offset}&limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data?.complaints) {
          setComplaintsData(data.data.complaints);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [offset]);

  const handleAdd = () => {
    setDialogMode('add');
    setFormData({ title: '', description: '', category: '' });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEdit = (complaint) => {
    setDialogMode('edit');
    setSelectedComplaint(complaint);
    setFormData({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleDeleteClick = (complaint) => {
    setSelectedComplaint(complaint);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedComplaint(null);
    setFormData({ title: '', description: '', category: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Название обязательно';
    if (!formData.description.trim()) errors.description = 'Описание обязательно';
    if (!formData.category.trim()) errors.category = 'Категория обязательна';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let response;
      if (dialogMode === 'add') {
        response = await api.post('/complaints', formData);
      } else {
        response = await api.put(`/complaints/${selectedComplaint.id}`, formData);
      }

      if (response.ok) {
        await fetchComplaints();
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
      const response = await api.delete(`/complaints/${selectedComplaint.id}`);
      
      if (response.ok) {
        await fetchComplaints();
        setDeleteConfirmOpen(false);
        setSelectedComplaint(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Удаление не удалось');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
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
          title="ЖАЛОБЫ"
          subtitle="Управление жалобами пациентов"
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
          Добавить жалобу
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box
        height="75vh"
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
            rows={complaintsData}
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
            backgroundColor: colors.primary[400],
            color: colors.grey[100]
          }
        }}
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Добавить жалобу' : 'Редактировать жалобу'}
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
          <TextField
            margin="dense"
            label="Категория"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.category}
            onChange={handleInputChange('category')}
            error={!!formErrors.category}
            helperText={formErrors.category}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[400],
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
          <TextField
            margin="dense"
            label="Описание"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange('description')}
            error={!!formErrors.description}
            helperText={formErrors.description}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[400],
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
            backgroundColor: colors.primary[400],
            color: colors.grey[100]
          }
        }}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить жалобу "{selectedComplaint?.title}"?
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

export default Complaints;