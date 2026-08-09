import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PaginationComponent],
    });
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  function setInputs(overrides: Partial<PaginationComponent>): void {
    Object.assign(component, overrides);
    fixture.detectChanges();
  }

  it('computes "Showing X-Y of Z results" for the first page', () => {
    setInputs({ totalElements: 45, pageSize: 10, currentPage: 1, totalPages: 5 });
    expect(component.summaryText).toBe('Showing 1–10 of 45 results');
  });

  it('computes "Showing X-Y of Z results" for a partial last page', () => {
    setInputs({ totalElements: 45, pageSize: 10, currentPage: 5, totalPages: 5 });
    expect(component.summaryText).toBe('Showing 41–45 of 45 results');
  });

  it('shows zero results when there is no data', () => {
    setInputs({ totalElements: 0, pageSize: 10, currentPage: 1, totalPages: 0 });
    expect(component.summaryText).toBe('Showing 0 of 0 results');
  });

  it('disables Previous on the first page only', () => {
    setInputs({ currentPage: 1, totalPages: 5 });
    expect(component.isPreviousDisabled).toBe(true);
    expect(component.isNextDisabled).toBe(false);
  });

  it('disables Next on the last page only', () => {
    setInputs({ currentPage: 5, totalPages: 5 });
    expect(component.isNextDisabled).toBe(true);
    expect(component.isPreviousDisabled).toBe(false);
  });

  it('emits a 0-based page index on Next', () => {
    setInputs({ currentPage: 2, totalPages: 5 });
    const spy = jasmine.createSpy('pageChange');
    component.pageChange.subscribe(spy);
    component.onNext();
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('emits a 0-based page index on Previous', () => {
    setInputs({ currentPage: 3, totalPages: 5 });
    const spy = jasmine.createSpy('pageChange');
    component.pageChange.subscribe(spy);
    component.onPrevious();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('does not emit when Previous is disabled', () => {
    setInputs({ currentPage: 1, totalPages: 5 });
    const spy = jasmine.createSpy('pageChange');
    component.pageChange.subscribe(spy);
    component.onPrevious();
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not emit when Next is disabled', () => {
    setInputs({ currentPage: 5, totalPages: 5 });
    const spy = jasmine.createSpy('pageChange');
    component.pageChange.subscribe(spy);
    component.onNext();
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits the selected page size on change', () => {
    setInputs({ pageSizeOptions: [10, 20, 50] });
    const spy = jasmine.createSpy('pageSizeChange');
    component.pageSizeChange.subscribe(spy);
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalledWith(20);
  });
});
