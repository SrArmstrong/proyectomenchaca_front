import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { CardModule } from 'primeng/card'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule, InputTextModule, ButtonModule, CardModule ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  secret: string = '';
  qrUrl: string = '';

  campos = [
    { control: 'nombre', label: 'Nombre completo', placeholder: 'Juan Pérez', type: 'text' },
    { control: 'correo', label: 'Correo electrónico', placeholder: 'correo@empresa.com', type: 'email' },
    { control: 'password', label: 'Contraseña', placeholder: '••••••••••••', type: 'password' },
    { control: 'telefono', label: 'Teléfono', placeholder: '4421234567', type: 'text' },
  ];


  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      rol: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      telefono: ['', Validators.required],
    especialidad: [''], 
    });

    // Escucha cambios del campo "rol"
    this.registerForm.get('rol')?.valueChanges.subscribe((rol) => {
      const especialidad = this.registerForm.get('especialidad');

      if (rol === 'medico') {
        especialidad?.setValidators(Validators.required);
      } else {
        especialidad?.clearValidators();
        especialidad?.setValue('');
      }

      especialidad?.updateValueAndValidity();
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe({
      next: (resp) => {
        this.secret = resp.secret;
        // Generar QR desde otpauth_url usando api externa de generación
        this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(resp.otpauth_url)}&size=200x200`;
      },
      error: (err) => {
        console.error('Error en registro:', err);
        alert(err.error?.error || 'Error desconocido');
      }
    });
  }
}
