import { useMemo, useState } from 'react';
import { Box, Stack, Avatar, IconButton, Typography, Tooltip, ThemeProvider, CssBaseline } from '@mui/material';
import {
  GridView,
  BarChart,
  ChangeHistory,
  AccountTree,
  Person,
  LightMode,
  DarkMode,
  HelpOutline,
  Settings,
  Notifications,
  Business,
  People,
} from '@mui/icons-material';
import { useThemeStore, buildMuiTheme } from 'omnieye-theme-studio';
import { UsersPage } from './UsersPage';
import { DepartmentPage } from './DepartmentPage';
import { DashboardPage } from './DashboardPage';
import { SettingsPage } from './SettingsPage';

export type Page = 'dashboard' | 'department' | 'users' | 'settings';

const SIDEBAR_ICONS: Array<{ Icon: typeof GridView; color: string; page: Page | null; label: string }> = [
  { Icon: GridView, color: '#3b82f6', page: 'dashboard', label: 'Dashboard' },
  { Icon: Business, color: '#f59e0b', page: 'department', label: 'Department' },
  { Icon: People, color: '#22c55e', page: 'users', label: 'Users' },
  { Icon: BarChart, color: '#a855f7', page: null, label: 'Analytics' },
  { Icon: ChangeHistory, color: '#ec4899', page: null, label: 'Alerts' },
  { Icon: AccountTree, color: '#64748b', page: 'settings', label: 'Theme Studio' },
];

function Header({ mode, onToggleMode }: { mode: 'light' | 'dark'; onToggleMode: () => void }) {
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
        position: 'relative',
        zIndex: 1,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -24,
          height: 24,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
          pointerEvents: 'none',
        },
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
        <IconButton size="small" onClick={onToggleMode}>
          {mode === 'dark' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
        </IconButton>
        <IconButton size="small"><HelpOutline fontSize="small" /></IconButton>
        <IconButton size="small"><Settings fontSize="small" /></IconButton>
        <IconButton size="small"><Notifications fontSize="small" /></IconButton>
      </Stack>
    </Box>
  );
}

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        height: 32,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">Ready</Typography>
      <Typography variant="caption" color="text.secondary">OmniEye · v1.0</Typography>
    </Box>
  );
}

function SideRail({ activePage, onNavigate }: { activePage: Page; onNavigate: (page: Page) => void }) {
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
      {SIDEBAR_ICONS.map(({ Icon, color, page, label }, i) => {
        const button = (
          <IconButton
            size="small"
            onClick={page ? () => onNavigate(page) : undefined}
            sx={page && activePage === page ? { bgcolor: `${color}22` } : undefined}
          >
            <Icon sx={{ color }} />
          </IconButton>
        );
        return page ? (
          <Tooltip key={i} title={label} placement="right">
            {button}
          </Tooltip>
        ) : (
          <Box key={i}>{button}</Box>
        );
      })}
      <Box sx={{ flex: 1 }} />
      <IconButton size="small">
        <Person sx={{ color: '#3b82f6' }} />
      </IconButton>
      <Avatar sx={{ bgcolor: '#22c55e', width: 32, height: 32, fontSize: '0.75rem', mt: 0.5 }}>EA</Avatar>
    </Box>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const themeSettings = useThemeStore((s) => s.settings);
  const setThemeSettings = useThemeStore((s) => s.set);
  const theme = useMemo(() => buildMuiTheme(themeSettings), [themeSettings]);
  const toggleMode = () => setThemeSettings({ mode: themeSettings.mode === 'dark' ? 'light' : 'dark' });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header mode={themeSettings.mode} onToggleMode={toggleMode} />
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <SideRail activePage={activePage} onNavigate={setActivePage} />
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
            {activePage === 'dashboard' && <DashboardPage onNavigate={setActivePage} />}
            {activePage === 'department' && <DepartmentPage />}
            {activePage === 'users' && <UsersPage />}
            {activePage === 'settings' && <SettingsPage />}
          </Box>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
