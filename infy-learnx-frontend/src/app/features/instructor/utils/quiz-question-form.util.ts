import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { QuestionType } from '../../../core/models/quiz-question.model';
import { CreateQuizQuestionRequest } from '../../../core/models/quiz-request.model';
import { correctKeyMatchesOptionValidator } from '../../../shared/validators/correct-key-matches.validator';
import { minOptionsValidator } from '../../../shared/validators/min-options.validator';
import { positiveIntegerValidator } from '../../../shared/validators/positive-integer.validator';

// Shared by QuizCreatePageComponent and QuizEditPageComponent's
// add-new-question form (frontend-tasks.md J-03) so the question
// FormGroup shape and the optionSet/correctAnswerKey conversion logic
// exist in exactly one place.
export function buildQuizQuestionGroup(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group(
    {
      questionText: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
      questionType: [QuestionType.MCQ, Validators.required],
      marks: [null, [Validators.required, positiveIntegerValidator]],
      options: formBuilder.array(
        [formBuilder.control('', Validators.required), formBuilder.control('', Validators.required)],
        minOptionsValidator,
      ),
      correctAnswerKey: ['', Validators.required],
    },
    { validators: correctKeyMatchesOptionValidator },
  );
}

export function resetQuizQuestionGroup(group: FormGroup): void {
  const options = group.get('options') as FormArray;
  while (options.length > 0) {
    options.removeAt(0);
  }
  options.push(new FormControl('', Validators.required));
  options.push(new FormControl('', Validators.required));
  group.reset({ questionType: QuestionType.MCQ });
}

// optionSet format verified live against real seeded questions:
// "A:extends,B:implements,C:super,D:abstract" — a comma-separated list of
// KEY:LABEL pairs, correctAnswerKey holding just the key. Keys are derived
// from option position (A, B, C, ...) since the UI lets the instructor
// pick the correct option by its label text, not by typing a raw key.
export function toQuizQuestionRequest(question: Record<string, unknown>): CreateQuizQuestionRequest {
  const options = question['options'] as string[];
  const optionSet = options.map((label, index) => `${letterFor(index)}:${label}`).join(',');
  const correctIndex = options.indexOf(question['correctAnswerKey'] as string);
  return {
    questionText: question['questionText'] as string,
    questionType: question['questionType'] as QuestionType,
    difficultyLevel: null,
    marks: question['marks'] as number,
    optionSet,
    correctAnswerKey: letterFor(correctIndex),
  };
}

function letterFor(index: number): string {
  return String.fromCharCode(65 + index);
}
