import requests
import json
import os
from datetime import datetime
import re

API_KEY = os.environ["YOUTUBE_API_KEY"]
CHANNEL_ID = "UCyZFrWaUraeSUnv1bQbmNow"

def fetch_latest_uploaded_videos():
    url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet&order=date&maxResults=50&type=video"
    response = requests.get(url)
    data = response.json()

    videos = []
    for item in data.get("items", []):
        snippet = item["snippet"]
        title = snippet["title"].upper()
        
        # A API pode retornar 'live', 'upcoming' ou 'none'
        if title.startswith("CAFÉ COM FÉ") and item["snippet"]["liveBroadcastContent"] == "none":
            video_id = item["id"]["videoId"]
            videos.append({
                "title": snippet["title"],
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "url": f"https://www.youtube.com/watch?v={video_id}"
            })
            if len(videos) >= 3:
                break
    return videos

def fetch_latest_completed_live_streams():
    # Aumentado maxResults para ter mais chances de encontrar uma live de quinta recente
    url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet&eventType=completed&type=video&order=date&maxResults=10" 
    response = requests.get(url)
    data = response.json()

    live_streams = []
    thursday_series_name = None
    
    # Regex para capturar o nome da série de quinta-feira
    # O padrão é: [QUALQUER COISA] | MINISTRAÇÃO | [NOME DO PREGADOR] | 19:30 | [DATA]
    thursday_pattern = re.compile(r"^(.*?)\s*\|\s*MINISTRAÇÃO\s*\|\s*[^|]+\s*\|\s*19:30\s*\|\s*\d{1,2}\s+DE\s+[A-Z]+\s+DE\s+\d{4}$", re.IGNORECASE)

    for item in data.get("items", []):
        video_id = item["id"]["videoId"]
        snippet = item["snippet"]
        title = snippet["title"]
        published_at_str = snippet["publishedAt"]

        # Adiciona a live stream à lista geral
        live_streams.append({
            "title": title,
            "thumbnail": snippet["thumbnails"]["high"]["url"],
            "url": f"https://www.youtube.com/watch?v={video_id}"
        })

        # Tenta extrair o nome da série de quinta-feira, se ainda não foi encontrado
        if thursday_series_name is None:
            try:
                # Converte a string de data/hora para um objeto datetime
                # A data da API vem em formato ISO 8601 (ex: '2025-07-03T22:30:00Z')
                published_datetime = datetime.fromisoformat(published_at_str.replace('Z', '+00:00'))
                
                # Verifica se o dia da semana é quinta-feira (weekday() retorna 0 para segunda, 3 para quinta)
                # E também verifica se a live tem menos de 8 dias (aproximadamente 1 semana e 1 dia)
                # Isso ajuda a focar nas lives mais recentes de quinta-feira
                if published_datetime.weekday() == 3 and (datetime.utcnow().replace(tzinfo=None) - published_datetime.replace(tzinfo=None)).days < 8:
                    match = thursday_pattern.match(title)
                    if match:
                        extracted_series = match.group(1).strip()
                        # Uma verificação extra para garantir que não pegamos o "Culto da Família"
                        # já que ele tem um horário diferente e é de domingo
                        if "CULTO DA FAMÍLIA" not in extracted_series.upper():
                            thursday_series_name = extracted_series
            except ValueError:
                # Em caso de erro na conversão da data, apenas ignora e continua
                pass

    return live_streams, thursday_series_name

def fetch_current_live_stream():
    url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet&eventType=live&type=video&maxResults=1"
    response = requests.get(url)
    data = response.json()
    items = data.get("items", [])
    if not items:
        return None

    item = items[0]
    return {
        "title": item["snippet"]["title"],
        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
        "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
    }

def main():
    latest_completed_live_streams, thursday_series_raw = fetch_latest_completed_live_streams()
    
    
    if thursday_series_raw:
        thursday_series_display = f"Culto Série {thursday_series_raw.upper()}"
    else:
        thursday_series_display = "Todo mês uma série nova"
    
    result = {
        "ThursdaySeries": thursday_series_display,
        "last_updated": datetime.utcnow().isoformat(),
        "latest_videos": fetch_latest_uploaded_videos(),
        "latest_completed_live_streams": latest_completed_live_streams,
        "current_live_stream": fetch_current_live_stream()        
    }

    with open("youtube.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()