'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import axiosClient from '@/lib/axiosClient';

const schema = zod.object({
  email: zod.string().email({ message: 'Correo inválido' }),
  ruc: zod.string().min(1, { message: 'Documento es requerido' }),
  code: zod.string().optional(),
  newPassword: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

export function ResetPasswordForm(): React.JSX.Element {
  const router = useRouter();
  const [isCodeSent, setIsCodeSent] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [showResend, setShowResend] = React.useState(false);
  const [resendTimer, setResendTimer] = React.useState(0);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onSubmit = async (values: FormValues) => {
    setIsPending(true);

    if (!isCodeSent) {
      try {
        const { data } = await axiosClient.post('/api/validacion/validarMail', {
          correo: values.email,
          ruc: values.ruc,
        });

        setSnackbar({ open: true, message: data.msg || 'Correo enviado correctamente', severity: 'success' });
        setIsCodeSent(true);
        setResendTimer(60);
      } catch (error: any) {
        const msg = error?.response?.data?.msg || 'Error al enviar el código';
        setSnackbar({ open: true, message: msg, severity: 'error' });
      } finally {
        setIsPending(false);
      }
    } else {
      if (!values.code || !values.newPassword) {
        setSnackbar({
          open: true,
          message: 'Debes ingresar el código y la nueva contraseña',
          severity: 'error',
        });
        setIsPending(false);
        return;
      }

      try {
        const { data } = await axiosClient.post('/api/validacion/cambiarContrasena', {
          correo: values.email,
          ruc: values.ruc,
          codigo: values.code,
          nuevaContrasena: values.newPassword,
        });

        setSnackbar({ open: true, message: data.msg || 'Contraseña actualizada', severity: 'success' });

        setTimeout(() => {
          router.push('/auth/sign-in-client');
        }, 2000);
      } catch (error: any) {
        const msg = error?.response?.data?.msg || 'Error al cambiar la contraseña';

        if (msg.toLowerCase().includes('inválido') || msg.toLowerCase().includes('expirado')) {
          setShowResend(true);
        }

        setSnackbar({ open: true, message: msg, severity: 'error' });
      } finally {
        setIsPending(false);
      }
    }
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/assets/fondo-condado.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 800,
          position: 'relative',
        }}
      >
        <Stack spacing={3}
          sx={{
            background: 'linear-gradient(180deg, rgba(242, 242, 242, 0.95) 10%, rgba(118, 40, 125, 0.9) 150%)',
            borderRadius: 3,
            p: 4,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            width: '100%',
            maxWidth: 450,
            color: 'white',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
          <Box
            component="img"
            src="/assets/logocondado.png"
            alt="Logo"
            sx={{
              width: 210,
              mx: 'auto',
              borderRadius: 2,
              transform: 'translateY(15px)', // Ajuste fino de alineación vertical
              flexShrink: 0,
              '@media (max-width: 400px)': {
                transform: 'translateY(0)',
                marginBottom: 2,
                width: 210,
              },
            }}
          />
          <Typography variant="h4" sx={{
            fontWeight: 800,
            color: 'common.white',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>Recuperar contraseña</Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormControl error={!!errors.email}>
                    <InputLabel sx={{
                      color: 'rgba(118,40,125)',
                      '&.Mui-focused': {
                        color: 'rgba(118,40,125)',
                      },
                    }}>Correo electrónico</InputLabel>
                    <OutlinedInput {...field} label="Correo electrónico" sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(118,40,125)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(118,40,125)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(118,40,125)',
                      },
                    }} />
                    {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="ruc"
                render={({ field }) => (
                  <FormControl error={!!errors.ruc}>
                    <InputLabel sx={{
                      color: 'rgba(118,40,125)',
                      '&.Mui-focused': {
                        color: 'rgba(118,40,125)',
                      },
                    }}>Documento de identidad</InputLabel>
                    <OutlinedInput {...field} label="Documento de identidad" sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(118,40,125)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(118,40,125)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(118,40,125)',
                      },
                    }} />
                    {errors.ruc && <FormHelperText>{errors.ruc.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              {isCodeSent && (
                <>
                  <Controller
                    control={control}
                    name="code"
                    render={({ field }) => (
                      <FormControl error={!!errors.code}>
                        <InputLabel sx={{
                          color: 'rgba(118,40,125)',
                          '&.Mui-focused': {
                            color: 'rgba(118,40,125)',
                          },
                        }}>Código</InputLabel>
                        <OutlinedInput {...field} label="Código" sx={{
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(118,40,125)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(118,40,125)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(118,40,125)',
                          },
                        }} />
                        {errors.code && <FormHelperText>{errors.code.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />

                  <Controller
                    control={control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormControl error={!!errors.newPassword}>
                        <InputLabel sx={{
                          color: 'rgba(118,40,125)',
                          '&.Mui-focused': {
                            color: 'rgba(118,40,125)',
                          },
                        }}>Nueva contraseña</InputLabel>
                        <OutlinedInput {...field} type="password" label="Nueva contraseña" sx={{
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(118,40,125)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(118,40,125)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(118,40,125)',
                          },
                        }} />
                        {errors.newPassword && <FormHelperText>{errors.newPassword.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />

                  {showResend && (
                    <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                      {resendTimer > 0 ? (
                        <>
                          <CircularProgress size={20} variant="determinate" value={((60 - resendTimer) / 60) * 100} />
                          <Typography variant="body2">Reenviar en {resendTimer} segundos</Typography>
                        </>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{
                            color: 'rgb(118,40,125)',
                            backgroundColor: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                          }}
                          onClick={async () => {
                            try {
                              const values = getValues();
                              const { data } = await axiosClient.post('/api/validacion/validarMail', {
                                correo: values.email,
                                ruc: values.ruc,
                              });

                              setSnackbar({
                                open: true,
                                message: data.msg || 'Código reenviado',
                                severity: 'success',
                              });

                              setValue('code', '');
                              setValue('newPassword', '');
                              setShowResend(false);
                              setResendTimer(60);
                            } catch (error: any) {
                              const msg = error?.response?.data?.msg || 'Error al reenviar el código';
                              setSnackbar({ open: true, message: msg, severity: 'error' });
                            }
                          }}
                        >
                          Reenviar código
                        </Button>
                      )}
                    </Stack>
                  )}

                </>
              )}

              <Button
                disabled={isPending}
                type="submit"
                variant="contained"
                sx={{
                  color: 'rgb(118,40,125)',
                  backgroundColor: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                {isCodeSent ? 'Cambiar contraseña' : 'Enviar código'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{
                  color: 'rgb(118,40,125)',
                  backgroundColor: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
                onClick={() => router.push('/auth/sign-in-client')}
              >
                Cancelar
              </Button>
            </Stack>
          </form>
        </Stack>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

    </Box>

  );
}
