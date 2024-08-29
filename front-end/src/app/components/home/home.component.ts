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
    NzIconModule
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
    private fb: FormBuilder
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.getAllSheets();
    this.form = this.fb.group({
      numberOfPlayers: [6, Validators.required],
      initialScore: [2, Validators.required],
      selectedSheetId: [null, Validators.required]
    });
  }

  startGame() {
    this.gameService.setInitialScore(this.form.get('initialScore')?.value || 0);

    this.gameService.setSelectedSheet(this.form.get('selectedSheetId')?.value);

    this.router.navigate(['/player-entry'], {
      queryParams: {
        players: this.form.get('numberOfPlayers')?.value,
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
      if (response.success && response.result.length > 0) {
        this.sheets = response.result;
        this.form.get('selectedSheetId')?.setValue(this.sheets[this.sheets.length - 1].sheetId);
      }
    } catch (error) {
      console.error('Error getting all sheets:', error);
    }
  }

  deleteSheet() {

  }
}
