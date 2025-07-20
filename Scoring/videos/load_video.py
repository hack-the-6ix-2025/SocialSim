import pandas as pd
import os
DATASETS_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets")
from Summarizer import Summarizer

def load_video_metadata(filepath):
    """
    Load video metadata from a CSV file.

    Parameters:
    - filepath: str, path to the CSV file containing video metadata.

    Returns:
    - pd.DataFrame: DataFrame containing the video metadata.
    """
    try:
        df = pd.read_csv(filepath)
        return df
    except Exception as e:
        print(f"Error loading video metadata: {e}")
        return pd.DataFrame()

def concat_tables(pd1: pd.DataFrame, pd2: pd.DataFrame) -> pd.DataFrame:
    """
    Concatenate two pandas DataFrames.

    Parameters:
    - pd1: pd.DataFrame, first DataFrame.
    - pd2: pd.DataFrame, second DataFrame.

    Returns:
    - pd.DataFrame: Concatenated DataFrame.
    """
    # Concatenate and align columns, filling missing values with NaN
    return pd.concat([pd1, pd2], axis=0, ignore_index=True, sort=False)

if __name__ == "__main__":
    # Load everything from metadata csv files in the datasets directory
    resulting_file_path = os.path.join(DATASETS_PATH, "all_videos_metadata.csv")
    if not os.path.exists(resulting_file_path):
        all_videos_metadata = pd.DataFrame() # resulting
        num_videos = []
        for filename in os.listdir(DATASETS_PATH):
            if filename.endswith('.csv'):
                filepath = os.path.join(DATASETS_PATH, filename)
                metadata_df = load_video_metadata(filepath)
                num_videos.append(len(metadata_df))
                if not metadata_df.empty:
                    all_videos_metadata = concat_tables(all_videos_metadata, metadata_df)
        assert len(all_videos_metadata) == sum(num_videos), "Concatenated DataFrame length does not match the sum of individual DataFrames."
        all_videos_metadata.to_csv(resulting_file_path, index=False)
    all_videos_metadata = load_video_metadata(resulting_file_path)

    # Get video URLs as a list
    video_urls:list = all_videos_metadata["video_url"].tolist()
    print(f"Loaded {len(video_urls)} video URLs from {resulting_file_path}")

    # Initialize Summarizer from TwelveLabs
    summarizer = Summarizer()
    index_name = "videos_index"
    print(f"Listing indexes: {summarizer.list_indexes()}")
    # Authenticare with Google Drive
    drive_service = summarizer.authenticate_drive()
    print("Google Drive authenticated successfully.")
    # Upload the metadata file to Google Drive
    video_urls = summarizer.list_drive_videos(
        os.environ.get("GOOGLE_DRIVE_FOLDER_ID")
    )
    print(f"Found {len(video_urls)} videos in Google Drive folder.")
    print(f"Video URLs: {video_urls[:5]}...")
