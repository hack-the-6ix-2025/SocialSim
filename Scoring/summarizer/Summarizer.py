import pandas as pd
from twelvelabs import TwelveLabs
from dotenv import load_dotenv
import os
import requests
import time

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle

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

    def authenticate_drive(self):
        creds = None
        # Use the correct Google Drive API scope for reading files
        SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        return build('drive', 'v3', credentials=creds)

    def list_drive_videos(self, folder_id):
        """
        List public video files in a Google Drive folder and return their direct download URLs.
        """
        drive_service = self.authenticate_drive()
        query = f"'{folder_id}' in parents and mimeType contains 'video/' and trashed = false"
        results = drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])
        video_urls = []
        for f in files:
            public_url = f"https://drive.google.com/uc?export=download&id={f['id']}"
            video_urls.append(public_url)
        return video_urls

if __name__ == "__main__":    
    summarizer = Summarizer()
    index_name = "example_index"
    target_filepath = os.path.join(
        os.path.dirname(__file__), 
        "datasets",
        "all_videos_metadata.csv"
    )
    video_url = pd.read_csv(target_filepath)["video_url"].iloc[0]
    print(f"Video URL: {video_url}")  # Debugging line to check the video URL
    
    print(summarizer.list_indexes())
    result = summarizer.summarize(index_name, video_url)