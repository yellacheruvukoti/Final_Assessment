import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { InstructorSummaryCardComponent } from './components/instructor-summary-card/instructor-summary-card.component';
import { ModuleListComponent } from './components/module-list/module-list.component';
import { PerformanceFiltersComponent } from './components/performance-filters/performance-filters.component';
import { QuizQuestionBlockComponent } from './components/quiz-question-block/quiz-question-block.component';
import { SummaryTabsComponent } from './components/summary-tabs/summary-tabs.component';
import { InstructorLayoutComponent } from './instructor-layout.component';
import { InstructorRoutingModule } from './instructor-routing.module';
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

@NgModule({
  declarations: [
    InstructorLayoutComponent,
    InstructorSummaryCardComponent,
    InstructorDashboardPageComponent,
    CourseManagementPageComponent,
    ModuleListComponent,
    ModuleManagementPageComponent,
    ContentUploadPageComponent,
    QuizManagementPageComponent,
    AssessmentManagementPageComponent,
    PerformanceFiltersComponent,
    LearnerPerformancePageComponent,
    SummaryTabsComponent,
    RegistrationSummaryPageComponent,
    CourseCreatePageComponent,
    CourseEditPageComponent,
    QuizQuestionBlockComponent,
    QuizCreatePageComponent,
    QuizEditPageComponent,
    AssessmentCreatePageComponent,
    AssessmentEditPageComponent,
  ],
  imports: [SharedModule, InstructorRoutingModule],
})
export class InstructorModule {}
