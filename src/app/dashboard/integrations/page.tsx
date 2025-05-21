"use client";
import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Document, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Slider from "react-slick";
import {
  Box,
  Card,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { BookOpenText } from "@phosphor-icons/react/dist/ssr";
import NewsCarousel from "@/components/dashboard/integrations/news-carrusel";
import { CompaniesFilters } from "@/components/dashboard/integrations/integrations-filters";
import axiosClient from "@/lib/axiosClient";
import { useUser } from "@/hooks/use-user";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function ReglamentoPage(): React.JSX.Element {
  const { user } = useUser();
  const [campanias, setCampanias] = useState<any[]>([]);
  const [campaniaSeleccionada, setCampaniaSeleccionada] = useState<any | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(600); // default width
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCampanias = async () => {
      try {
        const response = await axiosClient.get(`/api/campanias?activo=1`);
        const data = response.data.data || [];
        setCampanias(data);
        if (data.length === 1) {
          setCampaniaSeleccionada(data[0]);
        }
      } catch (error) {
        console.error("Error al cargar campañas:", error);
      }
    };

    fetchCampanias();
  }, []);

  // Detecta el ancho del contenedor en tiempo real
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  const memoizedPdfUrl = useMemo(() => {
    return campaniaSeleccionada?.reglamento
      ? `/reglamentos/${campaniaSeleccionada.reglamento}`
      : null;
  }, [campaniaSeleccionada]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#1976d2",
              display: "flex",
              alignItems: "center",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              textShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <BookOpenText style={{ marginRight: 8 }} />
            Reglamento
          </Typography>
        </Stack>
      </Stack>

      {campanias.length > 1 && (
        <FormControl fullWidth>
          <InputLabel id="campania-label">Campaña</InputLabel>
          <Select
            labelId="campania-label"
            value={campaniaSeleccionada?.id || ""}
            onChange={(e) => {
              const seleccionada = campanias.find((c) => c.id === e.target.value);
              setCampaniaSeleccionada(seleccionada || null);
              setNumPages(0);
            }}
            label="Campaña"
          >
            {campanias.map((campania) => (
              <MenuItem key={campania.id} value={campania.id}>
                {campania.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <CompaniesFilters />

      <Grid container spacing={10} alignItems="stretch">
        <Grid
          item
          xs={12}
          md={user?.rol_id === 1 || user?.rol_id === 3 ? 6.5 : 12}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Card
            ref={containerRef}
            sx={{
              p: 2,
              width: "100%",
              maxWidth: 800,
              textAlign: "center",
              height: "100%",
              minHeight: 400,
              overflowY: "auto",
            }}
          >
            {campanias.length === 0 ? (
              <Typography variant="h6" color="text.secondary">
                No hay campañas activas disponibles.
              </Typography>
            ) : !campaniaSeleccionada ? (
              <Typography color="text.secondary">
                Selecciona una campaña para ver su reglamento.
              </Typography>
            ) : !memoizedPdfUrl ? (
              <Typography color="text.secondary">
                Esta campaña no tiene reglamento asignado.
              </Typography>
            ) : (
              <>
                <Document
                  file={memoizedPdfUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  onLoadError={(err) => console.error("Error cargando PDF:", err)}
                >
                  {numPages > 0 ? (
                    <Slider {...sliderSettings}>
                      {Array.from({ length: numPages }, (_, index) => (
                        <Box key={index} sx={{ px: 2 }}>
                          <PdfPage
                            pageNumber={index + 1}
                            width={Math.min(containerWidth - 40, 760)} // responsive, con margen
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                          />
                        </Box>
                      ))}
                    </Slider>
                  ) : (
                    <Typography>Cargando páginas...</Typography>
                  )}
                </Document>
              </>
            )}
          </Card>
        </Grid>

        {(user?.rol_id === 1 || user?.rol_id === 3) && (
          <Grid item xs={12} md={4} sx={{ height: "100%" }}>
            <Card sx={{ p: 2, textAlign: "center", height: "100%" }}>
              <NewsCarousel vertical={true} />
            </Card>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
}
