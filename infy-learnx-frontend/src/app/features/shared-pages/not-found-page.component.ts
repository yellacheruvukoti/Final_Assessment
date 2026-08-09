import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AppRoutes } from '../../core/constants/app-routes.constants';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss'],
})
export class NotFoundPageComponent implements OnInit {
  readonly homeRoute = AppRoutes.login;

  constructor(private readonly titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Page Not Found | Infy_LearnX');
  }
}
