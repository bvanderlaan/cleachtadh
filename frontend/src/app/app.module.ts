import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { RootComponent } from './root/root.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { AuthenticationGuard, AdminGuard } from './authentication';

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
    routingComponents,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MarkdownModule.forRoot({ markedOptions }),
    UiSwitchModule,
    NgxPaginationModule,
  ],
  providers: [AuthenticationGuard, AdminGuard],
  bootstrap: [RootComponent]
})
export class AppModule { }
