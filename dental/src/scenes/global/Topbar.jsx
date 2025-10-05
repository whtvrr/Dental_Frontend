import {Box, IconButton, useTheme, Typography, Menu, MenuItem, Chip, useMediaQuery} from "@mui/material";
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
import MenuIcon from "@mui/icons-material/Menu";

const Topbar = ({ setIsSidebar }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const { user, logout } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
        
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
    <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={isMobile ? 1 : 2}
        sx={{
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? 1 : 0
        }}
    >
        {/* Left side - Mobile menu button + User Info */}
        <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1 }}>
            {/* Mobile hamburger menu */}
            {isMobile && (
                <IconButton
                    onClick={() => {
                        console.log('Menu button clicked'); // Debug log
                        setIsSidebar && setIsSidebar(prev => !prev);
                    }}
                    sx={{
                        color: colors.grey[100],
                        p: 1,
                        zIndex: 1400
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* User Info */}
            {user && (
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{
                        flex: isMobile ? 1 : 'none',
                        minWidth: 0 // Allow text truncation
                    }}
                >
                    <Typography
                        variant={isMobile ? "body2" : "body2"}
                        color={colors.grey[100]}
                        fontWeight="bold"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: isMobile ? '120px' : 'none'
                        }}
                    >
                        {user.fullName}
                    </Typography>
                    <Chip
                        label={translateRole(user.role)}
                        size="small"
                        sx={{
                            backgroundColor: getRoleColor(user.role),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.6rem' : '0.7rem',
                            height: isMobile ? '20px' : '24px'
                        }}
                    />
                </Box>
            )}
        </Box>

        {/* Right side - Action buttons */}
        <Box display="flex" alignItems="center" gap={isMobile ? 0.5 : 1}>
            <IconButton
                onClick={colorMode.toggleColorMode}
                sx={{ p: isMobile ? 0.5 : 1 }}
            >
                {theme.palette.mode === 'dark' ? (
                    <DarkModeOutlinedIcon/>
                ) : (
                    <LightModeOutlinedIcon/>
                )}
            </IconButton>

            {!isMobile && (
                <>
                    <IconButton sx={{ p: 1 }}>
                        <NotificationsOutlinedIcon />
                    </IconButton>

                    <IconButton sx={{ p: 1 }}>
                        <SettingsOutlinedIcon/>
                    </IconButton>
                </>
            )}

            <IconButton
                onClick={handleMenuOpen}
                sx={{ p: isMobile ? 0.5 : 1 }}
            >
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

