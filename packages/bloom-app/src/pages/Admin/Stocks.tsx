import { type FC, useEffect, useState } from 'react';
import {
  Title,
  Stack,
  Table,
  Badge,
  Text,
  Button,
  Group,
  TextInput,
  Modal,
  ScrollArea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { dataAdminService } from '@kactus-bloom/ui/services';
import type { StockListingItem, OhlcvItem } from '@kactus-bloom/ui/services';

export const AdminStocksPage: FC = () => {
  const [stocks, setStocks] = useState<StockListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingListing, setSyncingListing] = useState(false);
  const [ohlcvSymbol, setOhlcvSymbol] = useState('');
  const [ohlcvStart, setOhlcvStart] = useState('');
  const [ohlcvEnd, setOhlcvEnd] = useState('');
  const [syncingOhlcv, setSyncingOhlcv] = useState(false);
  const [ohlcvData, setOhlcvData] = useState<OhlcvItem[]>([]);
  const [ohlcvOpen, setOhlcvOpen] = useState(false);
  const [ohlcvDetailSymbol, setOhlcvDetailSymbol] = useState('');

  const loadStocks = async () => {
    try {
      setIsLoading(true);
      const data = await dataAdminService.getStocks();
      setStocks(data.items);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load stocks', color: 'red' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const handleSyncListing = async () => {
    setSyncingListing(true);
    try {
      const result = await dataAdminService.syncListing();
      notifications.show({
        title: 'Sync Complete',
        message: `${result.rows_stored} rows stored in ${result.duration_ms.toFixed(0)}ms`,
        color: result.success ? 'green' : 'red',
      });
      await loadStocks();
    } catch {
      notifications.show({ title: 'Sync Failed', message: 'Failed to sync listing', color: 'red' });
    } finally {
      setSyncingListing(false);
    }
  };

  const handleSyncOhlcv = async () => {
    if (!ohlcvSymbol.trim() || !ohlcvStart || !ohlcvEnd) return;
    setSyncingOhlcv(true);
    try {
      const result = await dataAdminService.syncOhlcv(ohlcvSymbol.trim(), ohlcvStart, ohlcvEnd);
      notifications.show({
        title: 'OHLCV Sync Complete',
        message: `${result.rows_stored} rows stored in ${result.duration_ms.toFixed(0)}ms`,
        color: result.success ? 'green' : 'red',
      });
    } catch {
      notifications.show({ title: 'Sync Failed', message: 'Failed to sync OHLCV', color: 'red' });
    } finally {
      setSyncingOhlcv(false);
    }
  };

  const handleRowClick = async (symbol: string) => {
    try {
      const data = await dataAdminService.getStockOhlcv(symbol);
      setOhlcvData(data);
      setOhlcvDetailSymbol(symbol);
      setOhlcvOpen(true);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load OHLCV', color: 'red' });
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Stocks</Title>
        <Button size="xs" onClick={handleSyncListing} loading={syncingListing}>
          Sync All Listings
        </Button>
      </Group>

      <Group gap="xs">
        <TextInput
          placeholder="Symbol"
          value={ohlcvSymbol}
          onChange={(e) => setOhlcvSymbol(e.currentTarget.value)}
          size="xs"
          w={100}
        />
        <TextInput
          placeholder="Start (YYYY-MM-DD)"
          value={ohlcvStart}
          onChange={(e) => setOhlcvStart(e.currentTarget.value)}
          size="xs"
          w={140}
        />
        <TextInput
          placeholder="End (YYYY-MM-DD)"
          value={ohlcvEnd}
          onChange={(e) => setOhlcvEnd(e.currentTarget.value)}
          size="xs"
          w={140}
        />
        <Button size="xs" variant="light" onClick={handleSyncOhlcv} loading={syncingOhlcv}>
          Sync OHLCV
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Symbol</Table.Th>
            <Table.Th>Organization</Table.Th>
            <Table.Th>Source</Table.Th>
            <Table.Th>Synced At</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isLoading ? (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text ta="center" c="dimmed">
                  Loading...
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : stocks.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text ta="center" c="dimmed">
                  No stocks found
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            stocks.map((s) => (
              <Table.Tr
                key={s.symbol}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(s.symbol)}
              >
                <Table.Td>
                  <Badge color="blue" variant="light">
                    {s.symbol}
                  </Badge>
                </Table.Td>
                <Table.Td fw={500}>{s.organ_name || '—'}</Table.Td>
                <Table.Td>{s.source || '—'}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {s.synced_at || '—'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <Modal
        opened={ohlcvOpen}
        onClose={() => setOhlcvOpen(false)}
        title={`OHLCV: ${ohlcvDetailSymbol}`}
        size="xl"
      >
        {ohlcvData.length > 0 ? (
          <ScrollArea h={400}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Open</Table.Th>
                  <Table.Th>High</Table.Th>
                  <Table.Th>Low</Table.Th>
                  <Table.Th>Close</Table.Th>
                  <Table.Th>Volume</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {ohlcvData.map((d, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{d.time}</Table.Td>
                    <Table.Td>{d.open?.toLocaleString()}</Table.Td>
                    <Table.Td>{d.high?.toLocaleString()}</Table.Td>
                    <Table.Td>{d.low?.toLocaleString()}</Table.Td>
                    <Table.Td>{d.close?.toLocaleString()}</Table.Td>
                    <Table.Td>{d.volume?.toLocaleString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        ) : (
          <Text c="dimmed">No OHLCV data available</Text>
        )}
      </Modal>
    </Stack>
  );
};
