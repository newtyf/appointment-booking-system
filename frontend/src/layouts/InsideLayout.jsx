const InsideLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-pink-500 text-white py-4 px-8 shadow">
        <h1 className="text-xl font-bold">Appointment Booking System</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </main>
      <footer className="bg-gray-200 text-gray-600 py-2 px-8 text-center text-sm">
        © {new Date().getFullYear()} Appointment Booking System
      </footer>
    </div>
  );
};

export default InsideLayout;
