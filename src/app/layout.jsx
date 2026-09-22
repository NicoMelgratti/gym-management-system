import './globals.css';

export const metadata = {
  title: 'e22gym',
  description: 'Plataforma oficial de gestión, rutinas y socios de E22 GYM',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-e22-bg text-e22-text antialiased selection:bg-white selection:text-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
