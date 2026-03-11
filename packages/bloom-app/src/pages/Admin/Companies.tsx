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
  Code,
  ScrollArea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { dataAdminService } from '@kactus-bloom/ui/services';
import type { CompanyItem, CompanyDetail } from '@kactus-bloom/ui/services';

export const AdminCompaniesPage: FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncSymbol, setSyncSymbol] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await dataAdminService.getCompanies();
      setCompanies(data.items);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load companies', color: 'red' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSync = async () => {
    if (!syncSymbol.trim()) return;
    setSyncing(true);
    try {
      const result = await dataAdminService.syncCompany(syncSymbol.trim());
      notifications.show({
        title: 'Sync Complete',
        message: `${result.rows_stored} rows stored in ${result.duration_ms.toFixed(0)}ms`,
        color: result.success ? 'green' : 'red',
      });
      await loadCompanies();
    } catch {
      notifications.show({ title: 'Sync Failed', message: 'Failed to sync company', color: 'red' });
    } finally {
      setSyncing(false);
    }
  };

  const handleRowClick = async (symbol: string) => {
    try {
      const data = await dataAdminService.getCompanyDetail(symbol);
      setDetail(data);
      setDetailOpen(true);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load detail', color: 'red' });
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Companies</Title>
        <Group gap="xs">
          <TextInput
            placeholder="Symbol (e.g. VNM)"
            value={syncSymbol}
            onChange={(e) => setSyncSymbol(e.currentTarget.value)}
            size="xs"
          />
          <Button size="xs" onClick={handleSync} loading={syncing}>
            Sync
          </Button>
        </Group>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Symbol</Table.Th>
            <Table.Th>Company Name</Table.Th>
            <Table.Th>Industry</Table.Th>
            <Table.Th>Exchange</Table.Th>
            <Table.Th>Market Cap</Table.Th>
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
          ) : companies.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text ta="center" c="dimmed">
                  No companies found
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            companies.map((c) => (
              <Table.Tr
                key={c.symbol}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(c.symbol)}
              >
                <Table.Td>
                  <Badge color="blue" variant="light">
                    {c.symbol}
                  </Badge>
                </Table.Td>
                <Table.Td fw={500}>{c.company_name || '—'}</Table.Td>
                <Table.Td>{c.industry || '—'}</Table.Td>
                <Table.Td>{c.exchange || '—'}</Table.Td>
                <Table.Td>{c.market_cap ? c.market_cap.toLocaleString() : '—'}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {c.synced_at || '—'}
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
        title={`Company: ${detail?.symbol}`}
        size="lg"
      >
        {detail && (
          <ScrollArea h={400}>
            <Code block>{JSON.stringify(detail.overview || detail, null, 2)}</Code>
          </ScrollArea>
        )}
      </Modal>
    </Stack>
  );
};
