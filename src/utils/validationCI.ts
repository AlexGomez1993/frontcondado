export function isCedulaEcuador(numero: string): boolean {
  if (!/^\d{10}$/.test(numero)) return false;

  const d = numero.split('').map(Number);
  const [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10] = d;

  if (d3 === 7 || d3 === 8) return false;

  let suma = 0;
  let modulo = 10;
  let digitoVerificador = 0;

  if (d3 < 6) {
    // Persona natural
    const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    suma = coef.reduce((acc, mult, i) => {
      let val = d[i] * mult;
      if (val >= 10) val -= 9;
      return acc + val;
    }, 0);
    digitoVerificador = (modulo - (suma % modulo)) % 10;
    return digitoVerificador === d10;
  }

  return false;
}

export function isRucEcuador(numero: string): boolean {
  if (!/^\d{13}$/.test(numero)) return false;

  const d = numero.split('').map(Number);
  const [d1, d2, d3] = d;

  if (d3 === 7 || d3 === 8) return false;

  let suma = 0;
  let modulo = 11;
  let digitoVerificador = 0;

  if (d3 < 6) {
    // Persona natural
    const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    suma = coef.reduce((acc, mult, i) => {
      let val = d[i] * mult;
      if (val >= 10) val -= 9;
      return acc + val;
    }, 0);
    digitoVerificador = (10 - (suma % 10)) % 10;

    return digitoVerificador === d[9] && numero.slice(10, 13) === '001';
  } else if (d3 === 6) {
    // Sector público
    const coef = [3, 2, 7, 6, 5, 4, 3, 2];
    suma = coef.reduce((acc, mult, i) => acc + d[i] * mult, 0);
    digitoVerificador = (11 - (suma % 11)) % 11;

    return digitoVerificador === d[8] && numero.slice(9, 13) === '0001';
  } else if (d3 === 9) {
    // Empresa privada
    const coef = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    suma = coef.reduce((acc, mult, i) => acc + d[i] * mult, 0);
    digitoVerificador = (11 - (suma % 11)) % 11;

    return digitoVerificador === d[9] && numero.slice(10, 13) === '001';
  }

  return false;
}

export function isPasaporte(numero: string): boolean {
  return /^P[a-zA-Z0-9]{5,14}$/i.test(numero);
}
