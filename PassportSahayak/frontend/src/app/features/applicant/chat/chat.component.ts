import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ChatMessage, Citation } from '../../../core/models/chat.model';
import { ApplicationResponse } from '../../../core/models/application.model';

@Component({
  selector: 'ps-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  sessionId: string | null = null;
  sending = false;
  applications: ApplicationResponse[] = [];

  form = this.fb.group({
    query: [''],
    arn: [null as string | null]
  });

  suggestions = [
    'What is the ECR and ECNR classification for passports?',
    'What documents are required for a Tatkal passport?',
    'What is my application status?',
    'How long does police verification usually take?'
  ];

  private shouldScroll = false;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.applicationService.mine().subscribe((res) => (this.applications = res));
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  useSuggestion(text: string): void {
    this.form.controls.query.setValue(text);
  }

  send(): void {
    const query = (this.form.controls.query.value || '').trim();
    if (!query || this.sending) return;

    this.messages.push({ role: 'user', text: query });
    const assistantMsg: ChatMessage = { role: 'assistant', text: '', pending: true };
    this.messages.push(assistantMsg);
    this.form.controls.query.setValue('');
    this.sending = true;
    this.shouldScroll = true;

    const arn = this.form.controls.arn.value;
    this.chatService.streamAsync(
      { sessionId: this.sessionId, query, arn: arn || null },
      (token) => {
        assistantMsg.text += token;
        this.shouldScroll = true;
      },
      (sessionId, citations) => {
        this.sessionId = sessionId;
        assistantMsg.citations = citations as Citation[];
        assistantMsg.pending = false;
        this.sending = false;
        this.shouldScroll = true;
      },
      () => {
        assistantMsg.pending = false;
        if (!assistantMsg.text) {
          assistantMsg.text = 'Sorry, something went wrong while reaching the assistant. Please try again.';
        }
        this.sending = false;
      }
    );
  }
}
