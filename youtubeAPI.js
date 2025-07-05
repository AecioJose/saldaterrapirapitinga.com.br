// O CÓDIGO JS ABAIXO PERMANECE EXATAMENTE O MESMO
// Função para buscar dados do JSON local
async function fetchYoutubeData() {
    try {
        const response = await fetch('api/youtube.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar dados do YouTube:", error);
        return null; // Retorna null em caso de erro
    }
}

// Função para exibir a seção de transmissão ao vivo
function displayLiveStream(data) {
    const liveStreamSection = document.getElementById("live-stream-section");
    const liveVideoThumbnail = document.getElementById("live-video-thumbnail");
    const liveVideoTitle = document.getElementById("live-video-title");
    const liveVideoLink = document.getElementById("live-video-link");
    const liveWatchButton = document.getElementById("live-watch-button");

    if (data && data.current_live_stream) {
        liveVideoThumbnail.src = data.current_live_stream.thumbnail;
        liveVideoThumbnail.alt = data.current_live_stream.title;
        liveVideoTitle.textContent = data.current_live_stream.title;
        liveVideoLink.href = data.current_live_stream.url;
        liveWatchButton.href = data.current_live_stream.url;
        liveStreamSection.style.display = "flex"; // Mostra a seção
    } else {
        liveStreamSection.style.display = "none"; // Esconde a seção se não houver transmissão
    }
}

// Função para exibir as últimas transmissões e preparar para animação
function displayRecentStreams(data) {
    const recentStreamsContainer = document.getElementById("recent-streams-container");
    recentStreamsContainer.innerHTML = ''; // Limpa o conteúdo existente

    // Pega apenas as duas últimas transmissões completas
    const streamsToShow = data.latest_completed_live_streams.slice(0, 2);

    streamsToShow.forEach((stream, index) => {
        const videoCard = document.createElement("div");
        videoCard.classList.add("recent-video-card");

        // Adiciona classes para animação baseada no índice
        // O primeiro card virá da esquerda, o segundo da direita (inversão para efeito)
        if (index === 0) {
            videoCard.classList.add("slide-from-left");
        } else if (index === 1) {
            videoCard.classList.add("slide-from-right");
        }

        videoCard.innerHTML = `
            <a href="${stream.url}" target="_blank" rel="noopener noreferrer">
                <img src="${stream.thumbnail}" alt="${stream.title}">
                <div class="recent-video-info">
                    <p>${stream.title}</p>
                </div>
            </a>
        `;
        recentStreamsContainer.appendChild(videoCard);
    });

    // --- Lógica do Intersection Observer para animação contínua ---
    const observerOptions = {
        root: null, // viewport como o root
        rootMargin: '0px',
        // Define o threshold para que a animação comece ANTES do elemento estar totalmente na tela.
        // Um valor baixo (ex: 0.1) significa que ele aparecerá logo que começar a entrar na viewport.
        threshold: 0.7 // O elemento é considerado visível quando 20% dele está na tela
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Se o elemento está visível, adiciona a classe para mostrar
                entry.target.classList.add('is-visible');
            } else {
                // Se o elemento não está visível, remove a classe para escondê-lo novamente
                entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    // Observa cada card de vídeo recém-criado
    document.querySelectorAll('.recent-video-card').forEach(card => {
        observer.observe(card);
    });
}

// Inicializar ao carregar o conteúdo do DOM
document.addEventListener("DOMContentLoaded", async () => {
    const youtubeData = await fetchYoutubeData();
    if (youtubeData) {
        displayLiveStream(youtubeData);
        displayRecentStreams(youtubeData);
    }
});