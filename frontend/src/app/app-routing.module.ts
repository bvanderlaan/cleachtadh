import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
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
  }, {
    path: 'katas/:id',
    component: KataComponent,
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
  HomeComponent,
  AddKataComponent,
  KataComponent,
  KataListComponent,
];
