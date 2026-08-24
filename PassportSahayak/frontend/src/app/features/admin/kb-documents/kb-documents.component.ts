import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { KbService } from '../../../core/services/kb.service';
import { KbChunkResponse, KbDocumentResponse } from '../../../core/models/kb.model';

@Component({
  selector: 'ps-kb-documents',
  templateUrl: './kb-documents.component.html',
  styleUrls: ['./kb-documents.component.scss']
})
export class KbDocumentsComponent implements OnInit {
  documents: KbDocumentResponse[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = true;
  columns = ['title', 'docCode', 'version', 'status', 'chunks', 'created', 'actions'];

  showIngestForm = false;
  ingesting = false;
  ingestResult: { documentId: string; chunks_created: number } | null = null;

  ingestForm = this.fb.group({
    title: ['', Validators.required],
    docCode: [''],
    version: ['v1.0', Validators.required],
    audience: [''],
    effectiveDate: [null as Date | null],
    tags: [''],
    content: ['', Validators.required]
  });

  viewingChunks: KbDocumentResponse | null = null;
  chunks: KbChunkResponse[] = [];
  loadingChunks = false;

  backfilling = false;
  backfillMessage: string | null = null;

  constructor(private fb: FormBuilder, private kbService: KbService) {}

  ngOnInit(): void {
    this.load();
  }

  onPage(evt: PageEvent): void {
    this.pageIndex = evt.pageIndex;
    this.pageSize = evt.pageSize;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.kbService.list(this.pageIndex, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.documents = res.content;
        this.totalElements = res.totalElements;
      });
  }

  submitIngest(): void {
    if (this.ingestForm.invalid) {
      this.ingestForm.markAllAsTouched();
      return;
    }
    const v = this.ingestForm.getRawValue();
    this.ingesting = true;
    this.ingestResult = null;
    this.kbService.ingest({
      title: v.title!,
      docCode: v.docCode || undefined,
      version: v.version!,
      audience: v.audience || undefined,
      effectiveDate: v.effectiveDate ? this.toIsoDate(v.effectiveDate) : undefined,
      tags: v.tags || undefined,
      content: v.content!
    }).pipe(finalize(() => (this.ingesting = false)))
      .subscribe((res) => {
        this.ingestResult = { documentId: res.documentId, chunks_created: res.chunks_created };
        this.ingestForm.reset({ title: '', docCode: '', version: 'v1.0', audience: '', effectiveDate: null, tags: '', content: '' });
        this.load();
      });
  }

  viewChunks(doc: KbDocumentResponse): void {
    this.viewingChunks = doc;
    this.loadingChunks = true;
    this.kbService.getChunks(doc.documentId)
      .pipe(finalize(() => (this.loadingChunks = false)))
      .subscribe((res) => (this.chunks = res));
  }

  supersede(doc: KbDocumentResponse): void {
    this.kbService.supersede(doc.documentId).subscribe(() => this.load());
  }

  backfillEmbeddings(): void {
    this.backfilling = true;
    this.backfillMessage = null;
    this.kbService.backfillEmbeddings()
      .pipe(finalize(() => (this.backfilling = false)))
      .subscribe((res) => {
        this.backfillMessage = `${res.chunksEmbedded} chunk(s) embedded.`;
        this.load();
      });
  }

  private toIsoDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
