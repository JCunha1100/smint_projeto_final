import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;

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
    
    // Se já estiver autenticado, redireciona para home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  initForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      const toast = await this.toastController.create({
        message: 'Por favor, preencha todos os campos corretamente',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Entrando...',
      spinner: 'crescent'
    });
    await loading.present();

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        if (response.success) {
          const toast = await this.toastController.create({
            message: 'Login realizado com sucesso!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
          
          this.router.navigate(['/home']);
        } else {
          const alert = await this.alertController.create({
            header: 'Erro',
            message: response.message || 'Email ou senha incorretos',
            buttons: ['OK']
          });
          await alert.present();
        }
      },
      error: async (error) => {
        await loading.dismiss();
        
        const alert = await this.alertController.create({
          header: 'Erro',
          message: 'Não foi possível realizar o login. Verifique suas credenciais e tente novamente.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Password',
      message: 'Funcionalidade em desenvolvimento. Será implementada em breve.',
      buttons: ['OK']
    });

    await alert.present();
  }

  goToRegister() {
    this.router.navigate(['/registar']);
  }

}
