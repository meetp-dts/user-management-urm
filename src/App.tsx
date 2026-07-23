import React from 'react';
import { Box, Stack, Avatar, IconButton, Typography, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import {
  GridView,
  TableChart,
  Folder,
  BarChart,
  ChangeHistory,
  AccountTree,
  Person,
  LightMode,
  HelpOutline,
  Settings,
  Notifications,
} from '@mui/icons-material';
import { UsersPage } from './UsersPage';

const theme = createTheme({
  palette: {
    primary: { main: '#3b5bfd' },
    background: { default: '#f5f6f8' },
  },
  shape: { borderRadius: 8 },
});

const SIDEBAR_ICONS = [
  { Icon: GridView, color: '#3b82f6' },
  { Icon: TableChart, color: '#22c55e' },
  { Icon: Folder, color: '#f59e0b' },
  { Icon: BarChart, color: '#a855f7' },
  { Icon: ChangeHistory, color: '#ec4899' },
];

function Header() {
  return (
    <Box
      component="header"
      sx={{
        height: 56,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700 }}>
          OE
        </Avatar>
        <Typography variant="h6" fontWeight={700}>
          OmniEye
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="small"><LightMode fontSize="small" /></IconButton>
        <IconButton size="small"><HelpOutline fontSize="small" /></IconButton>
        <IconButton size="small"><Settings fontSize="small" /></IconButton>
        <IconButton size="small"><Notifications fontSize="small" /></IconButton>
      </Stack>
    </Box>
  );
}

function SideRail() {
  return (
    <Box
      component="nav"
      sx={{
        width: 56,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        gap: 1,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {SIDEBAR_ICONS.map(({ Icon, color }, i) => (
        <IconButton key={i} size="small">
          <Icon sx={{ color }} />
        </IconButton>
      ))}
      <Box sx={{ flex: 1 }} />
      <IconButton size="small">
        <AccountTree sx={{ color: '#eab308' }} />
      </IconButton>
      <IconButton size="small">
        <Person sx={{ color: '#3b82f6' }} />
      </IconButton>
      <Avatar sx={{ bgcolor: '#22c55e', width: 32, height: 32, fontSize: '0.75rem', mt: 0.5 }}>EA</Avatar>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header />
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <SideRail />
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
            <UsersPage />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
