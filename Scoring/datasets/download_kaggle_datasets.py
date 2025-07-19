import os
import requests
import zipfile

# URLs for Kaggle datasets
DATASETS = [
    {
        "url": "https://www.kaggle.com/api/v1/datasets/download/rahulbaburaj/annomi",
        "filename": "annomi.zip"
    },
    {
        "url": "https://www.kaggle.com/api/v1/datasets/download/rahulmenon1758/annomi-motivational-interviewing",
        "filename": "annomi-motivational-interviewing.zip"
    }
]

# Directory to save and extract datasets
DATASET_DIR = os.path.dirname(os.path.abspath(__file__))

# Download and extract datasets
for dataset in DATASETS:
    zip_path = os.path.join(DATASET_DIR, dataset["filename"])
    print(f"Downloading {dataset['url']} to {zip_path}...")
    response = requests.get(dataset["url"], stream=True)
    response.raise_for_status()
    with open(zip_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"Extracting {zip_path}...")
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(DATASET_DIR)
    print(f"Done: {dataset['filename']}")
