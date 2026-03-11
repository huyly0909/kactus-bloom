import { apiClient } from './apiClient';
import type { ApiResponse } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Pagination<T> {
  total: number;
  items: T[];
}

export interface CompanyItem {
  symbol: string;
  company_name: string | null;
  short_name: string | null;
  industry: string | null;
  exchange: string | null;
  market_cap: number | null;
  outstanding_shares: number | null;
  source: string | null;
  synced_at: string | null;
}

export interface CompanyDetail extends CompanyItem {
  overview: Record<string, unknown> | null;
}

export interface FinanceItem {
  symbol: string;
  period: string;
  year: number;
  quarter: number;
  report_type: string;
  source: string | null;
  synced_at: string | null;
}

export interface FinanceDetail extends FinanceItem {
  data: Record<string, unknown> | null;
}

export interface StockListingItem {
  symbol: string;
  organ_name: string | null;
  source: string | null;
  synced_at: string | null;
}

export interface OhlcvItem {
  symbol: string;
  time: string;
  interval: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  source: string | null;
}

export interface SyncResult {
  data_source: string;
  rows_fetched: number;
  rows_stored: number;
  table_name: string;
  duration_ms: number;
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const dataAdminService = {
  // Company
  getCompanies: async () => {
    const { data } = await apiClient.get<ApiResponse<Pagination<CompanyItem>>>('/api/company');
    return data.data;
  },
  getCompanyDetail: async (symbol: string) => {
    const { data } = await apiClient.get<ApiResponse<CompanyDetail>>(`/api/company/${symbol}`);
    return data.data;
  },
  syncCompany: async (symbol: string) => {
    const { data } = await apiClient.post<ApiResponse<SyncResult>>('/api/company/sync', { symbol });
    return data.data;
  },

  // Finance
  getFinanceRecords: async (symbol?: string, reportType?: string) => {
    const params = new URLSearchParams();
    if (symbol) params.set('symbol', symbol);
    if (reportType) params.set('report_type', reportType);
    const { data } = await apiClient.get<ApiResponse<Pagination<FinanceItem>>>(
      `/api/finance?${params}`,
    );
    return data.data;
  },
  getFinanceDetail: async (symbol: string) => {
    const { data } = await apiClient.get<ApiResponse<FinanceDetail[]>>(`/api/finance/${symbol}`);
    return data.data;
  },
  syncFinance: async (symbol: string, reportType: string, period: string) => {
    const { data } = await apiClient.post<ApiResponse<SyncResult>>('/api/finance/sync', {
      symbol,
      report_type: reportType,
      period,
    });
    return data.data;
  },

  // Stock
  getStocks: async () => {
    const { data } = await apiClient.get<ApiResponse<Pagination<StockListingItem>>>('/api/stock');
    return data.data;
  },
  getStockOhlcv: async (symbol: string) => {
    const { data } = await apiClient.get<ApiResponse<OhlcvItem[]>>(`/api/stock/${symbol}/ohlcv`);
    return data.data;
  },
  syncListing: async () => {
    const { data } = await apiClient.post<ApiResponse<SyncResult>>('/api/stock/sync-listing');
    return data.data;
  },
  syncOhlcv: async (symbol: string, startDate: string, endDate: string, interval = '1D') => {
    const { data } = await apiClient.post<ApiResponse<SyncResult>>('/api/stock/sync-ohlcv', {
      symbol,
      start_date: startDate,
      end_date: endDate,
      interval,
    });
    return data.data;
  },
};
