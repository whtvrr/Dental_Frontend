import { Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box mb={isMobile ? "20px" : "30px"}>
      <Typography
        variant={isMobile ? "h3" : "h2"}
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{
          m: "0 0 5px 0",
          fontSize: isMobile ? '1.5rem' : undefined,
          lineHeight: isMobile ? 1.2 : undefined
        }}
      >
        {title}
      </Typography>
      <Typography
        variant={isMobile ? "h6" : "h5"}
        color={colors.greenAccent[400]}
        sx={{
          fontSize: isMobile ? '0.9rem' : undefined
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;