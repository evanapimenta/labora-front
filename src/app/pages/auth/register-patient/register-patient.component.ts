import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserController } from '../../../core/controllers/user.controller';
import { PatientController } from '../../../core/controllers/patient.controller';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-patient.component.html'
})
export class RegisterPatientComponent implements OnInit {
  code: string = '';
  verifying: boolean = true;
  verified: boolean = false;
  errorMsg: string | null = null;
  submitting: boolean = false;

  form!: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userController: UserController,
    private patientController: PatientController,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const accessStr = localStorage.getItem('access');
      if (accessStr) {
        try {
          const access = JSON.parse(accessStr);
          if (access && access.accessToken) {
            this.verified = true;
            this.verifying = false;
            this.createForm();
            return;
          }
        } catch (e) {
          // ignorar e prosseguir com código da URL
        }
      }
    }

    this.route.queryParams.subscribe(params => {
      if (this.verified) {
        return;
      }
      this.code = params['code'] || '';
      if (!this.code) {
        this.verifying = false;
        this.errorMsg = 'Código de verificação ausente.';
        return;
      }
      this.verifyUserToken();
    });
  }

  verifyUserToken(): void {
    this.userController.verifyAccount(this.code).subscribe({
      next: (resp: any) => {
        // Armazena as informações de acesso (token JWT) recebidas no sucesso
        if (resp && resp.accessToken) {
          localStorage.setItem('access', JSON.stringify(resp));
          this.verified = true;
          this.verifying = false;
          this.createForm();
          this.notificationService.success('Conta verificada com sucesso! Conclua o seu perfil.');
          // Limpa o código da URL para evitar erros de dupla validação ao recarregar a página
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { code: null },
            queryParamsHandling: 'merge'
          });
        } else {
          this.verifying = false;
          this.errorMsg = 'Erro ao processar ativação de conta.';
          this.notificationService.error(this.errorMsg);
        }
      },
      error: (err: any) => {
        console.error('Erro de verificação:', err);
        this.verifying = false;
        this.errorMsg = err?.message || 'Link de ativação inválido ou já utilizado.';
        const toastMsg = this.notificationService.getErrorMsg(err);
        this.notificationService.error(toastMsg);
      }
    });
  }

  createForm(): void {
    this.form = new UntypedFormGroup({
      cpf: new FormControl('', [Validators.required, this.cpfValidator]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{10,11}$/)]),
      gender: new FormControl('FEMININO', [Validators.required]),
      weight: new FormControl('', [Validators.required, Validators.min(0.5)]),
      height: new FormControl('', [Validators.required, Validators.min(0.3), Validators.max(3.0)]),
      birthDate: new FormControl('', [Validators.required]),
      emergencyContactName: new FormControl('', [Validators.required]),
      emergencyContactNumber: new FormControl('', [Validators.required]),
      insured: new FormControl(false),
      insuranceName: new FormControl(''),
      addressDTO: new UntypedFormGroup({
        zipCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]),
        street: new FormControl('', [Validators.required]),
        number: new FormControl('', [Validators.required]),
        complement: new FormControl(''),
        neighborhood: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('Brasil', [Validators.required])
      })
    });

    // Monitora a flag de convênio para tornar o nome do convênio obrigatório se marcado como "Sim"
    this.form.get('insured')?.valueChanges.subscribe(isInsured => {
      const insuranceControl = this.form.get('insuranceName');
      if (isInsured) {
        insuranceControl?.setValidators([Validators.required]);
      } else {
        insuranceControl?.clearValidators();
        insuranceControl?.setValue('');
      }
      insuranceControl?.updateValueAndValidity();
    });

    // Monitora CEP para buscar endereço automaticamente
    this.form.get('addressDTO.zipCode')?.valueChanges.subscribe(cep => {
      if (cep) {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
          this.searchCep(cleanCep);
        }
      }
    });
  }

  cpfValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const cpf = control.value;
    if (!cpf) return null;
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return { invalidCpf: true };
    if (/^(\d)\1{10}$/.test(cleanCpf)) return { invalidCpf: true };

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(9, 10), 10)) return { invalidCpf: true };

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(10, 11), 10)) return { invalidCpf: true };

    return null;
  }

  searchCep(cep: string): void {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.erro) {
          this.form.patchValue({
            addressDTO: {
              street: data.logradouro || '',
              neighborhood: data.bairro || '',
              city: data.localidade || '',
              state: data.uf || '',
              country: 'Brasil'
            }
          });
        }
      })
      .catch(err => console.error('Erro ao buscar CEP:', err));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markAllAsTouched(this.form);
      this.notificationService.error('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    this.submitting = true;
    const formValue = this.form.value;
    // Garante CPF sem formatação
    formValue.cpf = formValue.cpf.replace(/\D/g, '');
    // Garante CEP sem formatação
    formValue.addressDTO.zipCode = formValue.addressDTO.zipCode.replace(/\D/g, '');

    this.patientController.create(formValue).subscribe({
      next: (resp: any) => {
        this.submitting = false;
        this.notificationService.success('Cadastro de paciente concluído com sucesso!');
        // Redireciona para a home da plataforma onde o usuário já entra autenticado
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Erro ao cadastrar paciente:', err);
        this.errorMsg = err?.message || 'Erro ao cadastrar informações do paciente.';
        const toastMsg = this.notificationService.getErrorMsg(err);
        this.notificationService.error(toastMsg);
      }
    });
  }

  private markAllAsTouched(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }
}
