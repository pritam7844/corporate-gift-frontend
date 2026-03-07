import '../globals.css';
import EmployeeNavbar from '../../components/employee/EmployeeNavbar';
import EmployeeFooter from '../../components/employee/EmployeeFooter';

export default function SubdomainLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#F8FAFC]">
        <EmployeeNavbar />
        <main className="flex-grow">
          {children}
        </main>
        <EmployeeFooter />
      </body>
    </html>
  );
}