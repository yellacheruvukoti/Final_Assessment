import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-service-unavailable-page',
  templateUrl: './service-unavailable-page.component.html',
  styleUrls: ['./service-unavailable-page.component.scss'],
})
export class ServiceUnavailablePageComponent implements OnInit {
  constructor(private readonly titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Service Unavailable | Infy_LearnX');
  }

  retry(): void {
    window.location.reload();
  }
}
