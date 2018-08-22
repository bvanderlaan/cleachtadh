import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';

import { AppRoutingModule } from './app-routing.module';
import { RootComponent } from './root/root.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { AddKataComponent } from './kata';

const markedOptions = {
  provide: MarkedOptions,
  useFactory() : MarkedOptions {
    const renderer = new MarkedRenderer();
    renderer.blockquote = (text: string) => (
      `<blockquote class="blockquote"><p>${text}</p></blockquote>`
    );

    return {
      renderer,
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
    };
  },
};

@NgModule({
  declarations: [
    RootComponent,
    FooterComponent,
    HeaderComponent,
    AboutComponent,
    AddKataComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MarkdownModule.forRoot({ markedOptions }),
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
