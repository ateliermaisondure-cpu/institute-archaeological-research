const menuToggle = document.querySelector('.menu-toggle');
const mainNavigation = document.querySelector('.main-navigation');
const submenuToggle = document.querySelector('.submenu-toggle');
const submenuParent = submenuToggle?.closest('.has-submenu');
const currentYear = document.querySelector('#current-year');

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

menuToggle?.addEventListener('click', () => {
  const isOpen = mainNavigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

submenuToggle?.addEventListener('click', () => {
  const isOpen = submenuParent.classList.toggle('open');
  submenuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (event) => {
  if (submenuParent && !submenuParent.contains(event.target) && window.innerWidth > 960) {
    submenuParent.classList.remove('open');
    submenuToggle?.setAttribute('aria-expanded', 'false');
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 960) {
    mainNavigation?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }
});
