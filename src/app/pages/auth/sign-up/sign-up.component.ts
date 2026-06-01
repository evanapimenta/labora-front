import { Component } from '@angular/core';
import { IconLockDotsComponent } from '../../../icons/icon-lock-dots';
import { IconMailComponent } from '../../../icons/icon-mail';
import { Router, RouterLink } from '@angular/router';
import { IconUserComponent } from '../../../icons/icon-user';
import { AuthController } from '../../../core/controllers/auth.controller';
import { FormControl,ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink ,IconMailComponent, IconLockDotsComponent, IconUserComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  constructor(private authController: AuthController, private router: Router){}
  
    form!: UntypedFormGroup;
    ngOnInit(): void {
      this.createForm();
    }
  
    createForm = () => {
      this.form = new UntypedFormGroup({
        name: new FormControl(null, [Validators.required]),
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [Validators.required]),
        confirmPassword: new FormControl(null, [Validators.required]),
      })
   }
  
   register = () => {
    debugger
    this.authController.register(this.form.value).then((resp: any) => {
      this.router.navigate(['/']);
    })
   }
}
