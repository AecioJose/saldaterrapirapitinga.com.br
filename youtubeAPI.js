// Função para buscar dados do JSON local
async function fetchYoutubeData() {
    try {
        const response = await fetch('/youtube.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar dados do YouTube:", error);
        return null;
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
        liveStreamSection.style.display = "flex";
    } else {
        liveStreamSection.style.display = "none"; 
    }
}

//Função para titulo da serie de wuinta
function displayThursdaySerie(data){
    document.getElementById("quintaSerie").innerText = data.ThursdaySeries;
}

// Função para exibir as últimas transmissões
function displayRecentStreams(data) {
    const recentStreamsContainer = document.getElementById("recent-streams-container");
    recentStreamsContainer.innerHTML = ''; 

    const streamsToShow = data.latest_completed_live_streams.slice(0, 2);

    streamsToShow.forEach((stream, index) => {
        const videoCard = document.createElement("div");
        videoCard.classList.add("recent-video-card");

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

    //Animação
    function checkCardVisibilityOnScroll() {
        const cards = document.querySelectorAll('.recent-video-card');
        const viewportMiddle = window.innerHeight * 0.85;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const topDistance = rect.top;

            if (topDistance <= viewportMiddle) {
                card.classList.add('is-visible');
            } else {
                card.classList.remove('is-visible');
            }
        });
    }

    
    window.addEventListener('scroll', checkCardVisibilityOnScroll);
    window.addEventListener('resize', checkCardVisibilityOnScroll);
    checkCardVisibilityOnScroll(); 

}

// Inicializar ao carregar o conteúdo do DOM
document.addEventListener("DOMContentLoaded", async () => {
    const youtubeData = await fetchYoutubeData();
    if (youtubeData) {
        displayLiveStream(youtubeData);
        displayThursdaySerie(youtubeData);
        displayRecentStreams(youtubeData);
    }
});