import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AssessmentRowComponent } from './components/assessment-row/assessment-row.component';
import { CertificateRowComponent } from './components/certificate-row/certificate-row.component';
import { CourseCatalogFiltersComponent } from './components/course-catalog-filters/course-catalog-filters.component';
import { CourseProgressRowComponent } from './components/course-progress-row/course-progress-row.component';
import { RegistrationRowComponent } from './components/registration-row/registration-row.component';
import { CourseCatalogPageComponent } from './pages/course-catalog/course-catalog-page.component';
import { CourseDetailPageComponent } from './pages/course-detail/course-detail-page.component';
import { CourseMaterialsPageComponent } from './pages/course-materials/course-materials-page.component';
import { StudentDashboardPageComponent } from './pages/dashboard/student-dashboard-page.component';
import { MyCertificatesPageComponent } from './pages/my-certificates/my-certificates-page.component';
import { MyProgressPageComponent } from './pages/my-progress/my-progress-page.component';
import { MyRegistrationsPageComponent } from './pages/my-registrations/my-registrations-page.component';
import { QuizParticipationPageComponent } from './pages/quiz-participation/quiz-participation-page.component';
import { UpcomingAssessmentsPageComponent } from './pages/upcoming-assessments/upcoming-assessments-page.component';
import { StudentLayoutComponent } from './student-layout.component';
import { StudentRoutingModule } from './student-routing.module';

@NgModule({
  declarations: [
    StudentLayoutComponent,
    StudentDashboardPageComponent,
    CourseCatalogPageComponent,
    CourseCatalogFiltersComponent,
    CourseDetailPageComponent,
    CourseMaterialsPageComponent,
    MyProgressPageComponent,
    CourseProgressRowComponent,
    QuizParticipationPageComponent,
    UpcomingAssessmentsPageComponent,
    AssessmentRowComponent,
    MyRegistrationsPageComponent,
    RegistrationRowComponent,
    MyCertificatesPageComponent,
    CertificateRowComponent,
  ],
  imports: [SharedModule, StudentRoutingModule],
})
export class StudentModule {}
