import { Card, Text, ActionIcon, Group, Stack, Tooltip } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

interface ReportsSectionProps {
  overallReport: string;
  rankingsReport: string;
  categoriesReport: string;
}

export function ReportsSection({ overallReport, rankingsReport, categoriesReport }: ReportsSectionProps) {
  const [copiedReport, setCopiedReport] = useState<string | null>(null);

  const copyToClipboard = async (text: string, reportName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReport(reportName);
      setTimeout(() => setCopiedReport(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const reports = [
    {
      title: 'Overall Statistics Report',
      content: overallReport,
      name: 'overall',
    },
    {
      title: 'User Rankings Report',
      content: rankingsReport,
      name: 'rankings',
    },
    {
      title: 'Activity Categories Report',
      content: categoriesReport,
      name: 'categories',
    },
  ];

  return (
    <Stack gap='lg'>
      {reports.map((report) => (
        <Card key={report.name} withBorder shadow='sm' radius='md' p='lg'>
          <Group justify='space-between' mb='md'>
            <Text fw={600} size='lg'>
              {report.title}
            </Text>
            <Tooltip label={copiedReport === report.name ? 'Copied!' : 'Copy to clipboard'} withArrow>
              <ActionIcon
                variant='subtle'
                color={copiedReport === report.name ? 'green' : 'blue'}
                onClick={() => copyToClipboard(report.content, report.name)}
                title='Copy report'
              >
                {copiedReport === report.name ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          <Card withBorder p='md' bg='gray.0'>
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}
            >
              {report.content}
            </pre>
          </Card>
        </Card>
      ))}
    </Stack>
  );
}
