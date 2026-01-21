import React from 'react';
import { UserX, HomeIcon, ArrowLeft } from 'lucide-react';
function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-blue-100 rounded-full animate-pulse"></div>
            <UserX size={64} className="text-blue-500 relative" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Page Not Found</h1>
        <p className="text-blue-600 mb-8">
          We couldn't find the page you're looking for. It might have been moved, deleted, or the URL might be incorrect.
        </p>
        <div className="space-y-4">
          {/* <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
            <ArrowLeft size={20} />
            Go Back
          </button> */}
          {/* <button className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-3 px-6 rounded-lg transition duration-300">
            <HomeIcon size={20} />
            Return Home
          </button> */}
        </div>
      </div>
    </div>
  );
}
export default NotFound;