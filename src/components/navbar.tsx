import { Group, Button, Container } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { IconUpload, IconChartBar, IconMessage, IconTrophy } from '@tabler/icons-react';

const navlinks = [
  {
    label: 'Upload Chat',
    to: '/',
    icon: IconUpload,
    variant: 'filled' as const,
  },
  {
    label: 'Statistics',
    to: '/stats',
    icon: IconChartBar,
    variant: 'subtle' as const,
  },
  {
    label: 'Messages',
    to: '/messages',
    icon: IconMessage,
    variant: 'subtle' as const,
  },
  {
    label: 'Rankings',
    to: '/rankings',
    icon: IconTrophy,
    variant: 'subtle' as const,
  },
];

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <Container size='xl' py='md'>
      <Group gap='md'>
        {navlinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.to;

          return (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              variant={isActive ? 'light' : link.variant}
              color={isActive ? 'blue' : 'gray'}
              leftSection={<Icon size={16} />}
              size='sm'
            >
              {link.label}
            </Button>
          );
        })}
      </Group>
    </Container>
  );
}
