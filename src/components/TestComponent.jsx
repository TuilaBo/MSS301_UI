import React from 'react';

const TestComponent = () => {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ✅ React App Working!
        </h1>
        <p className="text-gray-600">
          Nếu bạn thấy được message này thì React đã hoạt động bình thường.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm">
            Current time: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;