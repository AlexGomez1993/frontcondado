import { NextResponse } from 'next/server';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export async function POST(request: Request) {
  const data = await request.formData();
  const file: File | null = data.get('pdf') as unknown as File;

  if (!file) {
    return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
  }

  // Crear carpeta si no existe
  const uploadDir = join(process.cwd(), 'reglamentos');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Guardar archivo
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = join(uploadDir, file.name);
  
  try {
    createWriteStream(filePath).write(buffer);
    return NextResponse.json({ 
      success: true,
      path: filePath 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error guardando archivo' 
    }, { status: 500 });
  }
}