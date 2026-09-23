import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nombre,
      apellido = '',
      dni,
      telefono = '',
      email = '',
      password,
      alergias = 'Ninguna',
      patologias = 'Ninguna',
      dias_asistencia = 3,
    } = body;

    if (!nombre || !dni || !password) {
      return NextResponse.json(
        { ok: false, error: 'Nombre, DNI y Contraseña son campos obligatorios.' },
        { status: 400 }
      );
    }

    const cleanDni = String(dni).trim();
    const cleanNombre = String(nombre).trim();
    const cleanApellido = String(apellido).trim();
    const cleanPass = String(password).trim();

    // No permitir registrar con el nombre reservado e22gym
    if (cleanDni.toLowerCase() === 'e22gym') {
      return NextResponse.json(
        { ok: false, error: 'El identificador ingresado está reservado para el administrador.' },
        { status: 400 }
      );
    }

    // Verificar si el DNI ya existe
    const exists = await query(
      `SELECT id FROM e22.usuarios WHERE dni = $1 OR username = $1 LIMIT 1;`,
      [cleanDni]
    );

    if (exists.rows.length > 0) {
      return NextResponse.json(
        { ok: false, error: `El DNI ${cleanDni} ya se encuentra registrado en E22 Gym.` },
        { status: 409 }
      );
    }

    // Cifrar la contraseña con bcrypt (10 rondas de salt)
    const hashedPassword = await bcrypt.hash(cleanPass, 10);

    // Insertar nuevo usuario con contraseña cifrada
    const insertRes = await query(
      `INSERT INTO e22.usuarios (
        username, dni, nombre, apellido, email, telefono, password,
        rol, vencimiento_cuota, estado_pago, habilitado, alergias, patologias, dias_asistencia
      ) VALUES ($1, $1, $2, $3, $4, $5, $6, 'usuario', NULL, 'pendiente', false, $7, $8, $9)
      RETURNING id, username, dni, nombre, apellido, email, telefono, rol,
                vencimiento_cuota, estado_pago, habilitado, alergias, patologias, dias_asistencia;`,
      [
        cleanDni,
        cleanNombre,
        cleanApellido,
        email || `${cleanDni}@e22gym.com`,
        telefono,
        hashedPassword,
        alergias || 'Ninguna',
        patologias || 'Ninguna',
        Number(dias_asistencia) || 3,
      ]
    );

    const newUser = insertRes.rows[0];
    newUser.nombre_completo = `${newUser.nombre} ${newUser.apellido || ''}`.trim();
    newUser.dias_restantes = 0;

    const res = NextResponse.json({
      ok: true,
      message: '¡Registro completado en E22 GYM! Tu cuenta ha sido creada exitosamente.',
      user: newUser,
    });
    res.cookies.set('e22_role', 'alumno', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    return NextResponse.json(
      { ok: false, error: 'Error del servidor al procesar el registro.' },
      { status: 500 }
    );
  }
}
