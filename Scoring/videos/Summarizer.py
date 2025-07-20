from twelvelabs import TwelveLabs
from dotenv import load_dotenv
import os
import requests
import time

from google.oauth2 import service_account
from googleapiclient.discovery import build

class Summarizer:
    client: TwelveLabs
    video_urls: list[str] = []
    index: any = None
    def __init__(self):
        load_dotenv()
        self.client = TwelveLabs(api_key=os.getenv("TWELVE_LABS_API_KEY"))
        if not self.client:
            raise ValueError("Invalid API Key")
    
    def list_indexes(self):
        url = os.getenv("TWELVE_LABS_INDEX_URL")
        querystring = {
            "model_options":"visual,audio",
            "model_family": ["marengo", "pegasus"],
        }
        headers = {"x-api-key": os.environ.get("TWELVE_LABS_API_KEY")}
        response = requests.get(url, params=querystring, headers=headers)
        time.sleep(2)
        if response.status_code >= 400:
            raise ValueError(f"Failed to list indexes: {response.text}")
        indexes = response.json()
        return indexes
    
    def delete_index(self, index_id: str):
        try:
            url = os.getenv("TWELVE_LABS_INDEX_URL") + f"/{index_id}"
            headers = {"x-api-key": os.environ.get("TWELVE_LABS_API_KEY")}
            response = requests.delete(url, headers=headers)
            time.sleep(2)
            if response.status_code >= 400:
                raise ValueError(f"Failed to delete index: {response.text}")
            print("Done deleting index.")
        except Exception as e:
            print(f"Error deleting index: {e}")
            return False
        return True
    
    def ensure_index(self, index_name: str):
        # Check if index exists by name, delete if exists, then create new
        list_of_indexes = self.list_indexes()['data']
        existing_index = next((idx for idx in list_of_indexes if idx['index_name'] == index_name), None)
        if existing_index:
            print(f"Index '{index_name}' already exists. Deleting...")
            ret = self.delete_index(existing_index['_id'])
            if not ret:
                print(f"Failed to delete existing index '{index_name}'.")
                return None
            print(f"Deleted existing index '{index_name}'.")
            # Wait and confirm deletion
            for _ in range(10):
                time.sleep(2)
                list_of_indexes = self.list_indexes()['data']
                still_exists = any(idx['index_name'] == index_name for idx in list_of_indexes)
                if not still_exists:
                    break
            else:
                print(f"Index '{index_name}' still exists after deletion attempts.")
                return None
        print(f"Creating new index '{index_name}'...")
        url = os.getenv("TWELVE_LABS_INDEX_URL")
        payload = {
            "index_name": index_name,
            "models": [
                { # For embedding
                    "model_name": "marengo2.7",
                    "model_options": ["visual", "audio"]
                },
                { # For summarize
                    "model_name": "pegasus1.2",
                    "model_options": ["visual", "audio"]
                }
            ],
            "addons": ["thumbnail"]
        }
        headers = {
            "x-api-key": os.getenv("TWELVE_LABS_API_KEY"),
            "Content-Type": "application/json"
        }
        response = requests.post(url, json=payload, headers=headers)
        time.sleep(2)
        if response.status_code >= 400:
            raise ValueError(f"Failed to create index: {response.text}")
        self.index = response.json()["_id"]
        return self.index
    
    def summarize(self, index_name: str, video_url: str):
        # Ensure index exists and is fresh
        index_id = self.ensure_index(f"{index_name}_{time.strftime('%Y%m%d_%H%M%S')}")
        if not index_id:
            print(f"Could not create or find index '{index_name}'.")
            return None
        # Now create summarization task
        task = self.client.task.create(index_id=index_id, url=video_url)
        return {
            "index_id": index_id,
            "index_name": index_name,
            "task_id": task.id
        }

    def drive(self):
        # Use the correct Google Drive API scope for reading files
        SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
        SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json') 

        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, 
            scopes=SCOPES,
        )

        return build('drive', 'v3', credentials=credentials)

    def list_drive_videos(self, folder_id):
        """
        List public video files in a Google Drive folder and return their direct download URLs.
        """
        drive_service = self.drive()
        query = f"'{folder_id}' in parents and trashed = false"
        video_urls = []
        page_token = None

        while True:
            results = drive_service.files().list(
                q=f"'{folder_id}' in parents and trashed=false",
                includeItemsFromAllDrives=True,
                supportsAllDrives=True,
                fields="nextPageToken, files(id, name)",
                pageToken=page_token
            ).execute()
            files = results.get('files', [])
            for f in files:
                public_url = f"https://drive.google.com/uc?export=download&id={f['id']}"
                video_urls.append({'id': f['id'], 'name': f['name'], 'url': public_url})
            page_token = results.get('nextPageToken')
            if not page_token:
                break
            time.sleep(0.1)
        return video_urls


if __name__ == "__main__":    
    summarizer = Summarizer()

    load_dotenv() 
    PARENT_FOLDER_ID = os.getenv('PARENT_FOLDER_ID') 

    drive_service = summarizer.drive()
    video_files = summarizer.list_drive_videos(PARENT_FOLDER_ID)
    print(f"Found {len(video_files)} videos in Drive folder.")

    for video in video_files:
        file_id = video['id']
        file_name = video['name']
        local_path = f"https://drive.google.com/uc?export=download&id={video['id']}"
        print(local_path)

        # Use local_path or a public URL for summarization
        # If TwelveLabs needs a public URL, upload the file to somewhere accessible or use their local file support if available
        # Here assuming it supports local file paths or you've a way to handle local uploads:
        try:
            result = summarizer.summarize("example_index", local_path)
            print(f"Started summarization task for {file_name}: {result}")
        except Exception as e:
            print(f"Failed to summarize {file_name}: {e}")