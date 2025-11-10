import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f8ff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '1rem' }}>
          ✅ React Working!
        </h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Server: localhost:5178
        </p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Time: {new Date().toLocaleString()}
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          🔄 Reload Page
        </button>
      </div>
    </div>
  );
};

export default SimpleTest;