import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';
import { InstructorLayoutComponent } from './instructor-layout.component';
import { AssessmentCreatePageComponent } from './pages/assessment-create/assessment-create-page.component';
import { AssessmentEditPageComponent } from './pages/assessment-edit/assessment-edit-page.component';
import { AssessmentManagementPageComponent } from './pages/assessment-management/assessment-management-page.component';
import { ContentUploadPageComponent } from './pages/content-upload/content-upload-page.component';
import { CourseCreatePageComponent } from './pages/course-create/course-create-page.component';
import { CourseEditPageComponent } from './pages/course-edit/course-edit-page.component';
import { CourseManagementPageComponent } from './pages/course-management/course-management-page.component';
import { InstructorDashboardPageComponent } from './pages/dashboard/instructor-dashboard-page.component';
import { LearnerPerformancePageComponent } from './pages/learner-performance/learner-performance-page.component';
import { ModuleManagementPageComponent } from './pages/module-management/module-management-page.component';
import { QuizCreatePageComponent } from './pages/quiz-create/quiz-create-page.component';
import { QuizEditPageComponent } from './pages/quiz-edit/quiz-edit-page.component';
import { QuizManagementPageComponent } from './pages/quiz-management/quiz-management-page.component';
import { RegistrationSummaryPageComponent } from './pages/registration-summary/registration-summary-page.component';

// All 14 instructor page routes per ui-model.md Section 1.3. All now use
// their real page components (I-04 delivered 5, I-05 delivered the
// remaining 9). Create/Edit pages are structural shells per I-05's scope —
// form validators/cross-field rules/dynamic dropdowns land in J-02/J-03.
const routes: Routes = [
  {
    path: '',
    component: InstructorLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: InstructorDashboardPageComponent,
        data: { title: 'Instructor Dashboard' },
      },
      {
        path: 'courses',
        component: CourseManagementPageComponent,
        data: { title: 'Course Management' },
      },
      {
        path: 'courses/new',
        component: CourseCreatePageComponent,
        data: { title: 'Course Create' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'courses/:courseId/edit',
        component: CourseEditPageComponent,
        data: { title: 'Course Edit' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'courses/:courseId/modules',
        component: ModuleManagementPageComponent,
        data: { title: 'Module Management' },
      },
      {
        path: 'courses/:courseId/materials/new',
        component: ContentUploadPageComponent,
        data: { title: 'Content Upload' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'courses/:courseId/quizzes',
        component: QuizManagementPageComponent,
        data: { title: 'Quiz Management' },
      },
      {
        path: 'quizzes/new',
        component: QuizCreatePageComponent,
        data: { title: 'Quiz Create' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'quizzes/:quizId/edit',
        component: QuizEditPageComponent,
        data: { title: 'Quiz Edit' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'assessments',
        component: AssessmentManagementPageComponent,
        data: { title: 'Assessment Management' },
      },
      {
        path: 'assessments/new',
        component: AssessmentCreatePageComponent,
        data: { title: 'Assessment Create' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'assessments/:assessmentId/edit',
        component: AssessmentEditPageComponent,
        data: { title: 'Assessment Edit' },
        canDeactivate: [UnsavedChangesGuard],
      },
      {
        path: 'performance',
        component: LearnerPerformancePageComponent,
        data: { title: 'Learner Performance' },
      },
      {
        path: 'summary/:batchId',
        component: RegistrationSummaryPageComponent,
        data: { title: 'Registration Summary' },
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstructorRoutingModule {}
