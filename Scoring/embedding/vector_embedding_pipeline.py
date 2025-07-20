import pandas as pd
import numpy as np
import os
import time
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import hashlib
import numpy as np


import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from videos.Summarizer import Summarizer
from ground_truth.gemini_evaluation import GeminiEvaluator
from RAGStorage import RAGStorage

class VectorEmbeddingPipeline:
    def __init__(self):
        load_dotenv()
        
        self.summarizer = Summarizer()

        # Initialize Gemini evaluator (optional)
        try:
            self.evaluator = GeminiEvaluator()
            print("✅ Gemini evaluator initialized successfully")
        except Exception as e:
            print(f"⚠️ Gemini evaluator initialization failed: {e}")
            print("   Pipeline will continue without Gemini evaluation capabilities")
            self.evaluator = None
        
        # Initialize RAGStorage for Pinecone
        self.index_name = "motivational-interviewing-videos"
        self.dimension = 1536  # Adjust based on your embedding model
        
        # Initialize RAG storage with field mapping for video data
        # Note: RAGStorage requires exact field names "id" and "text"
        field_map = {
            "id": "video_id",                     # Required: Unique video ID
            "text": "pegasus_summary",           # Required: Summarized text from TwelveLabs Pegasus model
            "video_title": "video_title",       # Original video title from CSV metadata
            "eval_score": "gemini_evaluation",  # Google Gemini's evaluated score as groundtruth
            "embeddings": "twelvelabs_embeddings" # Vector embeddings from TwelveLabs model
        }
        
        try:
            self.rag_storage = RAGStorage(self.index_name, field_map)
            print(f"RAGStorage initialized successfully for index: {self.index_name}")
        except Exception as e:
            print(f"RAGStorage initialization failed: {e}")
            raise ValueError(f"Failed to initialize RAGStorage: {e}")
        
        # Verify TwelveLabs API key
        twelve_labs_key = os.getenv("TWELVE_LABS_API_KEY", '')
        if not twelve_labs_key:
            raise ValueError("TWELVE_LABS_API_KEY not found in environment variables")

    def ensure_rag_storage(self):
        """Ensure RAGStorage is properly initialized"""
        try:
            # RAGStorage handles index creation in its constructor
            # Test the connection by trying to retrieve (with limit 1 to avoid large data)
            test_vectors = self.rag_storage.retrieve(limit=1)
            print(f"✅ RAG Storage ready for index: {self.index_name}")
            print(f"   Current vector count: {len(test_vectors) if test_vectors else 0}")
            return True
            
        except Exception as e:
            print(f"Error with RAG Storage: {e}")
            return False
    
    def get_video_data(self, video_url: str, video_title: str) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive video data: embeddings, Pegasus summary, and Gemini evaluation
        """
        try:
            # Create a unique index name for this video
            safe_title = "".join(c for c in video_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            index_name = f"temp_{safe_title[:20]}_{int(time.time())}"
            
            print(f"Processing video: {video_title}")
 
            # Create summarization task (this generates embeddings and summary)
            try:
                result = self.summarizer.summarize(index_name, video_url)
            except Exception as e:
                print(f"Error summarizing video {video_title}: {e}")
                return None
            
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
                
                time.sleep(2)
                wait_time += 10
            
            if wait_time >= max_wait:
                print(f"Timeout waiting for video processing: {video_title}")
                return None
            
            # Get Pegasus summary and embeddings
            video_data = {
                'embeddings': None,
                'pegasus_summary': None,
                'gemini_score': None
            }
            
            try:
                # Get Pegasus summary using TwelveLabs summarize API
                summary_results = self.summarizer.client.summarize(
                    video_id=task_status.video_id,
                    type="summary"
                )
                
                if summary_results and hasattr(summary_results, 'summary'):
                    video_data['pegasus_summary'] = summary_results.summary
                
                # Get embeddings using search/generate
                search_results = self.summarizer.client.index.video.retrieve(
                    index_id=index_id,
                    id=task_status.video_id,
                    embedding_option=["visual-text", "audio"],
                )

                # Extract embeddings from search results
                if search_results and hasattr(search_results, 'data') and search_results.data:
                    embeddings = search_results.embedding
                    if embeddings is not None:
                        video_data['embeddings'] = embeddings
                        print(f"Got embeddings for: {video_title}")
                    else: 
                        print(f"No embeddings found for: {video_title}")
                 
                
            except Exception as e:
                print(f"Error extracting data for {video_title}: {e}")
            
            # Get Gemini evaluation if available
            if self.evaluator and video_data['pegasus_summary']:
                try:
                    evaluation_prompt = f"Evaluate the quality of this motivational interviewing summary: {video_data['pegasus_summary']}"
                    gemini_result = self.evaluator.evaluate(evaluation_prompt)
                    
                    # Extract numeric score from Gemini response (you may need to adjust this)
                    if gemini_result:
                        # Simple extraction - look for numbers in response
                        import re
                        scores = re.findall(r'\d+(?:\.\d+)?', gemini_result)
                        if scores:
                            video_data['gemini_score'] = float(scores[0])
                            print(f"Got Gemini score for: {video_title}")
                        else:
                            video_data['gemini_score'] = gemini_result  # Store full text if no numeric score
                            
                except Exception as e:
                    print(f"Error getting Gemini evaluation for {video_title}: {e}")
                    video_data['gemini_score'] = None
            
            # Clean up temporary index
            try:
                self.summarizer.delete_index(index_id)
            except:
                pass
                
            return video_data
            
        except Exception as e:
            print(f"Error processing video {video_title}: {e}")
            return None
    
    def create_video_id(self, video_url: str) -> str:
        """Create a unique ID for the video based on URL"""
        return hashlib.md5(video_url.encode()).hexdigest()
    
    def process_videos_to_rag_storage(self) -> pd.DataFrame:
        """
        Process all videos and upload embeddings to RAGStorage
        """
        if not self.ensure_rag_storage():
            raise Exception("Failed to set up RAG Storage")
        
        # Get unique videos from metadata
        videos_list = self.summarizer.list_drive_videos(folder_id=os.environ.get("GOOGLE_DRIVE_FOLDER_ID"))
        
        results = []
        successful_uploads = 0
        failed_uploads = 0
        
        print(f"Processing {len(videos_list)} unique videos...")
        
        # Prepare vectors for batch upload
        vectors_to_store = []
        
        for row in videos_list:
            drive_id = row['id']
            video_title = row['name']
            video_id = self.create_video_id(drive_id)
        
            try:
                video_url = f"https://drive.google.com/uc?export=download&id={drive_id}"
                video_data = self.get_video_data(video_url, video_title)   

                if video_data is None or not video_data.get("pegasus_summary"):
                    failed_uploads += 1
                    results.append({
                        'video_id': video_id,
                        'video_url': video_url,
                        'video_title': video_title,
                        'status': 'failed',
                        'embedding_dimension': 0,
                        'error': 'Failed to extract video data (possibly broken URL)'
                    })
                    continue
                
                # Prepare vector data for RAGStorage with all required fields
                # Note: RAGStorage requires "id" and "text" as exact field names
                vector_data = {
                    "id": video_id,
                    "values": video_data['embeddings'],   # embeddings vector as float list
                    "metadata": {
                        "text": video_data['pegasus_summary'],
                        "video_title": video_title,
                        "eval_score": video_data['gemini_score'],
                        "video_url": video_url,
                        "topic": row.get('topic', ''),
                        "mi_quality": row.get('mi_quality', ''),
                        "transcript_id": str(row.get('transcript_id', '')),
                        "processed_date": time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                }
                
                vectors_to_store.append(vector_data)
                
                successful_uploads += 1
                results.append({
                    'video_id': video_id,
                    'video_url': video_url,
                    'video_title': video_title,
                    'status': 'success',
                    'embedding_dimension': len(video_data['embeddings']) if video_data and video_data['embeddings'] is not None else 0,
                    'has_summary': bool(video_data['pegasus_summary']),
                    'has_gemini_score': bool(video_data['gemini_score']),
                    'gemini_score': video_data['gemini_score']
                })
                
                print(f"Prepared for storage ({successful_uploads}/{len(videos_list)}): {video_title}")
                
                try:
                    if len(vectors_to_store) >= 5:
                        self.rag_storage.store(vectors_to_store)
                        print(f"Stored batch of {len(vectors_to_store)} vectors")
                        vectors_to_store = []

                                    # Rate limiting
                    time.sleep(2)
                except Exception as e:
                    failed_uploads += 1
                    print(f"❌ Failed to store vector for {video_title}: {e}")
                    results.append({
                        'video_id': video_id,
                        'video_url': video_url,
                        'video_title': video_title,
                        'status': 'store_failed',
                        'embedding_dimension': 0,
                        'error': str(e)
                    })
                    continue
                
                
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
        
        # Store any remaining vectors
        if vectors_to_store:
            self.rag_storage.store(vectors_to_store)
            print(f"Stored final batch of {len(vectors_to_store)} vectors")
        
        print(f"\nProcessing Summary:")
        print(f"Successful uploads: {successful_uploads}")
        
        # Create results DataFrame
        results_df = pd.DataFrame(results)
        return results_df
  
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
        csv_path = os.path.join(output_path, f"complete_dataset_{timestamp}.csv")
        complete_df = pd.concat(list(datasets.values()), ignore_index=True)
        complete_df.to_csv(csv_path, index=False)
        print(f"Exported complete dataset: {csv_path}")
        
        return output_path

def main():
    """
    Main execution function with storage management options
    
    Args:
        clear_downloads: Remove old local downloads not in current CSV
        clear_drive: Remove duplicate files from Google Drive
        clear_pinecone: Clear all vectors from Pinecone index
        show_status: Display storage status before and after
    """
    try:
        # Initialize pipeline with cleanup options
        pipeline = VectorEmbeddingPipeline()
        
        # Create comprehensive dataset
        datasets = pipeline.process_videos_to_rag_storage()
        
        # Export datasets
        output_dir = pipeline.export_datasets(datasets)

        
        print(f"\nPipeline completed successfully!")
        print(f"Datasets exported to: {output_dir}")
        
        
        return datasets
        
    except Exception as e:
        print(f"Pipeline failed: {e}")
        return None

if __name__ == "__main__":

    datasets = main()
