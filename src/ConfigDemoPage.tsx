import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import { Tune } from '@mui/icons-material';
import { URMViewer } from 'dts-universal-report-module';
import type { GridViewOption, ToolbarActionKey, DefaultRowActionKey } from 'dts-universal-report-module';
import usersSeed from './data/users-seed.json';

type UserRow = (typeof usersSeed)[number];

const ALL_COLUMNS = Object.keys(usersSeed[0]);
const TOOLBAR_KEYS: ToolbarActionKey[] = [
  'search',
  'sort',
  'filter',
  'columns',
  'grouping',
  'export',
  'auditHistory',
  'scheduledReports',
  'settings',
];
const ROW_ACTION_KEYS: DefaultRowActionKey[] = ['view', 'edit', 'duplicate', 'delete', 'export'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        {title}
      </Typography>
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        {children}
      </Stack>
    </Box>
  );
}

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function ConfigDemoPage() {
  // View mode
  const [viewOptions, setViewOptions] = useState<GridViewOption[]>(['list', 'grid']);
  const [defaultViewMode, setDefaultViewMode] = useState<GridViewOption>('list');

  // Selection
  const [hideSelectionCheckboxes, setHideSelectionCheckboxes] = useState(false);
  const [useStableId, setUseStableId] = useState(true);
  const [selectionLog, setSelectionLog] = useState<string[]>([]);

  // Click interactions
  const [rowClickBehavior, setRowClickBehavior] = useState<'select' | 'activate' | 'both'>('select');
  const [openModalOn, setOpenModalOn] = useState<Array<'doubleClick' | 'rightClick'>>([]);

  // Toolbar / row actions
  const [hiddenToolbar, setHiddenToolbar] = useState<ToolbarActionKey[]>([]);
  const [hiddenRowActions, setHiddenRowActions] = useState<DefaultRowActionKey[]>([]);
  const [bulkActionsOn, setBulkActionsOn] = useState(true);
  const [rowActionsOn, setRowActionsOn] = useState(true);
  const [customSettingsOn, setCustomSettingsOn] = useState(true);

  // Columns
  const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS);

  // Simulated refetch — new object references for the same logical rows, to
  // demonstrate getRowId stability (or its absence) across a data reload.
  const [refetchTick, setRefetchTick] = useState(0);
  // New object copies (never-before-stamped __urm_row_id__) whenever refetchTick
  // bumps OR the id strategy changes — otherwise assignRowId's "stamp once per
  // object" guard would silently keep whatever id an already-stamped row got
  // on first mount, making a getRowId toggle look like a no-op.
  const data = useMemo<UserRow[]>(
    () => usersSeed.map((row) => ({ ...row })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchTick, useStableId],
  );

  const bulkActions = useMemo(
    () =>
      bulkActionsOn
        ? [
            {
              key: 'retire',
              label: 'Retire',
              onClick: (rows: UserRow[]) => alert(`Retire ${rows.length} user(s)`),
            },
            {
              key: 'assign',
              label: 'Assign',
              onClick: (rows: UserRow[]) => alert(`Assign ${rows.length} user(s)`),
            },
          ]
        : undefined,
    [bulkActionsOn],
  );

  const rowActions = useMemo(
    () =>
      rowActionsOn
        ? [
            {
              key: 'flag',
              label: 'Flag for review',
              onClick: (row: UserRow) => alert(`Flagged ${row.full_name}`),
            },
          ]
        : undefined,
    [rowActionsOn],
  );

  const customSettingsActions = useMemo(
    () =>
      customSettingsOn
        ? [{ key: 'demo-setting', label: 'Demo Setting', onClick: () => alert('Custom settings action') }]
        : undefined,
    [customSettingsOn],
  );

  const handleSelectionChange = useCallback((rows: UserRow[], ids: Array<string | number>) => {
    setSelectionLog((prev) =>
      [`${rows.length} selected — ids: ${ids.join(', ') || '(none)'}`, ...prev].slice(0, 5),
    );
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: (theme) => `${theme.tokens?.edgePad ?? 24}px`, pt: 2.5, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tune sx={{ color: '#8b5cf6' }} />
          <Typography variant="h5" fontWeight={600} sx={{ color: '#8b5cf6' }}>
            Config Playground
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Every URM host-config knob, live. Flip a control, watch the viewer react.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: 2, px: 2, pb: 2 }}>
        <Paper
          variant="outlined"
          sx={{ width: 320, flexShrink: 0, overflowY: 'auto', p: 2 }}
        >
          <Section title="View mode">
            <FormControlLabel
              control={
                <Checkbox
                  checked={viewOptions.includes('list')}
                  onChange={() => setViewOptions((prev) => toggleInArray(prev, 'list'))}
                />
              }
              label="Offer list view"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={viewOptions.includes('grid')}
                  onChange={() => setViewOptions((prev) => toggleInArray(prev, 'grid'))}
                />
              }
              label="Offer grid view"
            />
            <FormLabel sx={{ fontSize: '0.75rem', mt: 1 }}>Default view mode</FormLabel>
            <RadioGroup
              row
              value={defaultViewMode}
              onChange={(e) => setDefaultViewMode(e.target.value as GridViewOption)}
            >
              <FormControlLabel value="list" control={<Radio size="small" />} label="List" />
              <FormControlLabel value="grid" control={<Radio size="small" />} label="Grid" />
            </RadioGroup>
          </Section>

          <Divider sx={{ mb: 2.5 }} />

          <Section title="Selection">
            <FormControlLabel
              control={
                <Checkbox
                  checked={hideSelectionCheckboxes}
                  onChange={(e) => setHideSelectionCheckboxes(e.target.checked)}
                />
              }
              label="Hide selection checkboxes"
            />
            <FormControlLabel
              control={<Checkbox checked={useStableId} onChange={(e) => setUseStableId(e.target.checked)} />}
              label="Stable getRowId (row.user_id)"
            />
            <Button size="small" variant="outlined" onClick={() => setRefetchTick((t) => t + 1)} sx={{ mt: 0.5 }}>
              Simulate refetch
            </Button>
            {selectionLog.length > 0 && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                {selectionLog.map((line, i) => (
                  <Typography key={i} variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                    {line}
                  </Typography>
                ))}
              </Box>
            )}
          </Section>

          <Divider sx={{ mb: 2.5 }} />

          <Section title="Row click behavior">
            <RadioGroup
              value={rowClickBehavior}
              onChange={(e) => setRowClickBehavior(e.target.value as typeof rowClickBehavior)}
            >
              <FormControlLabel value="select" control={<Radio size="small" />} label="select (default)" />
              <FormControlLabel value="activate" control={<Radio size="small" />} label="activate (opens modal, no select)" />
              <FormControlLabel value="both" control={<Radio size="small" />} label="both" />
            </RadioGroup>
            <FormLabel sx={{ fontSize: '0.75rem', mt: 1 }}>Also open modal on</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={openModalOn.includes('doubleClick')}
                  onChange={() => setOpenModalOn((prev) => toggleInArray(prev, 'doubleClick'))}
                />
              }
              label="Double-click"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={openModalOn.includes('rightClick')}
                  onChange={() => setOpenModalOn((prev) => toggleInArray(prev, 'rightClick'))}
                />
              }
              label="Right-click"
            />
          </Section>

          <Divider sx={{ mb: 2.5 }} />

          <Section title="Toolbar actions (hidden)">
            {TOOLBAR_KEYS.map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    size="small"
                    checked={hiddenToolbar.includes(key)}
                    onChange={() => setHiddenToolbar((prev) => toggleInArray(prev, key))}
                  />
                }
                label={key}
              />
            ))}
          </Section>

          <Divider sx={{ mb: 2.5 }} />

          <Section title="Default row actions (hidden)">
            {ROW_ACTION_KEYS.map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    size="small"
                    checked={hiddenRowActions.includes(key)}
                    onChange={() => setHiddenRowActions((prev) => toggleInArray(prev, key))}
                  />
                }
                label={key}
              />
            ))}
          </Section>

          <Divider sx={{ mb: 2.5 }} />

          <Section title="Custom actions">
            <FormControlLabel
              control={<Checkbox checked={bulkActionsOn} onChange={(e) => setBulkActionsOn(e.target.checked)} />}
              label="bulkActions (Retire / Assign)"
            />
            <FormControlLabel
              control={<Checkbox checked={rowActionsOn} onChange={(e) => setRowActionsOn(e.target.checked)} />}
              label="rowActions (Flag for review)"
            />
            <FormControlLabel
              control={
                <Checkbox checked={customSettingsOn} onChange={(e) => setCustomSettingsOn(e.target.checked)} />
              }
              label="customSettingsActions (Demo Setting)"
            />
          </Section>

          <Divider sx={{ mb: 2.5 }} />

          <Section title="Visible columns">
            {ALL_COLUMNS.map((col) => (
              <FormControlLabel
                key={col}
                control={
                  <Checkbox
                    size="small"
                    checked={visibleCols.includes(col)}
                    onChange={() => setVisibleCols((prev) => toggleInArray(prev, col))}
                  />
                }
                label={col}
              />
            ))}
          </Section>
        </Paper>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={`${data.length} rows`} />
            <Chip size="small" label={`refetch #${refetchTick}`} variant="outlined" />
          </Stack>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <URMViewer
              // visibleColumns/defaultViewMode/getRowId are only read at report
              // auto-init time in URM today — remount on those specifically so
              // the playground stays truthfully live for every other config
              // (which DOES apply on every render without remounting).
              key={`${visibleCols.join(',')}|${defaultViewMode}|${useStableId}|${refetchTick}`}
              reportId="config-demo-report"
              data={data}
              config={{
                viewOptions,
                defaultViewMode,
                hideSelectionCheckboxes,
                getRowId: useStableId ? (row: UserRow) => row.user_id : undefined,
                onSelectionChange: handleSelectionChange,
                rowClickBehavior,
                openModalOn,
                hideToolbarActions: hiddenToolbar,
                hideDefaultRowActions: hiddenRowActions,
                bulkActions,
                rowActions,
                customSettingsActions,
                visibleColumns: visibleCols,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
