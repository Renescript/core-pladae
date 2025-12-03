import { courses } from '../../data/mockData';

const CoursesShowcase = () => {
  return (
    <section className="courses-showcase">
      <h2>Nuestros Cursos</h2>
      <div className="courses-grid">
        {courses.map(course => {
          const availableSlots = course.maxStudents - course.currentStudents;
          const isLimited = availableSlots <= 5;

          return (
            <div key={course.id} className="course-card">
              <div className="course-image-container">
                <img src={course.image} alt={course.name} className="course-image" />
                <span className="course-category">{course.category}</span>
              </div>
              <div className="course-info">
                <h3>{course.name}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span className="course-duration">{course.duration}</span>
                  <span className="course-instructor">Prof. {course.instructor}</span>
                </div>
                <div className="course-availability">
                  <span className={`slots ${isLimited ? 'limited' : ''}`}>
                    {availableSlots > 0
                      ? `${availableSlots} cupos disponibles`
                      : 'Sin cupos disponibles'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CoursesShowcase;
