'use strict';

document.documentElement.classList.add('js');

const yearElement = document.querySelector('[data-current-year]');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const header = document.querySelector('[data-header]');
const updateHeader = () => header?.classList.toggle('is-fixed', window.scrollY > 100);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');

const closeMenu = () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
};

menuToggle?.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    navigation?.classList.toggle('is-open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
});

const roomButtons = [...document.querySelectorAll('[data-room]')];
const roomImage = document.querySelector('[data-room-image]');
const roomNumber = document.querySelector('[data-room-number]');
const roomName = document.querySelector('[data-room-name]');
const roomDescription = document.querySelector('[data-room-description]');
const roomGuests = document.querySelector('[data-room-guests]');
const roomBed = document.querySelector('[data-room-bed]');
const roomArea = document.querySelector('[data-room-area]');
const roomPrice = document.querySelector('[data-room-price]');
const roomSelect = document.querySelector('[data-room-select]');

const selectRoom = (button) => {
    roomButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', String(isActive));
    });

    roomImage?.classList.add('is-changing');
    if (roomImage) {
        const replacement = new Image();
        replacement.onload = () => {
            roomImage.src = button.dataset.image;
            roomImage.alt = button.dataset.alt;
            roomImage.classList.remove('is-changing');
        };
        replacement.src = button.dataset.image;
    }

    if (roomNumber) roomNumber.textContent = button.dataset.number;
    if (roomName) roomName.textContent = button.dataset.room;
    if (roomDescription) roomDescription.textContent = button.dataset.description;
    if (roomGuests) roomGuests.textContent = button.dataset.guests;
    if (roomBed) roomBed.textContent = button.dataset.bed;
    if (roomArea) roomArea.textContent = button.dataset.area;
    if (roomPrice) roomPrice.textContent = button.dataset.price;
    if (roomSelect) roomSelect.value = button.dataset.room;
};

roomButtons.forEach((button) => button.addEventListener('click', () => selectRoom(button)));

const arrivalInput = document.querySelector('[data-arrival]');
const departureInput = document.querySelector('[data-departure]');
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

if (arrivalInput && departureInput) {
    arrivalInput.min = localToday;
    departureInput.min = localToday;

    arrivalInput.addEventListener('change', () => {
        departureInput.min = arrivalInput.value || localToday;
        if (departureInput.value && departureInput.value <= arrivalInput.value) {
            departureInput.value = '';
        }
    });
}

const bookingForm = document.querySelector('[data-booking-form]');
bookingForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(bookingForm);
    const arrival = String(data.get('arrival'));
    const departure = String(data.get('departure'));

    if (departure <= arrival) {
        departureInput?.setCustomValidity('Дата выезда должна быть позже даты заезда');
        departureInput?.reportValidity();
        return;
    }
    departureInput?.setCustomValidity('');

    const formatDate = (value) => new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long'
    }).format(new Date(`${value}T12:00:00`));

    const message = [
        'Здравствуйте! Хочу уточнить бронирование в «Тихой Коломне».',
        `Даты: ${formatDate(arrival)} — ${formatDate(departure)}.`,
        `Гости: ${data.get('guests')}.`,
        `Номер: ${data.get('room')}.`,
        `Имя: ${data.get('guestName')}.`
    ].join('\n');

    window.open(`https://wa.me/79154956417?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const isImage = entry.target.classList.contains('reveal--image');
            entry.target.animate([
                {
                    opacity: 0,
                    transform: isImage ? 'translateY(24px) scale(.985)' : 'translateY(30px)'
                },
                { opacity: 1, transform: 'none' }
            ], {
                duration: 800,
                easing: 'cubic-bezier(.22, .72, .2, 1)',
                fill: 'both'
            });
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}
