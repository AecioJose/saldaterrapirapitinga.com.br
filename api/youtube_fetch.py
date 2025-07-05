import requests
import json
import os
from datetime import datetime

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
            "url": f"https://www.youtube.com/watch?v={video_id}"
        })
    return live_streams

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