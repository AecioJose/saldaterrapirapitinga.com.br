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
  const translateYProgress = (virtualScrollPosition / textAnimationScrollLength) * 100;
  const opacityProgress = 1 - (virtualScrollPosition / textAnimationScrollLength);

  welcomeTextOverlay.style.transform = `translate(-50%, calc(-50% - ${translateYProgress}vh))`;
  welcomeTextOverlay.style.opacity = Math.max(0, opacityProgress);

  // Se a animação do texto estiver completa
  if (virtualScrollPosition >= textAnimationScrollLength) {
    if (initialScrollLocked) {
      initialScrollLocked = false;
      document.body.style.overflowY = 'auto'; // Agora, o JS REMOVE o bloqueio
      welcomeTextOverlay.classList.add('hidden');
    }
  } else {
    // Caso contrário, o scroll do body JÁ ESTÁ bloqueado pelo CSS
    welcomeTextOverlay.classList.remove('hidden');
  }
}

// Intercepta eventos de rolagem quando o scroll inicial está bloqueado
window.addEventListener('wheel', (e) => {
  if (initialScrollLocked) {
    e.preventDefault();

    virtualScrollPosition += e.deltaY * 0.7;
    virtualScrollPosition = Math.max(0, Math.min(virtualScrollPosition, textAnimationScrollLength + 10));

    animateWelcomeText();
  }
}, { passive: false });

// Adiciona um listener para touchmove para dispositivos móveis
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  if (initialScrollLocked) {
    touchStartY = e.touches[0].clientY;
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (initialScrollLocked) {
    e.preventDefault();

    const touchCurrentY = e.touches[0].clientY;
    const deltaY = touchStartY - touchCurrentY;

    virtualScrollPosition += deltaY * 1;
    virtualScrollPosition = Math.max(0, Math.min(virtualScrollPosition, textAnimationScrollLength + 10));

    animateWelcomeText();

    touchStartY = touchCurrentY;
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
        header.classList.remove('visible'); // Garante que a navbar não apareça se o scroll inicial estiver ativo
    }

    // Se o usuário voltar para o topo e o scroll estiver liberado, rebloquear e mostrar o texto
    if (window.scrollY < 50 && !initialScrollLocked && virtualScrollPosition >= textAnimationScrollLength) {
        resetInitialState();
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

// Função para resetar o estado inicial da página
function resetInitialState() {
    // Força o scroll para o topo imediata e incondicionalmente
    window.scrollTo(0, 0);

    // O CSS já define overflow-y: hidden, então não precisamos setar aqui.
    // Apenas garantimos que o estado JS esteja correto.
    initialScrollLocked = true;
    virtualScrollPosition = 0;

    if (welcomeTextOverlay) {
        welcomeTextOverlay.style.transform = `translate(-50%, -50%)`;
        welcomeTextOverlay.style.opacity = 1;
        welcomeTextOverlay.classList.remove("hidden");
    }
    animateWelcomeText();
}

// *** ALTERAÇÃO CHAVE AQUI: Reset no DOMContentLoaded apenas para garantir o estado inicial do JS ***
document.addEventListener('DOMContentLoaded', () => {
    // Garante que o scroll esteja no topo e o JS saiba que está travado
    resetInitialState();
});

// Ao retornar à página (usando o botão de voltar do navegador)
// `pageshow` é mais confiável que `DOMContentLoaded` para detecção de cache "back/forward"
window.addEventListener('pageshow', (event) => {
    // Verifica se a página foi restaurada do cache (bfcache)
    if (event.persisted) {
        resetInitialState();
    }
});