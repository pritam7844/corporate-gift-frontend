import '../globals.css';
import AdminLayoutContent from '../../components/admin/AdminLayoutContent';

export const metadata = {
  title: 'Wellwigen Corporate Gift - Admin',
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