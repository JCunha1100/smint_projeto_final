import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registar',
  templateUrl: './registar.page.html',
  styleUrls: ['./registar.page.scss'],
  standalone: false
})
export class RegistarPage implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador customizado para verificar se as passwords coincidem
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      let message = 'Por favor, preencha todos os campos corretamente';
      
      if (this.registerForm.errors?.['passwordMismatch']) {
        message = 'As senhas não coincidem';
      }
      
      const toast = await this.toastController.create({
        message,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Criando conta...',
      spinner: 'crescent'
    });
    await loading.present();

    const { nome, email, password } = this.registerForm.value;

    this.authService.register(nome, email, password).subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        if (response.success) {
          const toast = await this.toastController.create({
            message: 'Conta criada com sucesso!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
          
          this.router.navigate(['/home']);
        } else {
          const alert = await this.alertController.create({
            header: 'Erro',
            message: response.message || 'Não foi possível criar a conta',
            buttons: ['OK']
          });
          await alert.present();
        }
      },
      error: async (error) => {
        await loading.dismiss();
        
        const alert = await this.alertController.create({
          header: 'Erro',
          message: 'Não foi possível criar a conta. Tente novamente mais tarde.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
