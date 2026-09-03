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
  Snackbar,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { People, Add, InfoOutlined, Close } from '@mui/icons-material';
import { URMViewer, type View, type ReportPermissions } from 'dts-universal-report-module';
import seedUsers from './data/users-1000.json';

type UserRow = Record<string, unknown>;

const STORAGE_KEY = 'user-management-users-new';
const VIEWS_STORAGE_KEY = 'user-management-views';
const CURRENT_USER_ID = 'user-ea'; // Hardcoded for demo; replace with real auth

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
  'title',
  'territory',
];

function loadUsers(): UserRow[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedUsers as UserRow[];
  try {
    const parsed = JSON.parse(raw) as UserRow[];
    return parsed.length >= seedUsers.length ? parsed : (seedUsers as UserRow[]);
  } catch {
    return seedUsers as UserRow[];
  }
}

function loadViews(): View[] {
  const raw = localStorage.getItem(VIEWS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as View[];
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
  const [views, setViews] = useState<View[]>(loadViews);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'info' }>({
    open: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(views));
  }, [views]);

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

  const handleViewsChange = (updatedViews: View[], activeViewId: string) => {
    setViews(updatedViews);
    console.log('=== View Content Callback ===');
    console.log('Active View ID:', activeViewId);
    console.log('Total Views:', updatedViews.length);
    updatedViews.forEach((view) => {
      console.log(`View: "${view.name}"`, {
        id: view.id,
        snapshot: {
          filters: view.snapshot.filters,
          sortStack: view.snapshot.sortStack,
          columnVisibility: view.snapshot.columnVisibility,
          columnOrder: view.snapshot.columnOrder,
          grouping: view.snapshot.grouping,
        },
      });
    });
    console.log('→ Store this in your DB/CMS');
  };

  const permissions: ReportPermissions = {
    owner: CURRENT_USER_ID,
    editors: [],
    viewers: [],
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: (theme) => `${theme.tokens?.edgePad ?? 24}px`, pt: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <People sx={{ color: '#22c55e' }} />
            <Typography variant="h5" fontWeight={600} sx={{ color: '#22c55e' }}>
              Users
            </Typography>
            <Tooltip title="Manage user records: add, search, filter, sort, and export.">
              <InfoOutlined sx={{ fontSize: 18, color: 'text.disabled' }} />
            </Tooltip>
          </Stack>
          <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={handleOpenDialog}>
            Add user
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, px: (theme) => `${theme.tokens?.edgePad ?? 24}px`, pb: (theme) => `${theme.tokens?.edgePad ?? 24}px` }}>
        <URMViewer
          reportId="users-report"
          data={rows}
          config={{
            enablePresets: true,
            onSelectionChange: (selectedRows) => {
              console.log('Selected users:', selectedRows);
            },
            jsonGuideContent: (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    User Data Format
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload an array of user objects. Each object represents one user in the system.
                  </Typography>
                </div>

                <Divider />

                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Required Fields
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="user_id"
                        secondary="Unique identifier (auto-generated if not provided, format: USR-XXXX)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="full_name"
                        secondary="User's full name (string, required)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="email"
                        secondary="Valid email address (required, should be unique)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="username"
                        secondary="Login username (string, required)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="department"
                        secondary="Department name (e.g., Engineering, Sales, HR)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="role"
                        secondary="User role (e.g., Admin, Manager, User, Viewer)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="status"
                        secondary="Status (Active, Inactive, or Suspended)"
                      />
                    </ListItem>
                  </List>
                </div>

                <Divider />

                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Optional Fields
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    phone_number, country, state_province, continent, title, territory
                  </Typography>
                </div>

                <Divider />

                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Sample Data
                  </Typography>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <code style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', display: 'block' }}>
{`[
  {
    "user_id": "USR-0012312301",
    "full_name": "Jane Doe",
    "username": "jane.doe",
    "email": "jane.doe@company.com",
    "phone_number": "+1-555-0101",
    "department": "Engineering",
    "role": "Manager",
    "status": "Active",
    "country": "United States",
    "continent": "North America",
    "title": "Engineering Manager"
  }
]`}
                    </code>
                  </Paper>
                </div>
              </Box>
            ),
          }}
          viewPersistenceConfig={{
            mode: 'local',
            onViewsChange: handleViewsChange,
          }}
          permissions={permissions}
        />
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.type} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
