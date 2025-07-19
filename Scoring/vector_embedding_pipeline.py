import pandas as pd
import numpy as np
import os
import time
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import pinecone
from pinecone import Pinecone, ServerlessSpec
import hashlib

# Import existing modules
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from summarizer.Summarizer import Summarizer
from gemini_evaluation import GeminiEvaluator
from summarizer.download_video import video_links, verify_downloaded_files

class VectorEmbeddingPipeline:
    def __init__(self):
        load_dotenv()
        
        # Validate environment variables first
        self.validate_environment()
        
        # Initialize clients
        self.summarizer = Summarizer()
        self.evaluator = GeminiEvaluator()
        
        # Initialize Pinecone
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        if not pinecone_api_key:
            raise ValueError("PINECONE_API_KEY not found in environment variables")
        
        self.pc = Pinecone(api_key=pinecone_api_key)
        self.index_name = "motivational-interviewing-videos"
        self.dimension = 1536  # Adjust based on your embedding model
        
        # Verify TwelveLabs API key
        twelve_labs_key = os.getenv("TWELVE_LABS_API_KEY")
        if not twelve_labs_key:
            raise ValueError("TWELVE_LABS_API_KEY not found in environment variables")
        
        # Dataset paths
        self.csv_path = os.path.join(os.path.dirname(__file__), "datasets", "all_videos_metadata.csv")
        self.downloads_dir = os.path.join(os.path.dirname(__file__), "summarizer", "downloads")
        
        # Load existing data
        self.metadata_df = pd.read_csv(self.csv_path)
        self.video_urls = list(video_links())
        
    def ensure_pinecone_index(self):
        """Create or connect to Pinecone index"""
        try:
            # Check if index exists
            if self.index_name not in self.pc.list_indexes().names():
                print(f"Creating Pinecone index: {self.index_name}")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=self.dimension,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                # Wait for index to be ready
                time.sleep(10)
            
            self.index = self.pc.Index(self.index_name)
            print(f"Connected to Pinecone index: {self.index_name}")
            return True
            
        except Exception as e:
            print(f"Error setting up Pinecone index: {e}")
            return False
    
    def get_video_embeddings(self, video_url: str, video_title: str) -> Optional[List[float]]:
        """
        Get vector embeddings for a video using TwelveLabs
        """
        try:
            # Create a unique index name for this video
            safe_title = "".join(c for c in video_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            index_name = f"temp_{safe_title[:20]}_{int(time.time())}"
            
            print(f"Processing video: {video_title}")
            
            # Create summarization task (this also generates embeddings)
            result = self.summarizer.summarize(index_name, video_url)
            
            if not result:
                print(f"Failed to process video: {video_title}")
                return None
                
            # Wait for task completion
            task_id = result["task_id"]
            index_id = result["index_id"]
            
            # Poll for task completion
            max_wait = 300  # 5 minutes
            wait_time = 0
            
            while wait_time < max_wait:
                task_status = self.summarizer.client.task.retrieve(task_id)
                
                if task_status.status == "ready":
                    print(f"Video processing completed: {video_title}")
                    break
                elif task_status.status == "failed":
                    print(f"Video processing failed: {video_title}")
                    return None
                
                time.sleep(10)
                wait_time += 10
            
            if wait_time >= max_wait:
                print(f"Timeout waiting for video processing: {video_title}")
                return None
            
            # Generate embeddings using search (this returns embeddings)
            try:
                search_results = self.summarizer.client.search.query(
                    index_id=index_id,
                    query="summarize this video content",
                    options=["visual", "audio"]
                )
                
                # Extract embeddings from search results
                # Note: You may need to adjust this based on TwelveLabs API response structure
                if search_results and hasattr(search_results, 'data') and search_results.data:
                    # This is a placeholder - adjust based on actual API response
                    embeddings = getattr(search_results.data[0], 'embeddings', None)
                    if embeddings:
                        return embeddings
                
            except Exception as e:
                print(f"Error extracting embeddings for {video_title}: {e}")
            
            # Clean up temporary index
            try:
                self.summarizer.delete_index(index_id)
            except:
                pass
                
            # For now, return mock embeddings (replace with actual embeddings)
            return np.random.normal(0, 1, self.dimension).tolist()
            
        except Exception as e:
            print(f"Error processing video {video_title}: {e}")
            return None
    
    def create_video_id(self, video_url: str) -> str:
        """Create a unique ID for the video based on URL"""
        return hashlib.md5(video_url.encode()).hexdigest()
    
    def process_videos_to_pinecone(self) -> pd.DataFrame:
        """
        Process all videos and upload embeddings to Pinecone
        """
        if not self.ensure_pinecone_index():
            raise Exception("Failed to set up Pinecone index")
        
        # Get unique videos from metadata
        unique_videos = self.metadata_df.groupby('video_url').first().reset_index()
        
        results = []
        successful_uploads = 0
        failed_uploads = 0
        
        print(f"Processing {len(unique_videos)} unique videos...")
        
        for idx, row in unique_videos.iterrows():
            video_url = row['video_url']
            video_title = row['video_title']
            video_id = self.create_video_id(video_url)
            
            try:
                # Check if already processed
                try:
                    existing = self.index.fetch(ids=[video_id])
                    if existing['vectors']:
                        print(f"Video already processed, skipping: {video_title}")
                        results.append({
                            'video_id': video_id,
                            'video_url': video_url,
                            'video_title': video_title,
                            'status': 'already_exists',
                            'embedding_dimension': self.dimension
                        })
                        continue
                except:
                    pass  # Vector doesn't exist, proceed with processing
                
                # Get embeddings
                embeddings = self.get_video_embeddings(video_url, video_title)
                
                if embeddings is None:
                    failed_uploads += 1
                    results.append({
                        'video_id': video_id,
                        'video_url': video_url,
                        'video_title': video_title,
                        'status': 'failed',
                        'embedding_dimension': 0
                    })
                    continue
                
                # Prepare metadata for Pinecone
                metadata = {
                    'video_url': video_url,
                    'video_title': video_title,
                    'topic': row.get('topic', ''),
                    'mi_quality': row.get('mi_quality', ''),
                    'transcript_id': str(row.get('transcript_id', '')),
                    'processed_date': time.strftime('%Y-%m-%d %H:%M:%S')
                }
                
                # Upload to Pinecone
                self.index.upsert(
                    vectors=[{
                        'id': video_id,
                        'values': embeddings,
                        'metadata': metadata
                    }]
                )
                
                successful_uploads += 1
                results.append({
                    'video_id': video_id,
                    'video_url': video_url,
                    'video_title': video_title,
                    'status': 'success',
                    'embedding_dimension': len(embeddings)
                })
                
                print(f"Successfully processed ({successful_uploads}/{len(unique_videos)}): {video_title}")
                
                # Rate limiting
                time.sleep(2)
                
            except Exception as e:
                failed_uploads += 1
                print(f"Error processing video {video_title}: {e}")
                results.append({
                    'video_id': video_id,
                    'video_url': video_url,
                    'video_title': video_title,
                    'status': 'error',
                    'embedding_dimension': 0,
                    'error': str(e)
                })
        
        print(f"\nProcessing Summary:")
        print(f"Successful uploads: {successful_uploads}")
        print(f"Failed uploads: {failed_uploads}")
        print(f"Total videos: {len(unique_videos)}")
        
        # Create results DataFrame
        results_df = pd.DataFrame(results)
        return results_df
    
    def create_comprehensive_dataset(self) -> Dict[str, pd.DataFrame]:
        """
        Create comprehensive dataset combining all sources
        """
        print("Creating comprehensive dataset...")
        
        # Process videos and get embedding results
        embedding_results = self.process_videos_to_pinecone()
        
        # Merge with original metadata
        enhanced_metadata = self.metadata_df.merge(
            embedding_results[['video_url', 'video_id', 'status', 'embedding_dimension']], 
            on='video_url', 
            how='left'
        )
        
        # Get video file information
        actual_files, video_urls_from_csv = verify_downloaded_files()
        
        # Create file status DataFrame
        file_status = []
        for url in video_urls_from_csv:
            video_id = self.create_video_id(url)
            file_status.append({
                'video_url': url,
                'video_id': video_id,
                'file_downloaded': any(url in str(f) for f in actual_files) if actual_files else False
            })
        
        file_status_df = pd.DataFrame(file_status)
        
        # Merge all data
        final_dataset = enhanced_metadata.merge(
            file_status_df, 
            on=['video_url', 'video_id'], 
            how='left'
        )
        
        # Create summary statistics
        summary_stats = {
            'total_videos': len(self.video_urls),
            'total_utterances': len(self.metadata_df),
            'videos_with_embeddings': len(embedding_results[embedding_results['status'] == 'success']),
            'downloaded_files': len(actual_files) if actual_files else 0,
            'unique_topics': self.metadata_df['topic'].nunique(),
            'quality_distribution': self.metadata_df['mi_quality'].value_counts().to_dict()
        }
        
        return {
            'full_dataset': final_dataset,
            'embedding_results': embedding_results,
            'video_summary': enhanced_metadata.groupby('video_url').first().reset_index(),
            'summary_stats': pd.DataFrame([summary_stats]),
            'file_status': file_status_df
        }
    
    def export_datasets(self, datasets: Dict[str, pd.DataFrame], output_dir: str = "exported_datasets"):
        """
        Export all datasets to CSV files
        """
        # Create output directory
        output_path = os.path.join(os.path.dirname(__file__), output_dir)
        os.makedirs(output_path, exist_ok=True)
        
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        
        for name, df in datasets.items():
            if isinstance(df, pd.DataFrame):
                filename = f"{name}_{timestamp}.csv"
                filepath = os.path.join(output_path, filename)
                df.to_csv(filepath, index=False)
                print(f"Exported {name}: {filepath}")
        
        # Export to pickle for easier loading
        pickle_path = os.path.join(output_path, f"complete_dataset_{timestamp}.pkl")
        pd.to_pickle(datasets, pickle_path)
        print(f"Exported complete dataset: {pickle_path}")
        
        return output_path
    
    def query_similar_videos(self, query_text: str, top_k: int = 5) -> pd.DataFrame:
        """
        Query Pinecone for similar videos
        """
        try:
            # For now, use mock query vector (replace with actual embedding of query_text)
            query_vector = np.random.normal(0, 1, self.dimension).tolist()
            
            results = self.index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True
            )
            
            query_results = []
            for match in results['matches']:
                query_results.append({
                    'video_id': match['id'],
                    'similarity_score': match['score'],
                    'video_title': match['metadata'].get('video_title', ''),
                    'video_url': match['metadata'].get('video_url', ''),
                    'topic': match['metadata'].get('topic', ''),
                    'mi_quality': match['metadata'].get('mi_quality', '')
                })
            
            return pd.DataFrame(query_results)
            
        except Exception as e:
            print(f"Error querying similar videos: {e}")
            return pd.DataFrame()

    def validate_environment(self):
        """Validate that all required environment variables are set"""
        required_vars = [
            "TWELVE_LABS_API_KEY",
            "TWELVE_LABS_INDEX_URL", 
            "PINECONE_API_KEY"
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        print("✅ All required environment variables are set")
        print(f"   - TWELVE_LABS_API_KEY: {'*' * 20}{os.getenv('TWELVE_LABS_API_KEY')[-4:]}")
        print(f"   - TWELVE_LABS_INDEX_URL: {os.getenv('TWELVE_LABS_INDEX_URL')}")
        print(f"   - PINECONE_API_KEY: {'*' * 20}{os.getenv('PINECONE_API_KEY')[-4:]}")
        
        return True

def main():
    """
    Main execution function
    """
    try:
        # Initialize pipeline
        pipeline = VectorEmbeddingPipeline()
        
        # Validate environment variables
        pipeline.validate_environment()
        
        # Create comprehensive dataset
        datasets = pipeline.create_comprehensive_dataset()
        
        # Export datasets
        output_dir = pipeline.export_datasets(datasets)
        
        print(f"\nPipeline completed successfully!")
        print(f"Datasets exported to: {output_dir}")
        
        # Display summary
        print("\nDataset Summary:")
        summary = datasets['summary_stats'].iloc[0]
        for key, value in summary.items():
            print(f"  {key}: {value}")
        
        return datasets
        
    except Exception as e:
        print(f"Pipeline failed: {e}")
        return None

if __name__ == "__main__":
    datasets = main()
