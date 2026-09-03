import { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Stack, Tooltip, CircularProgress, Alert } from '@mui/material';
import { Article, InfoOutlined } from '@mui/icons-material';
import { URMViewer } from 'dts-universal-report-module';

type PostRow = Record<string, unknown>;

const API_BASE = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_SIZE_DEFAULT = 15;

// Real server pagination — jsonplaceholder is json-server under the hood, so
// _page/_limit slice server-side and X-Total-Count carries the true total.
async function fetchPostsPage(
  page: number,
  pageSize: number,
): Promise<{ rows: PostRow[]; total: number }> {
  const res = await fetch(`${API_BASE}?_page=${page}&_limit=${pageSize}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const rows = (await res.json()) as PostRow[];
  const total = Number(res.headers.get('X-Total-Count')) || rows.length;
  return { rows, total };
}

export function PostsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [pageRows, setPageRows] = useState<PostRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchPostsPage(page, pageSize)
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
  }, [page, pageSize]);

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: (theme) => `${theme.tokens?.edgePad ?? 24}px`, pt: 2.5, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Article sx={{ color: '#0ea5e9' }} />
          <Typography variant="h5" fontWeight={600} sx={{ color: '#0ea5e9' }}>
            Posts
          </Typography>
          <Tooltip title="Live data from jsonplaceholder.typicode.com — real server-side pagination via _page/_limit.">
            <InfoOutlined sx={{ fontSize: 18, color: 'text.disabled' }} />
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, px: (theme) => `${theme.tokens?.edgePad ?? 24}px`, pb: (theme) => `${theme.tokens?.edgePad ?? 24}px` }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : pageRows.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <URMViewer
            reportId="posts-report"
            data={pageRows}
            config={{
              onRowRightClick: (row: any, rowIndex: any, event: any) => {
                console.log('Row right-clicked:', row);
                event.preventDefault();
              },
              hideToolbarActions: ['settings', 'filter', 'sort', 'search', 'columns'],
              visibleColumns: ['title', 'body'],
              viewOptions: ['table'],
              // customSettingsActions: [
              //   { key: 'my-action', label: 'My Action', onClick: () => {
              //     alert('My Action clicked!');
              //   } },
              // ],
            }}
            pagination={{
              mode: 'server',
              page,
              pageSize,
              totalRows,
              onPaginationChange: handlePaginationChange,
            }}
          />
        )}
      </Box>
    </Box>
  );
}
