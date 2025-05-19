
"use client";
import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { Document, Page as PdfPage, pdfjs } from "react-pdf"; // Importa pdfjs desde react-pdf
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Slider from "react-slick";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { CompaniesFilters } from "@/components/dashboard/integrations/integrations-filters";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BookOpenText } from "@phosphor-icons/react/dist/ssr";
import { useUser } from "@/hooks/use-user";
import NewsCarousel from "@/components/dashboard/integrations/news-carrusel";
import { Box, Grid } from "@mui/material";

// Configura el worker usando la versión de react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function ReglamentoPage(): React.JSX.Element {
  const { user } = useUser();
  const [pdfData, setPdfData] = useState<Uint8Array | null>(() => {
    if (typeof window !== 'undefined') {
      const savedPdf = localStorage.getItem('reglamento');
      return savedPdf ? new Uint8Array(JSON.parse(savedPdf)) : null;
    }
    return null;
  });
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("El archivo seleccionado no es un PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const uintArray = new Uint8Array(reader.result as ArrayBuffer);
        setPdfData(uintArray);
        localStorage.setItem('reglamento', JSON.stringify(Array.from(uintArray)));
        setNumPages(0);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError("Error al cargar el archivo PDF.");
      console.error(reader.error);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const memoizedPdfFile = useMemo(() => (pdfData ? { data: pdfData } : null), [pdfData]);

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

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
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
            <BookOpenText style={{ marginRight: 8 }} />
            Reglamento
          </Typography>
        </Stack>
        {user?.rol_id === 1 && (
          <div>
            <Button
              component="label"
              startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant="contained"
            >
              Cargar Reglamento
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileUpload}
                aria-label="Cargar archivo PDF"
              />
            </Button>
          </div>
        )}
      </Stack>
      <CompaniesFilters />
      {error && (
        <Typography color="error" sx={{ textAlign: "center" }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={10}>
        {memoizedPdfFile && (
          <Grid item xs={12} md={6.5}>
            <Card sx={{ p: 2, textAlign: "center", height: "100%" }}>
              <Document
                file={memoizedPdfFile}
                onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
              >
                {numPages > 0 ? (
                  <Slider {...sliderSettings}>
                    {Array.from({ length: numPages }, (_, index) => (
                      <div key={index} style={{ padding: "0 10px" }}>
                        <PdfPage
                          pageNumber={index + 1}
                          width={600}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                        />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <Typography>Cargando páginas...</Typography>
                )}
              </Document>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={4} sx={{ height: "100%" }}>
          <Card sx={{ p: 2, textAlign: "center", height: "100%" }}>
          <NewsCarousel vertical={true} />
          </Card>
          
        </Grid>
      </Grid>


    </Stack>
  );
}