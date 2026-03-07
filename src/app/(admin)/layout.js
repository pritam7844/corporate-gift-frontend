import '../globals.css';
import AdminLayoutContent from '../../components/admin/AdminLayoutContent';

export const metadata = {
  title: 'Corporate Gift Platform - Admin',
  description: 'Enterprise corporate gifting and event management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </body>
    </html>
  );
}