# Vector Embedding Pipeline for Motivational Interviewing Videos

This pipeline processes motivational interviewing videos, generates vector embeddings using TwelveLabs, uploads them to Pinecone, and creates comprehensive pandas datasets for analysis.

## Features

- **Video Processing**: Extracts embeddings from motivational interviewing videos using TwelveLabs API
- **Vector Storage**: Uploads embeddings to Pinecone for similarity search
- **Dataset Creation**: Combines video metadata, embeddings, and file status into pandas DataFrames
- **Export Functionality**: Exports datasets to CSV and pickle formats
- **Query Interface**: Search for similar videos using natural language queries

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Update the `.env` file with your API keys:

```env
PARENT_FOLDER_ID = 'your_google_drive_folder_id'
PINECONE_API_KEY = 'your_pinecone_api_key'
TWELVE_LABS_API_KEY = 'your_twelve_labs_api_key'
GOOGLE_GEMINI_API_KEY = 'your_gemini_api_key'
```

### 3. API Key Setup

- **TwelveLabs**: Get API key from [TwelveLabs Dashboard](https://dashboard.twelvelabs.io/)
- **Pinecone**: Get API key from [Pinecone Console](https://app.pinecone.io/)
- **Google Gemini**: Get API key from [Google AI Studio](https://aistudio.google.com/)

## Usage

### Run Complete Pipeline

```bash
python run_pipeline.py full
```

This will:
1. Process all videos from the CSV metadata
2. Generate embeddings using TwelveLabs
3. Upload embeddings to Pinecone
4. Create comprehensive datasets
5. Export to CSV and pickle files

### Query Similar Videos

```bash
python run_pipeline.py query "alcohol intervention techniques"
```

### Show Data Overview

```bash
python run_pipeline.py data
```

### Direct Python Usage

```python
from vector_embedding_pipeline import VectorEmbeddingPipeline

# Initialize pipeline
pipeline = VectorEmbeddingPipeline()

# Create datasets
datasets = pipeline.create_comprehensive_dataset()

# Export datasets
output_dir = pipeline.export_datasets(datasets)

# Query similar videos
results = pipeline.query_similar_videos("motivational interviewing", top_k=5)
```

## Output Datasets

The pipeline creates several datasets:

### 1. `full_dataset`
Complete dataset with all utterances, video metadata, embedding status, and file information.

**Columns:**
- `mi_quality`: Quality rating of motivational interviewing
- `transcript_id`: Unique transcript identifier
- `video_title`: Title of the video
- `video_url`: YouTube URL
- `topic`: Main topic (e.g., "reducing alcohol consumption")
- `utterance_id`: ID of specific utterance
- `interlocutor`: Speaker (therapist/client)
- `timestamp`: Time in video
- `utterance_text`: Spoken text
- `video_id`: Generated unique video ID
- `status`: Embedding processing status
- `embedding_dimension`: Size of embedding vector
- `file_downloaded`: Whether video file exists locally

### 2. `embedding_results`
Summary of embedding processing results for each video.

### 3. `video_summary`
One row per unique video with aggregated information.

### 4. `file_status`
Download status for each video file.

### 5. `summary_stats`
Overall statistics about the dataset.

## Architecture

```
vector_embedding_pipeline.py
├── VectorEmbeddingPipeline
│   ├── __init__()                    # Initialize clients and load data
│   ├── ensure_pinecone_index()       # Create/connect to Pinecone index
│   ├── get_video_embeddings()        # Generate embeddings via TwelveLabs
│   ├── process_videos_to_pinecone()  # Process all videos and upload
│   ├── create_comprehensive_dataset() # Combine all data sources
│   ├── export_datasets()             # Export to CSV/pickle
│   └── query_similar_videos()        # Search similar videos
```

## Integration with Existing Code

The pipeline integrates with your existing modules:

- **`summarizer/Summarizer.py`**: Video processing and TwelveLabs integration
- **`gemini_evaluation.py`**: Gemini AI evaluation capabilities
- **`summarizer/download_video.py`**: Video downloading and file management
- **`datasets/all_videos_metadata.csv`**: Source metadata

## Pinecone Index Structure

**Index Name**: `motivational-interviewing-videos`
**Dimensions**: 1536 (adjust based on embedding model)
**Metric**: Cosine similarity

**Metadata Schema**:
```json
{
  "video_url": "https://youtube.com/watch?v=...",
  "video_title": "Brief intervention: Barbara",
  "topic": "reducing alcohol consumption",
  "mi_quality": "high",
  "transcript_id": "0",
  "processed_date": "2025-01-19 10:30:00"
}
```

## Troubleshooting

### Common Issues

1. **Missing API Keys**: Ensure all API keys are correctly set in `.env`
2. **TwelveLabs Quota**: Check your TwelveLabs usage limits
3. **Pinecone Connection**: Verify Pinecone API key and region settings
4. **File Paths**: Ensure video files and CSV data are in correct locations

### Debug Mode

Add debug prints by modifying the pipeline:

```python
# Enable debug mode
pipeline = VectorEmbeddingPipeline()
pipeline.debug = True
```

## Example Output

```
=== Vector Embedding Pipeline Runner ===

1. Initializing pipeline...
Connected to Pinecone index: motivational-interviewing-videos

2. Processing videos and creating datasets...
Found 120 unique video URLs to download
Processing video: Brief intervention: "Barbara"
Successfully processed (1/120): Brief intervention: "Barbara"
...

3. Exporting datasets...
Exported full_dataset: exported_datasets/full_dataset_20250119_103000.csv
Exported embedding_results: exported_datasets/embedding_results_20250119_103000.csv
...

✅ Pipeline completed successfully!
📁 Datasets exported to: exported_datasets

📊 Dataset Summary:
   total_videos: 120
   total_utterances: 32954
   videos_with_embeddings: 115
   downloaded_files: 122
   unique_topics: 15
```

## Next Steps

1. **Enhance Embeddings**: Experiment with different embedding models
2. **Add Evaluation**: Integrate with Gemini evaluation pipeline
3. **Visualization**: Create dashboards for dataset exploration
4. **Fine-tuning**: Use embeddings for model training
5. **Search Interface**: Build web interface for video search
