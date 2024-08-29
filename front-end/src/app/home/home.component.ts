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
import {
  NzInputNumberModule
} from 'ng-zorro-antd/input-number';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { ApiService } from '../api.service';
import { GameService } from '../game-service.service';
import { CommonModule, NgIf } from '@angular/common';
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
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  form!: FormGroup;
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
    this.form = this.fb.group({
      numberOfPlayers: ['', Validators.required],
      initialScore: ['', Validators.required],
    });
  }

  startGame() {
    this.gameService.setInitialScore(this.form.get('initialScore')?.value || 0);

    this.apiService.startGame().subscribe((response) => {
      console.log(response);
    });
    this.router.navigate(['/player-entry'], {
      queryParams: {
        players: this.form.get('numberOfPlayers')?.value,
        initialScore: this.form.get('initialScore')?.value,
      },
    });
  }
}
