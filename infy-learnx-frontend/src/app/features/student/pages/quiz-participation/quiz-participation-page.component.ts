import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { QuizResponse } from '../../../../core/models/quiz.model';
import { CourseApiService } from '../../services/course-api.service';

@Component({
  selector: 'app-quiz-participation-page',
  templateUrl: './quiz-participation-page.component.html',
  styleUrls: ['./quiz-participation-page.component.scss'],
})
export class QuizParticipationPageComponent implements OnInit {
  private readonly courseId = this.route.snapshot.paramMap.get('courseId') ?? '';

  courseTitle = '';
  quizzes: QuizResponse[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private readonly courseApiService: CourseApiService,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Quizzes | Infy_LearnX');
    this.loadCourseTitle();
    this.loadQuizzes();
  }

  retry(): void {
    this.loadQuizzes();
  }

  private loadCourseTitle(): void {
    this.courseApiService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.courseTitle = course.title;
        this.titleService.setTitle(`Quizzes – ${course.title} | Infy_LearnX`);
      },
    });
  }

  private loadQuizzes(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.courseApiService.getCourseQuizzes(this.courseId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load quizzes. Please try again.';
        this.isLoading = false;
      },
    });
  }
}
