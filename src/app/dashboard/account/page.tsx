'use client';

import * as React from 'react';
import { Divider, Grid, Stack, Typography } from '@mui/material';
import { UserCircle } from '@phosphor-icons/react';

import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';

const AccountPage = () => {
  return (
    <Stack spacing={3}>
      <div>
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
          <UserCircle style={{ marginRight: 8 }} />
          Cuenta de Usuario
        </Typography>
        <Divider sx={{ marginBottom: 3 }} />
      </div>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          <AccountDetailsForm />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AccountPage;
