import time
import requests
import sys
from datetime import datetime

# Configuration
# Replace with your production URL when deploying
API_URL = "http://localhost:3000/api/cron/scan" 
INTERVAL_SECONDS = 60

def log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def trigger_scan():
    try:
        log(f"Triggering scan at {API_URL}...")
        response = requests.get(API_URL, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            scanned = data.get('scanned_posts', 0)
            new_launches = data.get('new_launches', 0)
            log(f"Success! Scanned {scanned} posts, Found {new_launches} new launches.")
            if new_launches > 0:
                for token in data.get('details', []):
                    log(f" -> New Token: {token['name']} ({token['symbol']})")
        else:
            log(f"Error: Server returned {response.status_code}")
            log(f"Response: {response.text[:200]}")

    except requests.exceptions.RequestException as e:
        log(f"Connection Failed: {e}")
    except Exception as e:
        log(f"Unexpected Error: {e}")

def main():
    log("Molenker Watcher Failed Started")
    log(f"Target: {API_URL}")
    log(f"Interval: {INTERVAL_SECONDS}s")
    
    # Run loop
    while True:
        trigger_scan()
        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            API_URL = sys.argv[1]
        main()
    except KeyboardInterrupt:
        log("Stopping watcher...")
