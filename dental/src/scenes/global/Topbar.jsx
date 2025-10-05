import {Box, IconButton, useTheme, Typography, Menu, MenuItem, Chip} from "@mui/material";
import {useContext, useState} from "react";
import {useLocation} from "react-router-dom";
import {ColorModeContext, tokens} from "../../theme";
import {AuthContext} from "../../context/AuthContext";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";

const Topbar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const { user, logout } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const location = useLocation();

    // Pages where search bar should be hidden
    const hideSearchBarPages = ['/', '/registration', '/faq', '/calendar'];
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    const handleLogout = () => {
        logout();
        handleMenuClose();
    };
    
    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': return colors.redAccent[500];
            case 'doctor': return colors.blueAccent[500];
            case 'receptionist': return colors.greenAccent[500];
            default: return colors.grey[500];
        }
    };

    const translateRole = (role) => {
        switch(role) {
            case 'admin': return 'Администратор';
            case 'doctor': return 'Врач';
            case 'receptionist': return 'Регистратор';
            default: return role.charAt(0).toUpperCase() + role.slice(1);
        }
    };

    return (
    <Box display="flex" justifyContent={hideSearchBarPages.includes(location.pathname) ? "flex-end" : "space-between"} p={2}>
    {/* Search Bar - Hidden on specific pages */}
    {!hideSearchBarPages.includes(location.pathname) && (
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
        >
          <InputBase sx = {{ml: 2, flex:1}} placeholder = "Поиск"/>
          <IconButton type = "button" sx = {{p:1}}>
            <SearchIcon/>
          </IconButton>
        </Box>
    )}
        {/* ICONS */}
    <Box display="flex" alignItems="center" gap={1}>
        {/* User Info */}
        {user && (
            <Box display="flex" alignItems="center" gap={1} mr={2}>
                <Typography variant="body2" color={colors.grey[100]} fontWeight="bold">
                    {user.fullName}
                </Typography>
                <Chip 
                    label={translateRole(user.role)}
                    size="small"
                    sx={{
                        backgroundColor: getRoleColor(user.role),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                    }}
                />
            </Box>
        )}
        
        <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === 'dark' ?(
                <DarkModeOutlinedIcon/>
            ) : ( 
            <LightModeOutlinedIcon/>
            )}
        </IconButton>

        <IconButton>
            <NotificationsOutlinedIcon />
        </IconButton>
        
        <IconButton>
            <SettingsOutlinedIcon/>
        </IconButton>
        
        <IconButton onClick={handleMenuOpen}>
            <PersonOutlinedIcon/>
        </IconButton>
        
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
                sx: {
                    backgroundColor: colors.primary[400],
                    border: `1px solid ${colors.grey[700]}`,
                    borderRadius: '8px',
                    mt: 1
                }
            }}
        >
            <MenuItem onClick={handleLogout} sx={{ color: colors.grey[100] }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2">Выйти</Typography>
            </MenuItem>
        </Menu>
    </Box>
    </Box>);
};

export default Topbar;

