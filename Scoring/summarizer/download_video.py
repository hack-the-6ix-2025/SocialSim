from random import random
import time
from googleapiclient.discovery import build
from google.oauth2 import service_account
import csv
import yt_dlp
import os
from dotenv import load_dotenv

load_dotenv()

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')
PARENT_FOLDER_ID = os.getenv('PARENT_FOLDER_ID')  

def authenticate_drive():
        """Authenticate and return the Google Drive service."""
        credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)

        return credentials

def video_links():
        csv_file = os.path.join(os.path.dirname(__file__), "..", "datasets", "all_videos_metadata.csv")
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
        failed_downloads = []
        DOWNLOAD_DIR = 'downloads'

        # Ensure download directory exists
        os.makedirs(DOWNLOAD_DIR, exist_ok=True)

        ydl_opts = {
                'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title).200s.%(ext)s'),
                'format': 'best[ext=mp4]/best',
                'cookiefile': 'cookies.txt',  
                'quiet': False,
        }

        total_links = len(youtube_links)
        successful_downloads = 0
        skipped_existing = 0

        print(f"Found {total_links} unique video URLs to download")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                for i, link in enumerate(youtube_links, 1):
                        try:
                                print(f"Processing {i}/{total_links}: {link}")
                                
                                # Check if file might already exist
                                info = ydl.extract_info(link, download=False)
                                expected_filename = ydl.prepare_filename(info)
                                
                                if os.path.exists(expected_filename):
                                        print(f"File already exists, skipping: {os.path.basename(expected_filename)}")
                                        downloaded_files.append(expected_filename)
                                        skipped_existing += 1
                                        continue
                                
                                # Download the video
                                info = ydl.extract_info(link, download=True)
                                file_path = ydl.prepare_filename(info)
                                downloaded_files.append(file_path)
                                successful_downloads += 1

                                print(f"Successfully downloaded: {os.path.basename(file_path)}")
                                sleep_time = random.uniform(30, 90)
                                print(f"Sleeping for {int(sleep_time)} seconds to avoid rate limits...")
                                time.sleep(sleep_time)
                        except Exception as e:
                                print(f"Failed to download {link}: {e}")
                                failed_downloads.append(link)
                                continue

        print(f"\nDownload Summary:")
        print(f"Total unique URLs: {total_links}")
        print(f"New downloads: {successful_downloads}")
        print(f"Already existed: {skipped_existing}")
        print(f"Failed downloads: {len(failed_downloads)}")
        print(f"Total accessible files: {len(downloaded_files)}")
        
        return downloaded_files

def upload_to_drive():
        creds = authenticate_drive()

        service = build('drive', 'v3', credentials=creds)
        file_metadata = {
                'name': 'downloaded_videos',
                'parents': [PARENT_FOLDER_ID]
        }

        directory_path = 'downloads'

        for filename in os.listdir(directory_path):
                file_path = os.path.join(directory_path, filename)
        
                if os.path.isfile(file_path):

                        file_metadata = {
                                'name': filename,
                                'parents': [PARENT_FOLDER_ID]
                        }

                        try:
                                file = service.files().create(
                                        body=file_metadata,
                                        media_body=file_path,
                                        supportsAllDrives=True,
                                        fields='id'
                                ).execute()
                        except Exception as e:
                                print(f"Failed to upload {filename}: {e}")
                                continue
                        print(f"Uploaded {filename} with ID: {file.get('id')}")

def verify_downloaded_files():
        """Check actual files in the downloads directory and compare with CSV data."""
        DOWNLOAD_DIR = 'downloads'
        
        # Get all video files in downloads directory
        if os.path.exists(DOWNLOAD_DIR):
                actual_files = [f for f in os.listdir(DOWNLOAD_DIR) if f.endswith(('.mp4', '.webm', '.mkv', '.avi'))]
                print(f"Actual video files in {DOWNLOAD_DIR}: {len(actual_files)}")
        else:
                actual_files = []
                print(f"Downloads directory does not exist")
        
        # Get unique URLs from CSV
        youtube_links = video_links()
        print(f"Unique video URLs in CSV: {len(youtube_links)}")
        
        return actual_files, youtube_links

if __name__ == "__main__":
        
        downloaded_videos = download_videos()
        print(f"Downloaded {len(downloaded_videos)} videos.")
        upload_to_drive()
        verify_downloaded_files()


