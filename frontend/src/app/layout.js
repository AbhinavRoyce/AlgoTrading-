import './globals.css';

export const metadata = {
  title: 'Algo Trading — Algorithmic Trading Platform',
  description: 'Professional algorithmic trading platform with live market data, strategy management, backtesting, analytics, and multi-broker integration.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
