import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssessmentQuizzesPageComponent } from './pages/assessment-quizzes/assessment-quizzes-page.component';
import { CourseCatalogPageComponent } from './pages/course-catalog/course-catalog-page.component';
import { CourseDetailPageComponent } from './pages/course-detail/course-detail-page.component';
import { CourseMaterialsPageComponent } from './pages/course-materials/course-materials-page.component';
import { StudentDashboardPageComponent } from './pages/dashboard/student-dashboard-page.component';
import { MyCertificatesPageComponent } from './pages/my-certificates/my-certificates-page.component';
import { MyProgressPageComponent } from './pages/my-progress/my-progress-page.component';
import { MyRegistrationsPageComponent } from './pages/my-registrations/my-registrations-page.component';
import { QuizAttemptPageComponent } from './pages/quiz-attempt/quiz-attempt-page.component';
import { QuizParticipationPageComponent } from './pages/quiz-participation/quiz-participation-page.component';
import { UpcomingAssessmentsPageComponent } from './pages/upcoming-assessments/upcoming-assessments-page.component';
import { StudentLayoutComponent } from './student-layout.component';

// All 9 student page routes per ui-model.md Section 1.2, now all real
// (I-02 + I-03 complete). No more placeholder component references.
const routes: Routes = [
  {
    path: '',
    component: StudentLayoutComponent,
    children: [
      { path: 'dashboard', component: StudentDashboardPageComponent, data: { title: 'Dashboard' } },
      { path: 'courses', component: CourseCatalogPageComponent, data: { title: 'Course Catalog' } },
      {
        path: 'courses/:courseId',
        component: CourseDetailPageComponent,
        data: { title: 'Course Detail' },
      },
      {
        path: 'courses/:courseId/materials',
        component: CourseMaterialsPageComponent,
        data: { title: 'Course Materials' },
      },
      {
        path: 'courses/:courseId/quizzes',
        component: QuizParticipationPageComponent,
        data: { title: 'Quizzes' },
      },
      { path: 'progress', component: MyProgressPageComponent, data: { title: 'My Progress' } },
      {
        path: 'assessments',
        component: UpcomingAssessmentsPageComponent,
        data: { title: 'Upcoming Assessments' },
      },
      {
        path: 'assessments/:assessmentId/quizzes',
        component: AssessmentQuizzesPageComponent,
        data: { title: 'Assessment Quizzes' },
      },
      {
        path: 'quizzes/:quizId/attempt',
        component: QuizAttemptPageComponent,
        data: { title: 'Take Quiz' },
      },
      {
        path: 'registrations',
        component: MyRegistrationsPageComponent,
        data: { title: 'My Registrations' },
      },
      {
        path: 'certificates',
        component: MyCertificatesPageComponent,
        data: { title: 'My Certificates' },
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentRoutingModule {}
