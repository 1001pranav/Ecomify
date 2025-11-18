'use client';

import { useState } from 'react';
import { Button } from '@ecomify/ui';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from './AnalyticsPage';

/**
 * ExportButton Component
 *
 * Allows users to export analytics data in various formats (CSV, JSON)
 * Implements data export functionality with format selection
 */

interface ExportButtonProps {
  data: any;
  dateRange: DateRange;
  filename: string;
}

export function ExportButton({ data, dateRange, filename }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // Convert time series data to CSV
      const headers = ['Date', 'Revenue', 'Orders'];
      const rows = data.timeSeries.map((item: any) => [
        item.date,
        item.revenue,
        item.orders,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.join(',')),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const exportData = {
        dateRange: {
          from: format(dateRange.from, 'yyyy-MM-dd'),
          to: format(dateRange.to, 'yyyy-MM-dd'),
        },
        metrics: data.metrics,
        timeSeries: data.timeSeries,
        topProducts: data.topProducts,
        customerMetrics: data.customerMetrics,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md">
            <button
              onClick={exportToCSV}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export as CSV
            </button>
            <button
              onClick={exportToJSON}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="h-4 w-4" />
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
