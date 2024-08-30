import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ApiService } from '../../api.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FlipCardComponent } from '../flip-card/flip-card.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    NzGridModule,
    NzButtonComponent,
    NgxSpinnerModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  isAuth = false;
  constructor(private router: Router, private apiService: ApiService) {
    this.checkAuth();
  }

  start() {
    this.router.navigate(['/home']);
  }

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.isAuth = true;
    }
  }

  openRankings() {
    this.router.navigate(['/ranking']);
  }
}
