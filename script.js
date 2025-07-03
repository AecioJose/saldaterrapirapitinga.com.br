// Menu hamburguer (mobile)
const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

toggle.addEventListener("click", () => {
  nav.classList.toggle("active");
  toggle.classList.toggle("opened");
});

// Carrossel
let currentIndex = 0;
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");

function showSlide(index) {
  const inner = document.querySelector(".carousel-inner");
  inner.style.transform = `translateX(-${index * 100}vw)`;

  dots.forEach(dot => dot.classList.remove("active"));
  dots[index].classList.add("active");
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
}

dots.forEach((dot, i) =>
  dot.addEventListener("click", () => {
    currentIndex = i;
    showSlide(currentIndex);
  })
);

setInterval(nextSlide, 5000);

// Mostrar navbar ao rolar metade da tela
const header = document.querySelector("header");

// Funcionalidade para o texto de boas-vindas e scroll sequencial
const welcomeTextOverlay = document.getElementById("welcomeTextOverlay");
const videoHeroSection = document.querySelector(".video-hero");

// Variável para controlar o estado do scroll
let initialScrollLocked = true; // Começa bloqueado

// Posição de scroll virtual para a animação do texto
let virtualScrollPosition = 0;
const textAnimationScrollLength = window.innerHeight * 0.7; // O texto anima por 70% da altura da viewport

function animateWelcomeText() {
  // Calcula o progresso da animação com base na posição de scroll virtual
  const translateYProgress = (virtualScrollPosition / textAnimationScrollLength) * 100;
  const opacityProgress = 1 - (virtualScrollPosition / textAnimationScrollLength);

  welcomeTextOverlay.style.transform = `translate(-50%, calc(-50% - ${translateYProgress}vh))`;
  welcomeTextOverlay.style.opacity = Math.max(0, opacityProgress);

  // Se a animação do texto estiver completa
  if (virtualScrollPosition >= textAnimationScrollLength) {
    if (initialScrollLocked) { // Verifica se ainda está bloqueado para evitar chamadas repetidas
      initialScrollLocked = false;
      document.body.style.overflowY = 'auto'; // Libera a rolagem do body
      welcomeTextOverlay.classList.add('hidden'); // Oculta o texto completamente
      // IMPORTANTE: Não force o window.scrollTo aqui.
      // A rolagem do usuário continuará de forma natural.
    }
  } else {
    // Caso contrário, mantém o scroll do body bloqueado
    document.body.style.overflowY = 'hidden';
    welcomeTextOverlay.classList.remove('hidden'); // Garante que o texto esteja visível durante a animação
  }
}

// Intercepta eventos de rolagem quando o scroll inicial está bloqueado
window.addEventListener('wheel', (e) => {
  if (initialScrollLocked) {
    e.preventDefault(); // Impede a rolagem padrão da página

    // Ajusta a posição de scroll virtual com base na rolagem da roda do mouse
    // Multiplicador ajustado para uma sensibilidade talvez mais natural
    virtualScrollPosition += e.deltaY * 0.7; 
    virtualScrollPosition = Math.max(0, Math.min(virtualScrollPosition, textAnimationScrollLength + 10)); // Adicionado um pequeno buffer

    animateWelcomeText(); // Anima o texto com base na nova posição virtual
  }
}, { passive: false }); // passive: false é crucial para permitir e.preventDefault()

// Adiciona um listener para touchmove para dispositivos móveis
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  if (initialScrollLocked) {
    touchStartY = e.touches[0].clientY;
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (initialScrollLocked) {
    e.preventDefault(); // Impede a rolagem padrão da página

    const touchCurrentY = e.touches[0].clientY;
    const deltaY = touchStartY - touchCurrentY; // Calcula a distância do arrasto

    // Multiplicador ajustado para uma sensibilidade talvez mais natural
    virtualScrollPosition += deltaY * 1; 
    virtualScrollPosition = Math.max(0, Math.min(virtualScrollPosition, textAnimationScrollLength + 10)); // Adicionado um pequeno buffer

    animateWelcomeText(); // Anima o texto com base na nova posição virtual

    touchStartY = touchCurrentY; // Atualiza a posição inicial do toque
  }
}, { passive: false });


// Lógica da navbar (fora do controle inicial de scroll)
window.addEventListener('scroll', () => {
    // A lógica da navbar só deve funcionar quando o scroll do body está liberado
    if (!initialScrollLocked) {
        if (window.scrollY > window.innerHeight / 2) {
            header.classList.add('visible');
        } else {
            header.classList.remove('visible');
        }
    } else {
        // Se ainda estiver no modo de scroll inicial, a navbar não deve aparecer
        header.classList.remove('visible');
    }

    // Se o usuário voltar para o topo e o scroll estiver liberado, rebloquear e mostrar o texto
    if (window.scrollY === 0 && !initialScrollLocked) {
        initialScrollLocked = true;
        virtualScrollPosition = 0; // Reseta a posição virtual
        document.body.style.overflowY = 'hidden';
        welcomeTextOverlay.classList.remove('hidden');
        welcomeTextOverlay.style.transform = `translate(-50%, -50%)`;
        welcomeTextOverlay.style.opacity = 1;
    }
});


// Trocar vídeo conforme tamanho da tela
const videoElement = document.getElementById("intro-video");
const sourceElement = videoElement.querySelector("source");

function setVideoSource() {
  const isMobile = window.innerWidth <= 768;
  const src = isMobile
    ? "assets/video/mobile/institucional.mp4"
    : "assets/video/desktop/institucional.mp4";

  if (sourceElement.src !== location.origin + "/" + src) {
    sourceElement.src = src;
    videoElement.load();
  }
}

setVideoSource();
window.addEventListener("resize", setVideoSource);

// Ao carregar a página:
window.addEventListener('load', () => {
    // Garante que a página comece no topo
    window.scrollTo(0, 0);
    // Bloqueia a rolagem do body inicialmente
    document.body.style.overflowY = 'hidden';
    initialScrollLocked = true;
    virtualScrollPosition = 0; // Reseta a posição virtual
    // Garante que o texto esteja visível e centralizado
    if (welcomeTextOverlay) {
        welcomeTextOverlay.style.transform = `translate(-50%, -50%)`;
        welcomeTextOverlay.style.opacity = 1;
        welcomeTextOverlay.classList.remove("hidden");
    }
    // Anima o texto para o estado inicial
    animateWelcomeText();
});