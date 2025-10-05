import { Box, useTheme, CircularProgress, Alert, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ruRU } from '@mui/x-date-pickers/locales';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Header from "../../components/Header";
import { useApi } from "../../hooks/useApi";
import API_CONFIG from "../../config/api";
import { translations, translateGender } from "../../utils/translations";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const api = useApi();
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    gender: '',
    birth_date: '',
  });

  const formatDate = (dateString) => {
    if (!dateString) return translations.notSpecified;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setEditFormData({
      full_name: client.full_name || '',
      phone_number: client.phone_number || '',
      address: client.address || '',
      gender: client.gender || '',
      birth_date: client.birth_date ? dayjs(client.birth_date) : null,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const formattedData = {
        ...editFormData,
        birth_date: editFormData.birth_date
          ? editFormData.birth_date.format('DD.MM.YYYY')
          : null
      };

      const response = await api.put(
        `${API_CONFIG.ENDPOINTS.USERS.BASE}/${selectedClient.id}`,
        formattedData
      );

      if (response.ok) {
        setEditDialogOpen(false);
        fetchClients();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update client');
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to update client:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(
        `${API_CONFIG.ENDPOINTS.USERS.BASE}/${selectedClient.id}`
      );

      if (response.ok) {
        setDeleteDialogOpen(false);
        fetchClients();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete client');
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete client:', err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "full_name",
      headerName: translations.fullName,
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone_number",
      headerName: translations.phoneNumber,
      flex: 1,
    },
    {
      field: "address",
      headerName: translations.address,
      flex: 1,
    },
    {
      field: "gender",
      headerName: translations.gender,
      flex: 0.5,
      renderCell: ({ row: { gender } }) => {
        return (
          <Chip
            label={translateGender(gender)}
            color={gender === 'male' ? 'primary' : gender === 'female' ? 'secondary' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: "birth_date",
      headerName: translations.birthDate,
      flex: 1,
      renderCell: ({ row: { birth_date } }) => formatDate(birth_date),
    },
    {
      field: "actions",
      headerName: translations.actions,
      flex: 0.5,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap="8px">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row);
            }}
            sx={{ color: colors.greenAccent[400] }}
          >
            <EditOutlinedIcon />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            sx={{ color: colors.redAccent[400] }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.USERS.CLIENTS}?offset=${offset}&limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data?.clients) {
          setClientsData(data.data.clients);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const handleRowClick = (params) => {
    navigate(`/clients/${params.id}`);
  };

  return (
    <Box m="20px">
      <Header
        title={translations.contactsTitle}
        subtitle={translations.contactsSubtitle}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {translations.error}: {error}
        </Alert>
      )}
      
      <Box
        m="40px 0 0 0"
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={clientsData}
            columns={columns}
            getRowId={(row) => row.id}
            onRowClick={handleRowClick}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: colors.primary[300] + '20',
                },
              },
            }}
          />
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400] }}>{translations.editClientTitle}</DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400], pt: 2 }}>
          <TextField
            fullWidth
            label={translations.fullName}
            value={editFormData.full_name}
            onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={translations.phoneNumber}
            value={editFormData.phone_number}
            onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={translations.address}
            value={editFormData.address}
            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            margin="normal"
          />
          <FormControl component="fieldset" margin="normal" fullWidth>
            <FormLabel component="legend" sx={{ color: colors.grey[100] }}>{translations.gender}</FormLabel>
            <RadioGroup
              row
              value={editFormData.gender}
              onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
            >
              <FormControlLabel value="male" control={<Radio />} label={translations.male} />
              <FormControlLabel value="female" control={<Radio />} label={translations.female} />
            </RadioGroup>
          </FormControl>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="ru"
            localeText={ruRU.components.MuiLocalizationProvider.defaultProps.localeText}
          >
            <DatePicker
              label={translations.birthDate}
              value={editFormData.birth_date}
              onChange={(newValue) => setEditFormData({ ...editFormData, birth_date: newValue })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal"
                }
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: colors.grey[100] }}>
            {translations.cancel}
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" sx={{ backgroundColor: colors.greenAccent[600] }}>
            {translations.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400] }}>{translations.deleteClientTitle}</DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400], pt: 2 }}>
          <Alert severity="warning">
            {translations.deleteClientConfirm} <strong>{selectedClient?.full_name}</strong>?
            {translations.thisActionCannotBeUndone}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: colors.grey[100] }}>
            {translations.cancel}
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" sx={{ backgroundColor: colors.redAccent[600] }}>
            {translations.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;