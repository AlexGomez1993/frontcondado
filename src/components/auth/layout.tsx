import * as React from 'react';
import Box from '@mui/material/Box';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
              minHeight: '100vh',
              width: '100vw',
              backgroundImage: 'url(/assets/fondo-condado.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
              position: 'fixed',
              top: 0,
              left: 0,
            }}
    >
      {/* Contenido principal */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '',
          borderRadius: 2,
          boxShadow: 3,
          padding: 4,
          zIndex: 1, // Asegura que esté por encima del fondo
          width: '100%',
          maxWidth: '450px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
