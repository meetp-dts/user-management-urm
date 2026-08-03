import { Box } from '@mui/material';
import { ThemeStudio } from 'omnieye-theme-studio';

export function SettingsPage() {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <ThemeStudio />
    </Box>
  );
}
