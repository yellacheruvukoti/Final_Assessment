import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { QuestionType } from '../../../../core/models/quiz-question.model';

// Receives the question FormGroup via @Input — the parent page (Quiz
// Create/Edit) builds it already seeded with 2 blank options, so this
// component only manipulates that group's own `options` FormArray
// (add/remove option rows); it does not own the parent's `questions`
// FormArray. "Remove Question" is delegated up via the `removeQuestion`
// output because removing THIS question from the parent's FormArray, plus
// the ConfirmationDialogComponent confirmation, are the parent page's
// responsibility (frontend-tasks.md J-03).
@Component({
  selector: 'app-quiz-question-block',
  templateUrl: './quiz-question-block.component.html',
  styleUrls: ['./quiz-question-block.component.scss'],
})
export class QuizQuestionBlockComponent {
  @Input({ required: true }) questionGroup!: FormGroup;
  @Input() index = 0;
  // Quiz Edit's single add-new-question form has no parent array to remove
  // this question from — the button is hidden there rather than wired to a
  // no-op.
  @Input() showRemoveButton = true;

  @Output() readonly removeQuestion = new EventEmitter<void>();

  readonly questionTypeOptions = Object.values(QuestionType);

  get options(): FormArray {
    return this.questionGroup.get('options') as FormArray;
  }

  get optionControls(): FormControl[] {
    return this.options.controls as FormControl[];
  }

  addOption(): void {
    this.options.push(new FormControl('', Validators.required));
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  onRemoveQuestion(): void {
    this.removeQuestion.emit();
  }
}
