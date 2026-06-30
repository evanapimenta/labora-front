import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../../components/form-input/form-input.component';
import { PatientController } from '../../core/controllers/patient.controller';
import { UserController } from '../../core/controllers/user.controller';
import { NgxCustomModalComponent } from 'ngx-custom-modal';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, FormInputComponent, NgxCustomModalComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  isBrowser = false;

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
  patient: any = null;

  constructor(
    private patientController: PatientController,
    private userController: UserController,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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
        this.patient = patient;
        this.user.firstName = patient.userInfoDTO?.name || '';
        this.user.email = patient.userInfoDTO?.email || '';
        this.user.imagePathUrl = patient.userInfoDTO?.imagePathUrl || '';
        this.user.phoneNumber = patient.phoneNumber || '';
        this.user.dateOfBirth = this.formatBirthDate(patient.birthDate);
        this.loading = false;
      },
      error: (err: any) => {
        console.warn('Paciente não encontrado. Tentando usuário genérico:', err);
        this.patient = null;
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

  formatGender(gender: string): string {
    if (!gender) return '—';
    if (gender === 'FEMININO') return 'Feminino';
    if (gender === 'MASCULINO') return 'Masculino';
    if (gender === 'OUTRO') return 'Outro';
    if (gender === 'PREFIRO_NAO_DIZER') return 'Prefiro não responder';
    return gender;
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

  @ViewChild('passwordModal') passwordModal!: any;
  newPassword = '';
  confirmNewPassword = '';
  passwordSaving = false;
  passwordError: string | null = null;
  passwordSuccess = false;

  onChangePassword() {
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.passwordError = null;
    this.passwordSuccess = false;
    this.passwordModal.open();
  }

  submitPasswordChange() {
    if (!this.newPassword || this.newPassword.length < 8) {
      this.passwordError = 'A senha deve conter no mínimo 8 caracteres.';
      this.notificationService.error(this.passwordError);
      return;
    }
    const hasUpper = /[A-Z]/.test(this.newPassword);
    const hasLower = /[a-z]/.test(this.newPassword);
    const hasDigit = /\d/.test(this.newPassword);
    if (!hasUpper || !hasLower || !hasDigit) {
      this.passwordError = 'A senha deve conter letras maiúsculas, minúsculas e números.';
      this.notificationService.error(this.passwordError);
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'As senhas não coincidem.';
      this.notificationService.error(this.passwordError);
      return;
    }

    this.passwordSaving = true;
    this.passwordError = null;

    this.userController.changePassword(this.user.id, { password: this.newPassword }).subscribe({
      next: () => {
        this.passwordSaving = false;
        this.passwordSuccess = true;
        this.notificationService.success('Senha alterada com sucesso!');
        setTimeout(() => {
          this.passwordModal.close();
        }, 1500);
      },
      error: (err: any) => {
        this.passwordSaving = false;
        this.passwordError = err?.message || 'Erro ao alterar a senha. Tente novamente.';
        const toastMsg = this.notificationService.getErrorMsg(err);
        this.notificationService.error(toastMsg);
      }
    });
  }

  isEditing = false;
  saving = false;

  editData = {
    name: '',
    phoneNumber: '',
    gender: '',
    weight: null as number | null,
    height: null as number | null,
    insured: false,
    insuranceName: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    address: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      country: 'Brasil'
    }
  };

  startEdit() {
    this.editData = {
      name: this.patient?.userInfoDTO?.name || this.user.firstName || '',
      phoneNumber: this.patient?.phoneNumber || '',
      gender: this.patient?.gender || 'PREFIRO_NAO_DIZER',
      weight: this.patient?.weight || null,
      height: this.patient?.height || null,
      insured: this.patient?.insured || false,
      insuranceName: this.patient?.insuranceName || '',
      emergencyContactName: this.patient?.emergencyContactName || '',
      emergencyContactNumber: this.patient?.emergencyContactNumber || '',
      address: {
        zipCode: this.patient?.address?.zipCode || '',
        street: this.patient?.address?.street || '',
        number: this.patient?.address?.number || '',
        complement: this.patient?.address?.complement || '',
        neighborhood: this.patient?.address?.neighborhood || '',
        city: this.patient?.address?.city || '',
        state: this.patient?.address?.state || '',
        country: this.patient?.address?.country || 'Brasil'
      }
    };
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveProfile() {
    if (!this.editData.name.trim()) {
      this.notificationService.error('O nome completo não pode estar vazio.');
      return;
    }

    this.saving = true;
    this.errorMsg = null;

    // 1. Update user name
    const userUpdate = this.userController.update(this.user.id, { name: this.editData.name });

    // 2. Update patient details
    const patientPayload = {
      phoneNumber: this.editData.phoneNumber,
      gender: this.editData.gender,
      weight: this.editData.weight,
      height: this.editData.height,
      insured: this.editData.insured,
      insuranceName: this.editData.insured ? this.editData.insuranceName : '',
      emergencyContactName: this.editData.emergencyContactName,
      emergencyContactNumber: this.editData.emergencyContactNumber,
      addressDTO: {
        zipCode: this.editData.address.zipCode,
        street: this.editData.address.street,
        number: this.editData.address.number,
        complement: this.editData.address.complement,
        neighborhood: this.editData.address.neighborhood,
        city: this.editData.address.city,
        state: this.editData.address.state,
        country: this.editData.address.country
      }
    };

    const patientUpdate = this.patientController.update(this.user.id, patientPayload);

    userUpdate.subscribe({
      next: () => {
        if (this.patient) {
          patientUpdate.subscribe({
            next: () => {
              this.notificationService.success('Perfil atualizado com sucesso!');
              this.isEditing = false;
              this.saving = false;
              this.loadProfile();
            },
            error: (err: any) => {
              console.error('Erro ao atualizar dados do paciente:', err);
              this.errorMsg = 'Erro ao atualizar dados adicionais.';
              this.notificationService.error(this.notificationService.getErrorMsg(err));
              this.saving = false;
            }
          });
        } else {
          this.notificationService.success('Nome do perfil atualizado com sucesso!');
          this.isEditing = false;
          this.saving = false;
          this.loadProfile();
        }
      },
      error: (err: any) => {
        console.error('Erro ao atualizar nome do usuário:', err);
        this.errorMsg = 'Erro ao atualizar nome do usuário.';
        this.notificationService.error(this.notificationService.getErrorMsg(err));
        this.saving = false;
      }
    });
  }
}