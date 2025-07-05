import requests
import json
import os
from datetime import datetime

API_KEY = os.environ["YOUTUBE_API_KEY"]
CHANNEL_ID = "UCyZFrWaUraeSUnv1bQbmNow"

def fetch_latest_uploaded_videos():
    """
    Busca os 3 últimos vídeos (uploads, incluindo shorts) do canal.
    Usa o endpoint activities.list para filtrar por uploads.
    """
    url = f"https://www.googleapis.com/youtube/v3/activities?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet,contentDetails&maxResults=50&type=upload"
    response = requests.get(url)
    data = response.json()

    videos = []
    for item in data.get("items", []):
        if "upload" in item["contentDetails"]:
            video_id = item["contentDetails"]["upload"]["videoId"]
            snippet = item["snippet"]
            videos.append({
                "title": snippet["title"],
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "url": f"https://www.youtube.com/watch?v={video_id}" # URL padrão do YouTube
            })
            if len(videos) >= 3: # Pegar apenas os 3 mais recentes
                break
    return videos

def fetch_latest_completed_live_streams():
    """
    Busca as 2 últimas transmissões ao vivo finalizadas do canal.
    Usa o endpoint search.list com eventType=completed.
    """
    url = f"https://www.googleapis.com/youtube/v3/search?key={API_KEY}&channelId={CHANNEL_ID}&part=snippet&eventType=completed&type=video&order=date&maxResults=2"
    response = requests.get(url)
    data = response.json()

    live_streams = []
    for item in data.get("items", []):
        video_id = item["id"]["videoId"]
        snippet = item["snippet"]
        live_streams.append({
            "title": snippet["title"],
            "thumbnail": snippet["thumbnails"]["high"]["url"],
            "url": f"https://www.youtube.com/watch?v={video_id}" # URL padrão do YouTube
        })
    return live_streams

def fetch_current_live_stream():
    """
    Verifica se há uma transmissão ao vivo ativa no momento.
    Usa o endpoint search.list com eventType=live.
    """
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
        "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}" # URL padrão do YouTube
    }

def main():
    result = {
        "last_updated": datetime.utcnow().isoformat(),
        "latest_videos": fetch_latest_uploaded_videos(),
        "latest_completed_live_streams": fetch_latest_completed_live_streams(),
        "current_live_stream": fetch_current_live_stream()
    }

    with open("api/youtube.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()