import { type FC, useCallback, useEffect, useState } from 'react';
import {
  Title,
  Stack,
  Table,
  Badge,
  Text,
  Button,
  Group,
  TextInput,
  Select,
  Modal,
  Code,
  ScrollArea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { dataAdminService } from '@kactus-bloom/ui/services';
import type { FinanceItem, FinanceDetail } from '@kactus-bloom/ui/services';

export const AdminFinancePage: FC = () => {
  const [records, setRecords] = useState<FinanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterReportType, setFilterReportType] = useState<string | null>(null);
  const [syncSymbol, setSyncSymbol] = useState('');
  const [syncReportType, setSyncReportType] = useState('BalanceSheet');
  const [syncPeriod, setSyncPeriod] = useState('quarter');
  const [syncing, setSyncing] = useState(false);
  const [details, setDetails] = useState<FinanceDetail[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSymbol, setDetailSymbol] = useState('');

  const reportTypes = ['BalanceSheet', 'IncomeStatement', 'CashFlow'];

  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await dataAdminService.getFinanceRecords(
        filterSymbol || undefined,
        filterReportType || undefined,
      );
      setRecords(data.items);
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to load finance records',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterSymbol, filterReportType]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleFilter = () => loadRecords();

  const handleSync = async () => {
    if (!syncSymbol.trim()) return;
    setSyncing(true);
    try {
      const result = await dataAdminService.syncFinance(
        syncSymbol.trim(),
        syncReportType,
        syncPeriod,
      );
      notifications.show({
        title: 'Sync Complete',
        message: `${result.rows_stored} rows stored in ${result.duration_ms.toFixed(0)}ms`,
        color: result.success ? 'green' : 'red',
      });
      await loadRecords();
    } catch {
      notifications.show({ title: 'Sync Failed', message: 'Failed to sync finance', color: 'red' });
    } finally {
      setSyncing(false);
    }
  };

  const handleRowClick = async (symbol: string) => {
    try {
      const data = await dataAdminService.getFinanceDetail(symbol);
      setDetails(data);
      setDetailSymbol(symbol);
      setDetailOpen(true);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load detail', color: 'red' });
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Finance</Title>
        <Group gap="xs">
          <TextInput
            placeholder="Symbol"
            value={syncSymbol}
            onChange={(e) => setSyncSymbol(e.currentTarget.value)}
            size="xs"
            w={100}
          />
          <Select
            data={reportTypes}
            value={syncReportType}
            onChange={(v) => setSyncReportType(v || 'BalanceSheet')}
            size="xs"
            w={140}
          />
          <Select
            data={['quarter', 'year']}
            value={syncPeriod}
            onChange={(v) => setSyncPeriod(v || 'quarter')}
            size="xs"
            w={100}
          />
          <Button size="xs" onClick={handleSync} loading={syncing}>
            Sync
          </Button>
        </Group>
      </Group>

      <Group gap="xs">
        <TextInput
          placeholder="Filter by symbol"
          value={filterSymbol}
          onChange={(e) => setFilterSymbol(e.currentTarget.value)}
          size="xs"
          w={120}
        />
        <Select
          data={[{ value: '', label: 'All' }, ...reportTypes.map((r) => ({ value: r, label: r }))]}
          value={filterReportType || ''}
          onChange={(v) => setFilterReportType(v || null)}
          size="xs"
          w={150}
        />
        <Button size="xs" variant="light" onClick={handleFilter}>
          Filter
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Symbol</Table.Th>
            <Table.Th>Report Type</Table.Th>
            <Table.Th>Period</Table.Th>
            <Table.Th>Year</Table.Th>
            <Table.Th>Quarter</Table.Th>
            <Table.Th>Synced At</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isLoading ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text ta="center" c="dimmed">
                  Loading...
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : records.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text ta="center" c="dimmed">
                  No records found
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            records.map((r, i) => (
              <Table.Tr
                key={i}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(r.symbol)}
              >
                <Table.Td>
                  <Badge color="blue" variant="light">
                    {r.symbol}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color="grape" variant="light">
                    {r.report_type}
                  </Badge>
                </Table.Td>
                <Table.Td>{r.period}</Table.Td>
                <Table.Td>{r.year}</Table.Td>
                <Table.Td>{r.quarter}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {r.synced_at || '—'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <Modal
        opened={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Finance: ${detailSymbol}`}
        size="lg"
      >
        <ScrollArea h={400}>
          <Code block>{JSON.stringify(details, null, 2)}</Code>
        </ScrollArea>
      </Modal>
    </Stack>
  );
};
