export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      
      <div className="w-full max-w-md bg-base-100 shadow-xl rounded-2xl p-6">
        
        {/* Branding */}
        <h1 className="text-2xl font-bold text-center mb-2">
           AI-Cloudinary-SaaS
        </h1>

        <p className="text-sm text-center text-gray-500 mb-6">
          Login to continue
        </p>

        {children}
      </div>

    </div>
  );
}