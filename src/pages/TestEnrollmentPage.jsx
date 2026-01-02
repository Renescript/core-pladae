import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnrollmentFlowSelector from '../components/Enrollment/EnrollmentFlowSelector';
import SuccessMessage from '../components/Enrollment/SuccessMessage';

const TestEnrollmentPage = () => {
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
        <EnrollmentFlowSelector
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

export default TestEnrollmentPage;
