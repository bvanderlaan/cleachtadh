import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { SignupComponent } from './signup/signup.component';
import {
  AddKataComponent,
  KataComponent,
  KataListComponent,
} from './kata';

const routes: Routes = [{
    path: '',
    component: HomeComponent,
  }, {
    path: 'about',
    component: AboutComponent,
  }, {
    path: 'addkata',
    component: AddKataComponent,
    canActivate: [AuthenticationGuard],
  }, {
    path: 'katas/:id',
    component: KataComponent,
  }, {
    path: 'login',
    component: AuthenticationComponent,
  }, {
    path: 'signup',
    component: SignupComponent,
  }, {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
  AboutComponent,
  AuthenticationComponent,
  SignupComponent,
  HomeComponent,
  AddKataComponent,
  KataComponent,
  KataListComponent,
];
