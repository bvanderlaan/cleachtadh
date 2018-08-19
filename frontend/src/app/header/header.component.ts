import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

const toggleOverlay = (mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.classList.contains('collapsing')) {
      return $('.overlay').addClass('show');
    }

    if (!mutation.target.classList.contains('show')) {
      return $('.overlay').removeClass('show');
    }
  })
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private menuObserver;

  ngOnInit() {
    $(document).ready(() => {
      $('.navbar-nav>li>a').on('click', () => $('.navbar-toggler').click());
      $('.overlay').on('click', () => $('.navbar-toggler').click());
      $('#navigation-menu-close').on('click', () => $('.navbar-toggler').click());

      this.menuObserver = new MutationObserver(toggleOverlay);
      const target = document.getElementById('navigation-menu');
      this.menuObserver.observe(target, {
        attributes: true,
        attributeFilter: ['class'],
      });
    });
  }
}
