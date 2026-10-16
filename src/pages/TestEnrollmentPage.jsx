import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProfessionalEnrollmentForm from '../components/Enrollment/ProfessionalEnrollmentForm';
import SuccessMessage from '../components/Enrollment/SuccessMessage';
import '../components/Enrollment/enrollment-global.css';

const TestEnrollmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const renewalToken = searchParams.get('renovar');
  // ?curso=<id>: deja el taller elegido (link de la invitación después de la clase de prueba).
  const initialCourseId = parseInt(searchParams.get('curso'), 10) || null;
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
          initialCourseId={initialCourseId}
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
