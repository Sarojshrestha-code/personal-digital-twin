 function AuthLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {title}
        </h1>

        {children}
      </div>
    </div>
  );
}

export default AuthLayout;