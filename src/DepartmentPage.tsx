import { useEffect, useState } from 'react';
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
  Tooltip,
} from '@mui/material';
import { Business, Add, InfoOutlined, Close } from '@mui/icons-material';
import { URMViewer } from 'dts-universal-report-module';
import seedDepartments from './data/departments-seed.json';

type DepartmentRow = Record<string, unknown>;

const STORAGE_KEY = 'user-management-departments-new';

const FIELDS = ['dept_id', 'name', 'division', 'head', 'employee_count', 'location', 'status'];

function loadDepartments(): DepartmentRow[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedDepartments as DepartmentRow[];
  try {
    const parsed = JSON.parse(raw) as DepartmentRow[];
    return parsed.length >= seedDepartments.length ? parsed : (seedDepartments as DepartmentRow[]);
  } catch {
    return seedDepartments as DepartmentRow[];
  }
}

function emptyForm(): Record<string, string> {
  return Object.fromEntries(FIELDS.map((key) => [key, '']));
}

export function DepartmentPage() {
  const [rows, setRows] = useState<DepartmentRow[]>(loadDepartments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const handleOpenDialog = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const handleAddDepartment = () => {
    const newRow: DepartmentRow = { ...form };
    if (!newRow.dept_id) {
      newRow.dept_id = `DPT-${String(rows.length + 1).padStart(4, '0')}`;
    }
    setRows((prev) => [newRow, ...prev]);
    setDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Business sx={{ color: '#f59e0b' }} />
            <Typography variant="h5" fontWeight={600} sx={{ color: '#f59e0b' }}>
              Department
            </Typography>
            <Tooltip title="Manage department records: add, search, filter, sort, and export.">
              <InfoOutlined sx={{ fontSize: 18, color: 'text.disabled' }} />
            </Tooltip>
          </Stack>
          <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={handleOpenDialog}>
            Add department
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, px: 3, pb: 3 }}>
        <URMViewer key={rows.length} data={rows} />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add department
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
          <Button onClick={handleAddDepartment} variant="contained">
            Add department
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
