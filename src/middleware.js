import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const roleCookie = request.cookies.get('e22_role')?.value;

    // 1. Si no hay cookie de sesión activa, redirigir a inicio inmediatamente
    if (!roleCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    const isProfesor = roleCookie === 'profesor' || roleCookie === 'admin';

    // 2. Redirección de raíz /dashboard al panel correspondiente
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      const url = request.nextUrl.clone();
      url.pathname = isProfesor ? '/dashboard/profesor' : '/dashboard/alumno';
      return NextResponse.redirect(url);
    }

    // 3. Si intenta ingresar a /dashboard/profesor/* pero no tiene rol de profesor
    if (pathname.startsWith('/dashboard/profesor') && !isProfesor) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/alumno';
      return NextResponse.redirect(url);
    }

    // 4. Si intenta ingresar a /dashboard/alumno/* pero tiene rol de profesor
    if (pathname.startsWith('/dashboard/alumno') && isProfesor) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/profesor';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
