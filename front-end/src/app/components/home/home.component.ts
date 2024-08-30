import { Component, NgModule } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { ApiService } from '../../api.service';
import { GameService } from '../../game-service.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { SheetModel } from '../../models/sheet.model';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
FormsModule;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NzSelectComponent,
    NzOptionComponent,
    NzInputNumberModule,
    FormsModule,
    NzButtonComponent,
    NzGridModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NzSelectComponent,
    CommonModule,
    NzIconModule,
    NgxSpinnerModule,
    NzModalModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  form!: FormGroup;
  sheets: SheetModel[] = [];
  constructor(
    private router: Router,
    private gameService: GameService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private modal: NzModalService
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.checkAuth();
    this.form = this.fb.group({
      initialScore: [2, Validators.required],
      selectedSheetId: [null, Validators.required],
    });
  }

  async checkAuth() {
    const response = await this.apiService.checkAuth();
    if (response.success) {
      this.getAllSheets();
    }
  }

  startGame() {
    this.gameService.setInitialScore(this.form.get('initialScore')?.value || 0);

    this.gameService.setSelectedSheet(this.form.get('selectedSheetId')?.value);

    this.router.navigate(['/player-entry'], {
      queryParams: {
        initialScore: this.form.get('initialScore')?.value,
      },
    });
  }

  async createSheet() {
    try {
      const response = await this.apiService.createSheet();
      if (response.success) {
        this.getAllSheets();
      }
    } catch (error) {
      console.error('Error creating sheet:', error);
    }
  }

  async getAllSheets() {
    try {
      const response = await this.apiService.getAllSheets();
      if (response.success) {
        this.sheets = response.result;

        if (this.sheets.length > 0) {
          this.form
            .get('selectedSheetId')
            ?.setValue(this.sheets[this.sheets.length - 1].sheetId);
        }
        else {
          this.form.get('selectedSheetId')?.setValue(null);
        }
      }
    } catch (error) {
      console.error('Error getting all sheets:', error);
    }
  }

  deleteSheet() {
    const sheetId = this.form.get('selectedSheetId')?.value;
    if (!sheetId) {
      return;
    }
    this.modal.confirm({
      nzTitle: 'Có chắc chắn muốn xóa không?',
      nzOkText: 'Xóa mẹ đi',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Đéo',
      nzOnOk: () => {
        this.apiService.deleteSheet(sheetId).then((response) => {
          if (response.success) {
            this.getAllSheets();
          }
        });
      },
      nzOnCancel: () => {
        return;
      },
    });
  }

  back() {
    this.router.navigate(['/']);
  }
}
