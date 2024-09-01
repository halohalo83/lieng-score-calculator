import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NzGridModule, NzButtonComponent, NgxSpinnerModule],
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

  redirectToAuthUrl() {
    this.apiService.getAuthUrl().then((response) => {
      const anchor = document.createElement('a');
      anchor.href = response.authUrl;
      anchor.target = '_blank';
      anchor.click();
    });
  }

  openRankings() {
    this.router.navigate(['/ranking']);
  }

  openSheetLink() {
    window.open('https://docs.google.com/spreadsheets/d/10ioKPL3Y4jofGZCCMJoFpFsl4tk5XBX-LuFN3XZSVKs/edit?usp=sharing', '_blank');
  }
}
