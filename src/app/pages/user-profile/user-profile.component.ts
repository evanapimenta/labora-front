import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../../components/form-input/form-input.component';
import { PatientController } from '../../core/controllers/patient.controller';
import { UserController } from '../../core/controllers/user.controller';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, FormInputComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {


  user = {
    id: '',
    firstName: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    imagePathUrl: '',
    role: ''
  };

  loading = false;
  errorMsg: string | null = null;

  constructor(
    private patientController: PatientController,
    private userController: UserController
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }


  loadProfile() {
    const tokenPayload = this.getDecodedToken();
    if (!tokenPayload || !tokenPayload.id) {
      this.errorMsg = 'Usuário não autenticado ou token inválido.';
      return;
    }

    const userId = tokenPayload.id;
    this.user.id = userId;

    const tokenRole = tokenPayload.role || '';
    this.user.role = this.mapRole(tokenRole);

    this.loading = true;

    this.patientController.getById(userId).subscribe({
      next: (patient: any) => {
        this.user.firstName = patient.userInfoDTO?.name || '';
        this.user.email = patient.userInfoDTO?.email || '';
        this.user.imagePathUrl = patient.userInfoDTO?.imagePathUrl || '';
        this.user.phoneNumber = patient.phoneNumber || '';
        this.user.dateOfBirth = this.formatBirthDate(patient.birthDate);
        this.loading = false;
      },
      error: (err: any) => {
        console.warn('Paciente não encontrado. Tentando usuário genérico:', err);
        this.userController.getById(userId).subscribe({
          next: (user: any) => {
            this.user.firstName = user.name || '';
            this.user.email = user.email || '';
            this.user.imagePathUrl = user.imagePathUrl || '';
            this.user.phoneNumber = 'Não disponível';
            this.user.dateOfBirth = 'Não disponível';
            this.loading = false;
          },
          error: (userErr: any) => {
            console.error('Erro ao buscar dados do usuário:', userErr);
            this.errorMsg = 'Não foi possível carregar os dados do perfil.';
            this.loading = false;
          }
        });
      }
    });
  }

  getDecodedToken(): any {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const accessStr = localStorage.getItem('access');
    if (!accessStr) return null;
    try {
      const accessObj = JSON.parse(accessStr);
      const token = accessObj.accessToken;
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  mapRole(role: string): string {
    if (!role) return 'Usuário';
    if (role === 'PATIENT') return 'Paciente';
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'SUPER_ADMIN') return 'Super Administrador';
    return role;
  }

  formatBirthDate(dateVal: any): string {
    if (!dateVal) return '';
    if (Array.isArray(dateVal) && dateVal.length >= 3) {
      const yyyy = dateVal[0];
      const mm = String(dateVal[1]).padStart(2, '0');
      const dd = String(dateVal[2]).padStart(2, '0');
      return `${dd}/${mm}/${yyyy}`;
    }
    if (typeof dateVal === 'string') {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return String(dateVal);
  }

  getProfileImageUrl(): string {
    if (this.user.imagePathUrl) {
      if (this.user.imagePathUrl.startsWith('/images/profile/')) {
        return `http://localhost:8080${this.user.imagePathUrl}`;
      }
      return this.user.imagePathUrl;
    }
    return '/assets/images/profile.png';
  }

  getUserInitials(): string {
    if (!this.user.firstName) return '?';
    const parts = this.user.firstName.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  onChangePassword() {
    alert('Redirecionando para alteração de senha...');
  }
}