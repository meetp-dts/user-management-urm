import { useState } from 'react';
import { Box, Typography, Stack, Card, CardActionArea, CardContent } from '@mui/material';
import { Group, Business } from '@mui/icons-material';
import type { Page } from './App';

function countRows(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown[]).length : 0;
  } catch {
    return 0;
  }
}

function StatCard({
  label,
  value,
  color,
  Icon,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  Icon: typeof Group;
  onClick: () => void;
}) {
  return (
    <Card sx={{ minWidth: 200 }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Icon sx={{ color, fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>{value}</Typography>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function DashboardPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [userCount] = useState(() => countRows('user-management-users'));
  const [departmentCount] = useState(() => countRows('user-management-departments'));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ color: '#3b82f6', mb: 2 }}>
        Dashboard
      </Typography>
      <Stack direction="row" spacing={2}>
        <StatCard label="Total Users" value={userCount} color="#a855f7" Icon={Group} onClick={() => onNavigate('users')} />
        <StatCard label="Total Departments" value={departmentCount} color="#ec4899" Icon={Business} onClick={() => onNavigate('department')} />
      </Stack>
    </Box>
  );
}
