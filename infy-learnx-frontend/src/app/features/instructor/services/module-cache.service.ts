import { Injectable } from '@angular/core';

import { CourseModuleResponse } from '../../../core/models/module.model';

// KNOWN BACKEND GAP: there is no `GET /api/courses/{id}/modules` list
// endpoint — verified live (405 Method Not Allowed) and confirmed against
// the learning-service source: `CourseController` only wires
// `POST /api/courses/{id}/modules` (addModule); no @GetMapping for a list
// exists anywhere, and no other endpoint returns module title/order data
// (materials carry a bare moduleId with no title). There is therefore no
// way to reconstruct a course's existing module list from the backend at
// all.
//
// This service is a session-only, in-memory cache of modules this
// instructor has added (real POST responses, not fabricated data) so that
// ModuleManagementPageComponent's list and ContentUploadPageComponent's
// module dropdown stay consistent with each other within one browser
// session. It cannot show modules created in a previous session or by
// another user — that is an honest limitation of the underlying gap, not
// a bug in this cache.
@Injectable({ providedIn: 'root' })
export class ModuleCacheService {
  private readonly modulesByCourse = new Map<string, CourseModuleResponse[]>();

  getModules(courseId: string): CourseModuleResponse[] {
    return this.modulesByCourse.get(courseId) ?? [];
  }

  addModule(courseId: string, module: CourseModuleResponse): void {
    const updated = [...this.getModules(courseId), module].sort((a, b) => a.moduleOrder - b.moduleOrder);
    this.modulesByCourse.set(courseId, updated);
  }
}
