import { Box, Typography, useTheme, CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Header from "../../components/Header";
import { useApi } from "../../hooks/useApi";
import API_CONFIG from "../../config/api";
import { translations, translateRole } from "../../utils/translations";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const api = useApi();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: '',
  });

  const handleEditClick = (staff) => {
    setSelectedStaff(staff);
    setEditFormData({
      full_name: staff.full_name || '',
      email: staff.email || '',
      phone_number: staff.phone_number || '',
      role: staff.role || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await api.put(
        `${API_CONFIG.ENDPOINTS.USERS.BASE}/${selectedStaff.id}`,
        editFormData
      );

      if (response.ok) {
        setEditDialogOpen(false);
        fetchStaff();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update staff member');
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to update staff member:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(
        `${API_CONFIG.ENDPOINTS.USERS.BASE}/${selectedStaff.id}`
      );

      if (response.ok) {
        setDeleteDialogOpen(false);
        fetchStaff();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete staff member');
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete staff member:', err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "full_name",
      headerName: translations.fullName,
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: translations.email,
      flex: 1,
    },
    {
      field: "phone_number",
      headerName: translations.phoneNumber,
      flex: 1,
    },
    {
      field: "role",
      headerName: translations.role,
      flex: 1,
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === "admin"
                ? colors.greenAccent[600]
                : role === "doctor"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {role === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {role === "doctor" && <SecurityOutlinedIcon />}
            {role === "receptionist" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {translateRole(role)}
            </Typography>
          </Box>
        );
      },
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

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.USERS.STAFF}?offset=${offset}&limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data?.staff) {
          setStaffData(data.data.staff);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  return (
    <Box m="20px">
      <Header title={translations.teamTitle} subtitle={translations.teamSubtitle} />

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
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={staffData}
            columns={columns}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
          />
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400] }}>{translations.editStaffTitle}</DialogTitle>
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
            label={translations.email}
            value={editFormData.email}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
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
            select
            label={translations.role}
            value={editFormData.role}
            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
            margin="normal"
          >
            <MenuItem value="admin">{translations.admin}</MenuItem>
            <MenuItem value="doctor">{translations.doctor}</MenuItem>
            <MenuItem value="receptionist">{translations.receptionist}</MenuItem>
          </TextField>
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
        <DialogTitle sx={{ backgroundColor: colors.primary[400] }}>{translations.deleteStaffTitle}</DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400], pt: 2 }}>
          <Alert severity="warning">
            {translations.deleteStaffConfirm} <strong>{selectedStaff?.full_name}</strong>?
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

export default Team;