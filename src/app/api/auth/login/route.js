import { NextResponse } from 'next/server';
import { query, diasRestantes, estadoCuota } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales incompletas. Ingresa tu usuario o DNI y contraseña.' },
        { status: 400 }
      );
    }

    const cleanId = String(identifier).trim();
    const cleanPass = String(password).trim();

    // 1. Verificar si es el administrador / profesor: usuario 'e22gym'
    if (cleanId.toLowerCase() === 'e22gym') {
      const adminRes = await query(
        `SELECT * FROM e22.usuarios WHERE (username = 'e22gym' OR rol = 'profesor') LIMIT 1;`
      );

      if (adminRes.rows.length > 0) {
        const admin = adminRes.rows[0];
        let isAdminMatch = await bcrypt.compare(cleanPass, admin.password).catch(() => false);

        // Migración automática si aún tuviera contraseña en texto plano
        if (!isAdminMatch && admin.password === cleanPass) {
          isAdminMatch = true;
          const newHash = await bcrypt.hash(cleanPass, 10);
          await query(`UPDATE e22.usuarios SET password = $1 WHERE id = $2;`, [newHash, admin.id]);
        }

        if (isAdminMatch) {
          return NextResponse.json({
            ok: true,
            user: {
              id: admin.id,
              username: 'e22gym',
              nombre: admin.nombre,
              apellido: admin.apellido,
              rol: 'profesor',
              email: admin.email,
              habilitado: true,
            },
          });
        }
      }

      return NextResponse.json(
        { ok: false, error: 'Contraseña de administrador incorrecta.' },
        { status: 401 }
      );
    }

    // 2. Si no es e22gym, buscar socio por DNI o username
    const userRes = await query(
      `SELECT * FROM e22.usuarios WHERE (dni = $1 OR username = $1) LIMIT 1;`,
      [cleanId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: `No se encontró ningún socio registrado con el DNI ${cleanId}.` },
        { status: 404 }
      );
    }

    const user = userRes.rows[0];

    // Verificar contraseña del socio con bcrypt
    let isUserMatch = await bcrypt.compare(cleanPass, user.password).catch(() => false);

    // Migración automática si aún tuviera contraseña en texto plano
    if (!isUserMatch && user.password === cleanPass) {
      isUserMatch = true;
      const newHash = await bcrypt.hash(cleanPass, 10);
      await query(`UPDATE e22.usuarios SET password = $1 WHERE id = $2;`, [newHash, user.id]);
    }

    if (!isUserMatch) {
      return NextResponse.json(
        { ok: false, error: 'Contraseña incorrecta. Por favor, verifica tus datos.' },
        { status: 401 }
      );
    }

    const dias = user.vencimiento_cuota ? diasRestantes(user.vencimiento_cuota) : 0;
    const estado = estadoCuota(user.vencimiento_cuota, user.habilitado);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        dni: user.dni,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido || '',
        nombre_completo: `${user.nombre} ${user.apellido || ''}`.trim(),
        email: user.email,
        telefono: user.telefono,
        rol: user.rol, // 'usuario' | 'profesor'
        habilitado: user.habilitado,
        vencimiento_cuota: user.vencimiento_cuota,
        estado_pago: estado,
        dias_restantes: dias,
        alergias: user.alergias,
        patologias: user.patologias,
        dias_asistencia: user.dias_asistencia,
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return NextResponse.json(
      { ok: false, error: 'Error del servidor al procesar el inicio de sesión.' },
      { status: 500 }
    );
  }
}
