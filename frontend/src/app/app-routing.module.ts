import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { AddKataComponent } from './kata';

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
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
