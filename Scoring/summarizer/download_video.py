from random import random
import time
from googleapiclient.discovery import build
from google.oauth2 import service_account
import csv
import yt_dlp
import os

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = 'service-account.json'
PARENT_FOLDER_ID = '175oamOAAUovmeVQXTXIVJfzM7_fBejhe'

def authenticate_drive():
        """Authenticate and return the Google Drive service."""
        credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)

        return credentials

def video_links():
        csv_file = "C:\\PersonalCode\\SocialSim\\Scoring\\datasets\\all_videos_metadata.csv"
        column_name = "video_url"

        youtube_links = set()

        with open(csv_file, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                        link = row.get(column_name)
                        if link:
                                youtube_links.add(link.strip())
        
        return youtube_links

def download_videos():

        youtube_links = video_links()
        downloaded_files = []
        DOWNLOAD_DIR = 'downloads'

        ydl_opts = {
                'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title).200s.%(ext)s'),
                'format': 'best[ext=mp4]/best',
                'cookiefile': 'cookies.txt',  
                'quiet': False,
        }

        counter = 0

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                for link in youtube_links:
                        try:
                                print(f"Downloading: {link}")
                                info = ydl.extract_info(link, download=True)
                                file_path = ydl.prepare_filename(info)
                                downloaded_files.append(file_path)

                                counter += 1
                                print(counter)
                                sleep_time = random.uniform(30, 90)
                                print(f"Sleeping for {int(sleep_time)} seconds to avoid rate limits...")
                                time.sleep(sleep_time)
                        except Exception as e:
                                print(f"Failed to download {link}: {e}")
                                continue

                return downloaded_files

def upload_to_drive(file_path, service):
        creds = authenticate_drive()

        service = build('drive', 'v3', credentials=creds)
        file_metadata = {
                'name': os.path.basename(file_path),
                'parents': [PARENT_FOLDER_ID]
        }

        



if __name__ == "__main__":
        
        # download_videos = download_videos()
        # print(f"Downloaded {len(download_videos)} videos.")
        directory_path = 'C:\\PersonalCode\\SocialSim\\downloads'

        for filename in os.listdir(directory_path):
                file_path = os.path.join(directory_path, filename)
        
                if os.path.isfile(file_path):
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                print(filename)


