// components/dashboard/integrations/news-carrusel.tsx

import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  useTheme,
  Avatar,
  Stack,
} from '@mui/material';
import { NewspaperClipping } from '@phosphor-icons/react';
import axiosClient from '@/lib/axiosClient';

interface NewsCarouselProps {
  vertical?: boolean; // Agrega esta línea
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ vertical = false }) => {
  const [news, setNews] = useState<any[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosClient.get('/api/noticias?activo=1');
        setNews(response.data);
      } catch (error) {
        console.error('Error al cargar las noticias:', error);
      }
    };
    fetchNews();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: vertical ? 5 : 1,
    slidesToScroll: vertical ? 2 : 1,
    autoplay: true,
    autoplaySpeed: 4000,
    vertical,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          vertical: false,
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          vertical: false,
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Box
  sx={{
    width: '100%',
    height: '100%',
    display: 'block', 
  }}
>
      <Typography
        variant="h6"
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          textAlign: 'center',
          padding: '12px',
          fontWeight: 'bold',
          letterSpacing: 1.2,
          borderRadius: 1,
        }}
      >
        Noticias y Recomendaciones
      </Typography>

      <Divider />

      <Slider {...settings}>
        {news.map((item, index) => (
          <Box key={index} sx={{ px: 2, py: 1 }}>
            <Card elevation={0} sx={{ backgroundColor: 'transparent' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    <NewspaperClipping size={20} weight="bold" />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      {item.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'justify'
                      }}
                    >
                      {item.descripcion}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default NewsCarousel;
