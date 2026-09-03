import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import { Newspaper, InfoOutlined, Storage } from '@mui/icons-material';
import { URMProvider, URMViewerRaw } from 'dts-universal-report-module';
import type { View, ScheduledReport, SchedulerExportPayload } from 'dts-universal-report-module';

type PostRow = Record<string, unknown>;

const API_BASE = 'https://dummyjson.com/posts';
const PAGE_SIZE_DEFAULT = 15;
const REPORT_ID = 'dummy-posts-report';

// ── Simulated third-party host database ────────────────────────────────────
// Stands in for a real backend (Postgres/Mongo/whatever the host already runs).
// URM never touches this directly — it only ever sees `views`/`activeViewId`
// via the `viewPersistence` prop and reports changes back through
// `onViewsChange`. Storing it under a key of our own (not URM's internal
// `urm_report_${reportId}` key) proves the two are fully decoupled: clearing
// `urm_report_*` would not lose these views, because URM's own localStorage
// path is never hit in 'api' mode.
const HOST_DB_VIEWS_KEY = `hostDb:views:${REPORT_ID}`;
const HOST_DB_SCHEDULES_KEY = `hostDb:schedules:${REPORT_ID}`;

function loadViewsFromHostDb(): { views: View[]; activeViewId?: string } | null {
  try {
    const raw = localStorage.getItem(HOST_DB_VIEWS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveViewsToHostDb(views: View[], activeViewId: string) {
  console.log(" === Data === ");
  console.log(" === Data ===> ", views);
  // Real integration: await api.post(`/reports/${REPORT_ID}/views`, { views, activeViewId })
  localStorage.setItem(HOST_DB_VIEWS_KEY, JSON.stringify({ views, activeViewId }));
}

function loadSchedulesFromHostDb(): ScheduledReport[] {
  try {
    const raw = localStorage.getItem(HOST_DB_SCHEDULES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSchedulesToHostDb(schedules: ScheduledReport[]) {
  // Real integration: await api.post(`/reports/${REPORT_ID}/schedules`, { schedules })
  localStorage.setItem(HOST_DB_SCHEDULES_KEY, JSON.stringify(schedules));
}

// Real server pagination — dummyjson takes limit/skip and echoes total in the response.
// Same shape for the search endpoint, so a query just swaps the path and adds `q`.
async function fetchPostsPage(
  page: number,
  pageSize: number,
  query: string,
): Promise<{ rows: PostRow[]; total: number }> {
  const skip = (page - 1) * pageSize;
  const url = query
    ? `${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${pageSize}&skip=${skip}`
    : `${API_BASE}?limit=${pageSize}&skip=${skip}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = (await res.json()) as { posts: PostRow[]; total: number };
  return { rows: json.posts, total: json.total };
}

export function DummyPostsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageRows, setPageRows] = useState<PostRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Views loaded once from the "host database" on mount — this is what gets
  // passed to `viewPersistence.views`. Read once, matching how `viewPersistence`
  // itself only seeds on mount (see CONFIG_GUIDE.md §7).
  const [hostViews] = useState(() => loadViewsFromHostDb());
  const [lastSync, setLastSync] = useState<{ count: number; at: string } | null>(
    hostViews ? { count: hostViews.views.length, at: 'on page load' } : null,
  );

  // Schedules loaded once from the host database
  const [schedules, setSchedules] = useState<ScheduledReport[]>(() => loadSchedulesFromHostDb());
  const [lastScheduleSync, setLastScheduleSync] = useState<{ count: number; at: string } | null>(
    schedules.length > 0 ? { count: schedules.length, at: 'on page load' } : null,
  );

  const handleViewsChange = useCallback((views: View[], activeViewId: string) => {
    saveViewsToHostDb(views, activeViewId);
    setLastSync({ count: views.length, at: new Date().toLocaleTimeString() });
  }, []);

  const handleScheduleCreate = useCallback((schedule: ScheduledReport) => {
    console.log('[SchedulerConfig] onScheduleCreate fired:', schedule);
    const updated = [...schedules, schedule];
    setSchedules(updated);
    saveSchedulesToHostDb(updated);
    setLastScheduleSync({ count: updated.length, at: new Date().toLocaleTimeString() });
  }, [schedules]);

  const handleScheduleUpdate = useCallback((schedule: ScheduledReport) => {
    console.log('[SchedulerConfig] onScheduleUpdate fired:', schedule);
    const updated = schedules.map((s) => (s.id === schedule.id ? schedule : s));
    setSchedules(updated);
    saveSchedulesToHostDb(updated);
    setLastScheduleSync({ count: updated.length, at: new Date().toLocaleTimeString() });
  }, [schedules]);

  const handleScheduleDelete = useCallback((scheduleId: string) => {
    console.log('[SchedulerConfig] onScheduleDelete fired for id:', scheduleId);
    const updated = schedules.filter((s) => s.id !== scheduleId);
    setSchedules(updated);
    saveSchedulesToHostDb(updated);
    setLastScheduleSync({ count: updated.length, at: new Date().toLocaleTimeString() });
  }, [schedules]);

  const handleScheduleToggle = useCallback((scheduleId: string, isActive: boolean) => {
    console.log('[SchedulerConfig] onScheduleToggle fired for id:', scheduleId, 'isActive:', isActive);
    const updated = schedules.map((s) =>
      s.id === scheduleId ? { ...s, isActive } : s,
    );
    setSchedules(updated);
    saveSchedulesToHostDb(updated);
    setLastScheduleSync({ count: updated.length, at: new Date().toLocaleTimeString() });
  }, [schedules]);

  const handleScheduleFire = useCallback((payload: SchedulerExportPayload) => {
    console.log('[SchedulerConfig] onScheduleFire fired:', payload);
    console.log('  → schedule:', payload.schedule);
    console.log('  → rows:', payload.rows.length);
    console.log('  → columns:', payload.columns);
    console.log('  → format:', payload.format);
    console.log('  → reportName:', payload.reportName);
    console.log('  → triggeredAt:', payload.triggeredAt);
    // Real integration: await api.post(`/reports/${REPORT_ID}/schedules/${payload.schedule.id}/run`, payload)
  }, []);

  const viewPersistence = useMemo(
    () => ({
      mode: 'api' as const,
      views: hostViews?.views,
      activeViewId: hostViews?.activeViewId,
      onViewsChange: handleViewsChange,
    }),
    [hostViews, handleViewsChange],
  );

  const scheduler = useMemo(
    () => ({
      mode: 'api' as const,
      schedules,
      onScheduleCreate: handleScheduleCreate,
      onScheduleUpdate: handleScheduleUpdate,
      onScheduleDelete: handleScheduleDelete,
      onScheduleToggle: handleScheduleToggle,
      onScheduleFire: handleScheduleFire,
    }),
    [schedules, handleScheduleCreate, handleScheduleUpdate, handleScheduleDelete, handleScheduleToggle, handleScheduleFire],
  );

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchPostsPage(page, pageSize, searchQuery)
      .then(({ rows, total }) => {
        if (cancelled) return;
        setPageRows(rows);
        setTotalRows(total);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || 'Failed to load posts');
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, searchQuery]);

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: (theme) => `${theme.tokens?.edgePad ?? 24}px`, pt: 2.5, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Newspaper sx={{ color: '#f97316' }} />
          <Typography variant="h5" fontWeight={600} sx={{ color: '#f97316' }}>
            DummyJSON Posts
          </Typography>
          <Tooltip title="Live data from dummyjson.com/posts — real server-side pagination via limit/skip, real server-side search via /posts/search?q=. Grid view configured to 2/3/4-column, host-selectable.">
            <InfoOutlined sx={{ fontSize: 18, color: 'text.disabled' }} />
          </Tooltip>
        </Stack>

        <Paper
          variant="outlined"
          sx={{ mt: 1.5, p: 1.25, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'action.hover' }}
        >
          <Storage sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            <strong>viewPersistence + scheduler demo:</strong> saved views (Views dropdown → Save/Edit/Delete) and schedules
            (Scheduled Reports) are synced to a mock host database instead of URM's own storage. Check devtools Console
            when you create/edit/delete/toggle/fire a schedule to see the callback payloads logged.
          </Typography>
          <Stack direction="row" spacing={1}>
            {lastSync && (
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={`views: ${lastSync.count} · ${lastSync.at}`}
              />
            )}
            {lastScheduleSync && (
              <Chip
                size="small"
                color="info"
                variant="outlined"
                label={`schedules: ${lastScheduleSync.count} · ${lastScheduleSync.at}`}
              />
            )}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, px: (theme) => `${theme.tokens?.edgePad ?? 24}px`, pb: (theme) => `${theme.tokens?.edgePad ?? 24}px` }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : pageRows.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <URMProvider
            mode="viewer"
            reportId={REPORT_ID}
            data={pageRows}
            viewPersistence={viewPersistence}
            scheduler={scheduler}
            config={{
              hideToolbarActions: ['settings', 'filter', 'sort', 'columns', 'jsonGuide'],
              hiddenColumns: [ 'userId', 'reactions'],
              viewOptions: ['list', 'grid'],
              defaultViewMode: 'list',
              hideSelectionCheckboxes: true,
            }}
            pagination={{
              mode: 'server',
              page,
              pageSize,
              totalRows,
              onPaginationChange: handlePaginationChange,
            }}
            search={{
              mode: 'server',
              onSearchChange: handleSearchChange,
            }}
          >
            <URMViewerRaw />
          </URMProvider>
        )}
      </Box>
    </Box>
  );
}
