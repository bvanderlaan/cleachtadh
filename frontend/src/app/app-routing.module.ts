import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { AddKataComponent } from './kata';

const routes: Routes = [{
    path: 'about',
    component: AboutComponent,
  }, {
    path: 'addkata',
    component: AddKataComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
