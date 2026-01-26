import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CopyEnrollmentForm from '../components/Enrollment/CopyEnrollmentForm';
import SuccessMessage from '../components/Enrollment/SuccessMessage';
import '../components/Enrollment/enrollment-global.css';

const CopyEnrollmentPage = () => {
  const navigate = useNavigate();
  const [enrollmentData, setEnrollmentData] = useState(null);

  const handleCloseEnrollment = () => {
    navigate('/');
  };

  const handleEnrollmentSuccess = (data) => {
    setEnrollmentData(data);
  };

  const handleCloseSuccess = () => {
    setEnrollmentData(null);
    navigate('/');
  };

  return (
    <div className="enrollment-page">
      {!enrollmentData ? (
        <CopyEnrollmentForm
          onClose={handleCloseEnrollment}
          onSuccess={handleEnrollmentSuccess}
        />
      ) : (
        <SuccessMessage
          enrollmentData={enrollmentData}
          onClose={handleCloseSuccess}
        />
      )}
    </div>
  );
};

export default CopyEnrollmentPage;
