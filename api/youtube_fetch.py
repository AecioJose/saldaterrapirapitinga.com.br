import requests
import json
import os
from datetime import datetime, timedelta, timezone
import re
import sys # Import sys for sys.exit()

# Certifique-se de que a variável de ambiente YOUTUBE_API_KEY esteja definida
API_KEY = os.environ.get("YOUTUBE_API_KEY")

# --- NOVO TRECHO DE VERIFICAÇÃO ---
if not API_KEY:
    print("Erro: A variável de ambiente YOUTUBE_API_KEY não está definida.")
    print("Por favor, defina-a antes de executar o script. Ex: export YOUTUBE_API_KEY='SUA_CHAVE_AQUI'")
    sys.exit(1) # Sai do script com um código de erro
# --- FIM DO NOVO TRECHO ---

CHANNEL_ID = "UCyZFrWaUraeSUnv1bQbmNow" # ID do canal "Sal da Terra Pirapitinga"

# Define o fuso horário de Brasília (BRT = UTC-3)
BRT_OFFSET = timedelta(hours=-3)
BRT_TIMEZONE = timezone(BRT_OFFSET)

def fetch_latest_uploaded_videos():
    """
    Busca os 4 últimos vídeos de "CAFÉ COM FÉ" que não são transmissões ao vivo.
    """
    # API_KEY já é verificado globalmente, mas mantemos o print para debug em caso de funções chamadas isoladamente
    # if not API_KEY: 
    #     print("Erro: YOUTUBE_API_KEY não está definida.")
    #     return []

    url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet&order=date&maxResults=10&type=video"
    response = requests.get(url)
    response.raise_for_status() # Levanta um erro para status de resposta ruins (4xx ou 5xx)
    data = response.json()

    videos = []
    for item in data.get("items", []):
        snippet = item["snippet"]
        title = snippet["title"].upper()
        
        if "CAFÉ COM FÉ" in title and item["snippet"]["liveBroadcastContent"] == "none":
            video_id = item["id"]["videoId"]
            videos.append({
                "title": snippet["title"],
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "url": f"https://www.youtube.com/watch?v={video_id}"
            })
            if len(videos) >= 4:
                break
    return videos

def fetch_latest_completed_live_streams():
    """
    Busca os 3 últimos vídeos de transmissões ao vivo concluídas e identifica
    a série de quinta-feira usando a data de início real da transmissão.
    """
    # if not API_KEY: 
    #     print("Erro: YOUTUBE_API_KEY não está definida.")
    #     return [], None

    # Passo 1: Usar o endpoint search para obter os IDs dos vídeos das lives concluídas
    search_url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={CHANNEL_ID}&part=id,snippet&eventType=completed&type=video&order=date&maxResults=5"
    search_response = requests.get(search_url)
    search_response.raise_for_status()
    search_data = search_response.json()

    video_ids = []
    for item in search_data.get("items", []):
        if item["id"]["kind"] == "youtube#video":
            video_ids.append(item["id"]["videoId"])

    all_completed_streams = []
    thursday_series_name = None
    series_name_pattern = re.compile(r"^(.*?)\s*\|", re.IGNORECASE)

    if not video_ids:
        return [], None

    # Passo 2: Usar o endpoint videos.list para obter liveStreamingDetails para cada vídeo
    video_ids_str = ','.join(video_ids)
    videos_url = f"https://www.googleapis.com/youtube/v3/videos?key={API_KEY}&part=snippet,liveStreamingDetails&id={video_ids_str}"
    videos_response = requests.get(videos_url)
    videos_response.raise_for_status()
    videos_data = videos_response.json()

    # Ordena os vídeos por data de publicação para garantir que estamos processando do mais recente para o mais antigo
    sorted_items = sorted(videos_data.get("items", []), 
                          key=lambda x: x['snippet']['publishedAt'], 
                          reverse=True)

    for item in sorted_items:
        video_id = item["id"] # 'id' field is directly the video ID here
        snippet = item["snippet"]
        title = snippet["title"]
        live_details = item.get("liveStreamingDetails", {})
        
        # Adiciona à lista de todas as transmissões concluídas (limitando a 3 no final)
        all_completed_streams.append({
            "title": title,
            "thumbnail": snippet["thumbnails"]["high"]["url"],
            "url": f"https://www.youtube.com/watch?v={video_id}"
        })

        if thursday_series_name is None and 'actualStartTime' in live_details:
            try:
                actual_start_time_utc = datetime.fromisoformat(live_details['actualStartTime'].replace('Z', '+00:00'))
                actual_start_time_brt = actual_start_time_utc.astimezone(BRT_TIMEZONE)
                
                if actual_start_time_brt.weekday() == 3: # 3 corresponds to Thursday
                    match = series_name_pattern.match(title)
                    if match:
                        extracted_series = match.group(1).strip()
                        if "CULTO DA FAMÍLIA" not in extracted_series.upper():
                            thursday_series_name = extracted_series
            except ValueError:
                pass
            
            # Fallback to publishedAt if actualStartTime logic didn't set thursday_series_name
            # This is a less reliable fallback, but ensures some logic path if liveStreamingDetails is missing/bad
            if thursday_series_name is None and 'publishedAt' in snippet:
                try:
                    published_datetime_utc = datetime.fromisoformat(snippet['publishedAt'].replace('Z', '+00:00'))
                    published_datetime_brt = published_datetime_utc.astimezone(BRT_TIMEZONE)
                    if published_datetime_brt.weekday() == 3:
                        match = series_name_pattern.match(title)
                        if match:
                            extracted_series = match.group(1).strip()
                            if "CULTO DA FAMÍLIA" not in extracted_series.upper():
                                thursday_series_name = extracted_series
                except ValueError:
                    pass

        # Se já encontramos a série de quinta-feira e já coletamos 3 vídeos para a lista, podemos parar
        if thursday_series_name is not None and len(all_completed_streams) >= 3:
            break

    return all_completed_streams[:3], thursday_series_name

def fetch_current_live_stream():
    """
    Busca a transmissão ao vivo atual, se houver.
    """
    # if not API_KEY:
    #     print("Erro: YOUTUBE_API_KEY não está definida.")
    #     return None

    url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet&eventType=live&type=video&maxResults=1"
    response = requests.get(url)
    response.raise_for_status()
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
    """
    Função principal que orquestra a busca de dados e gera o arquivo JSON.
    """
    latest_completed_live_streams, thursday_series_raw = fetch_latest_completed_live_streams()
    
    if thursday_series_raw:
        thursday_series_display = f"Culto Série: {thursday_series_raw.upper()}"
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
    print("Arquivo youtube.json gerado com sucesso!")

if __name__ == "__main__":
    main()