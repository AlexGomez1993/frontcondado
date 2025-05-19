'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Container, Divider, Grid, Typography } from '@mui/material';
import Slider from 'react-slick';

import axiosClient from '@/lib/axiosClient';

const HomeClientPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axiosClient.get('/api/campanias?activo=1');
        setCampaigns(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar las campañas:', error);
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) {
    return <Typography variant="h6">Cargando...</Typography>;
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          boxShadow: 3,
          padding: 3,
        }}
      >
        <Typography variant="h5" color="textSecondary" align="center" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
          ¡No hay campañas activas en este momento! <br />
        </Typography>
      </Box>
    );
  }

  const carouselSettings = {
    dots: true,
    infinite: campaigns.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Slider {...carouselSettings}>
            {campaigns.length > 0 ? (
              campaigns.map((campaign: any, campaignIndex) => (
                <div key={campaignIndex}>
                  <Card sx={{ marginBottom: '20px' }}>
                    <CardMedia
                      component="img"
                      height="auto"
                      sx={{
                        width: '100%',
                        objectFit: 'cover',
                      }}
                      src={
                        `${process.env.NEXT_PUBLIC_API_URL}/banners/${campaign.banner}` ||
                        'https://via.placeholder.com/800x400?text=Banner+No+Disponible'
                      }
                      alt={`Banner de la campaña ${campaignIndex + 1}`}
                    />
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {campaign.nombre}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {campaign.promociones?.[0]?.fecha_inicio
                          ? `Del: ${new Date(campaign.promociones[0].fecha_inicio).toLocaleDateString()}`
                          : 'Del: -'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {campaign.promociones?.[0]?.fecha_fin
                          ? `Al: ${new Date(campaign.promociones[0].fecha_fin).toLocaleDateString()}`
                          : 'Al: -'}
                      </Typography>

                      <Typography
                        variant="body1"
                        color="textSecondary"
                        align="center"
                        sx={{ fontWeight: 'bold', marginTop: '20px' }}
                      >
                        ¡Recuerda! Las facturas son acumulables entre sí a partir de los $10.
                      </Typography>
                      <Divider sx={{ margin: '10px 0' }} />
                      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                        {campaign.promociones && campaign.promociones.length > 0 ? (
                          campaign.promociones.map((promo: any, promoIndex: number) => (
                            <Grid item xs={12} md={6} key={promoIndex}>
                              <Card sx={{ height: '100%' }}>
                                <CardContent>
                                  <Typography variant="h6">{promo.nombre}</Typography>
                                  <Typography variant="body1" color="primary">
                                    Monto Mínimo:{' '}
                                    {promo.montominimo ? `$${parseFloat(promo.montominimo).toFixed(2)}` : 'N/A'}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))
                        ) : (
                          <Grid item xs={12}>
                            <Typography variant="body1" color="textSecondary">
                              No hay promociones disponibles en esta campaña.
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <Typography variant="h6" color="textSecondary">
                No hay campañas activas.
              </Typography>
            )}
          </Slider>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomeClientPage;
