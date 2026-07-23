import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { People, Add, InfoOutlined, Close } from '@mui/icons-material';
import { URMViewer } from 'dts-universal-report-module';

type UserRow = Record<string, unknown>;

const STORAGE_KEY = 'user-management-users';

const FIELDS = [
  'user_id',
  'full_name',
  'username',
  'email',
  'phone_number',
  'department',
  'role',
  'status',
  'continent',
  'country',
  'state_province',
];

function loadUsers(): UserRow[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as UserRow[];
  } catch {
    return [];
  }
}

function emptyForm(): Record<string, string> {
  return Object.fromEntries(FIELDS.map((key) => [key, '']));
}

export function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>(loadUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const handleOpenDialog = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const handleAddUser = () => {
    const newRow: UserRow = { ...form };
    if (!newRow.user_id) {
      newRow.user_id = `USR-${String(rows.length + 1).padStart(4, '0')}`;
    }
    setRows((prev) => [newRow, ...prev]);
    setDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <People sx={{ color: '#f59e0b' }} />
            <Typography variant="h5" fontWeight={600} sx={{ color: '#f59e0b' }}>
              Users
            </Typography>
            <InfoOutlined sx={{ fontSize: 18, color: 'text.disabled' }} />
          </Stack>
          <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={handleOpenDialog}>
            Add user
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, px: 3, pb: 3 }}>
        <URMViewer key={rows.length} data={rows} />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add user
          <IconButton size="small" onClick={() => setDialogOpen(false)}>
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {Object.keys(form).map((key) => (
              <TextField
                key={key}
                label={key}
                size="small"
                fullWidth
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAddUser} variant="contained">
            Add user
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
