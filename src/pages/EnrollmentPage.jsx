import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnrollmentForm from '../components/Enrollment/EnrollmentForm';
import SuccessMessage from '../components/Enrollment/SuccessMessage';
import '../components/Enrollment/enrollment-global.css';

const EnrollmentPage = () => {
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
        <EnrollmentForm
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

export default EnrollmentPage;
