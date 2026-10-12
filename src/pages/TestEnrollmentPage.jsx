import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProfessionalEnrollmentForm from '../components/Enrollment/ProfessionalEnrollmentForm';
import SuccessMessage from '../components/Enrollment/SuccessMessage';
import '../components/Enrollment/enrollment-global.css';

const TestEnrollmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const renewalToken = searchParams.get('renovar');
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
        <ProfessionalEnrollmentForm
          renewalToken={renewalToken}
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
