import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { DataTableColumn, DataTableComponent } from './data-table.component';

interface TestRow {
  id: string;
  title: string;
}

describe('DataTableComponent', () => {
  let fixture: ComponentFixture<DataTableComponent<TestRow>>;
  let component: DataTableComponent<TestRow>;

  const columns: DataTableColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title', sortable: true },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [DataTableComponent, SkeletonLoaderComponent, EmptyStateComponent, PaginationComponent],
    });
    fixture = TestBed.createComponent(
      DataTableComponent,
    ) as unknown as ComponentFixture<DataTableComponent<TestRow>>;
    component = fixture.componentInstance;
    component.columns = columns;
  });

  it('shows the skeleton loader while loading', () => {
    component.isLoading = true;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(SkeletonLoaderComponent))).toBeTruthy();
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });

  it('shows the empty state when there are no rows and loading has finished', () => {
    component.isLoading = false;
    component.rows = [];
    component.emptyMessage = 'No courses found.';
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.directive(EmptyStateComponent));
    expect(emptyState).toBeTruthy();
    expect(emptyState.componentInstance.message).toBe('No courses found.');
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });

  it('renders rows when data is present', () => {
    component.isLoading = false;
    component.rows = [
      { id: '1', title: 'Java Foundations' },
      { id: '2', title: 'Spring Boot' },
    ];
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Java Foundations');
  });

  it('emits sortChange with the toggled direction when a sortable header is clicked', () => {
    component.isLoading = false;
    component.rows = [{ id: '1', title: 'Java Foundations' }];
    component.currentSort = { field: 'title', direction: 'asc' };
    fixture.detectChanges();

    const spy = jasmine.createSpy('sortChange');
    component.sortChange.subscribe(spy);

    const sortButton: HTMLButtonElement = fixture.nativeElement.querySelector('.data-table__sort-button');
    sortButton.click();

    expect(spy).toHaveBeenCalledWith({ field: 'title', direction: 'desc' });
  });

  it('renders no sort button for non-sortable columns', () => {
    component.isLoading = false;
    component.rows = [{ id: '1', title: 'Java Foundations' }];
    fixture.detectChanges();

    const sortButtons = fixture.nativeElement.querySelectorAll('.data-table__sort-button');
    expect(sortButtons.length).toBe(1);
  });

  it('renders pagination below the table and forwards page/page-size changes', () => {
    component.isLoading = false;
    component.rows = [{ id: '1', title: 'Java Foundations' }];
    component.totalElements = 25;
    component.totalPages = 3;
    component.currentPage = 1;
    component.pageSize = 10;
    fixture.detectChanges();

    const pageSpy = jasmine.createSpy('pageChange');
    const sizeSpy = jasmine.createSpy('pageSizeChange');
    component.pageChange.subscribe(pageSpy);
    component.pageSizeChange.subscribe(sizeSpy);

    const paginationDebugEl = fixture.debugElement.query(By.directive(PaginationComponent));
    expect(paginationDebugEl).toBeTruthy();

    const pagination = paginationDebugEl.componentInstance as PaginationComponent;
    pagination.pageChange.emit(1);
    pagination.pageSizeChange.emit(20);

    expect(pageSpy).toHaveBeenCalledWith(1);
    expect(sizeSpy).toHaveBeenCalledWith(20);
  });
});
