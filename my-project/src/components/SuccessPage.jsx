import React from "react";

const SuccessPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-green-500 text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Successfully Logged In!
        </h2>
        <p className="text-gray-600">Welcome back! You're now logged in.</p>
      </div>
    </div>
  );
};

export default SuccessPage;
