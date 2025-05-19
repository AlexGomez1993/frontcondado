'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { CurrencyDollarSimple, Gear, Sliders } from '@phosphor-icons/react';

import { config } from '@/config';

const ConfigurationsPage = () => {
  const router = useRouter();

  return (
    <Paper sx={{ padding: 2, backgroundColor: '#f5f5f5' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            textShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Gear style={{ marginRight: 8 }} />
          Configuraciones
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: 4 }} />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          flexWrap: 'wrap',
          maxWidth: 600,
          margin: '0 auto',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<Sliders size={24} />}
          onClick={() => router.push('/dashboard/settings/variables/list')}
          sx={{ minWidth: 200, paddingY: 2 }}
        >
          Variables
        </Button>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<CurrencyDollarSimple size={24} />}
          onClick={() => router.push('/dashboard/settings/balances/list')}
          sx={{ minWidth: 200, paddingY: 2 }}
        >
          Saldos
        </Button>
      </Box>
    </Paper>
  );
};

export default ConfigurationsPage;
