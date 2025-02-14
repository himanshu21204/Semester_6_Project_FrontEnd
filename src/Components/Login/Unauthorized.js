import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <button
        className="btn btn-primary"
        onClick={handleGoBack}
        style={{ marginTop: '20px' }}
      >
        Go Back
      </button>
    </div>
  );
};

export default UnauthorizedPage;