import { useState } from 'react';
import { Box, Typography, Stack, Card, CardContent } from '@mui/material';
import { Group, Business } from '@mui/icons-material';

function countRows(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown[]).length : 0;
  } catch {
    return 0;
  }
}

function StatCard({ label, value, color, Icon }: { label: string; value: number; color: string; Icon: typeof Group }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 200 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Icon sx={{ color, fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const [userCount] = useState(() => countRows('user-management-users'));
  const [departmentCount] = useState(() => countRows('user-management-departments'));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ color: '#3b82f6', mb: 2 }}>
        Dashboard
      </Typography>
      <Stack direction="row" spacing={2}>
        <StatCard label="Total Users" value={userCount} color="#3b82f6" Icon={Group} />
        <StatCard label="Total Departments" value={departmentCount} color="#ec4899" Icon={Business} />
      </Stack>
    </Box>
  );
}
