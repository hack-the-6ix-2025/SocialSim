#!/usr/bin/env python3
"""
Simple runner script for the Vector Embedding Pipeline
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vector_embedding_pipeline import VectorEmbeddingPipeline
import pandas as pd

def run_full_pipeline():
    """Run the complete pipeline"""
    print("=== Vector Embedding Pipeline Runner ===\n")
    
    try:
        # Initialize pipeline
        print("1. Initializing pipeline...")
        pipeline = VectorEmbeddingPipeline()
        
        # Create comprehensive dataset
        print("2. Processing videos and creating datasets...")
        datasets = pipeline.create_comprehensive_dataset()
        
        # Export datasets
        print("3. Exporting datasets...")
        output_dir = pipeline.export_datasets(datasets)
        
        print(f"\n✅ Pipeline completed successfully!")
        print(f"📁 Datasets exported to: {output_dir}")
        
        # Display summary
        print("\n📊 Dataset Summary:")
        summary = datasets['summary_stats'].iloc[0]
        for key, value in summary.items():
            print(f"   {key}: {value}")
        
        return datasets
        
    except Exception as e:
        print(f"❌ Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def run_query_test(query: str = "motivational interviewing techniques"):
    """Test querying functionality"""
    print(f"=== Testing Query: '{query}' ===\n")
    
    try:
        pipeline = VectorEmbeddingPipeline()
        if not pipeline.ensure_pinecone_index():
            print("❌ Could not connect to Pinecone index")
            return
        
        results = pipeline.query_similar_videos(query, top_k=5)
        
        if not results.empty:
            print("🔍 Query Results:")
            for idx, row in results.iterrows():
                print(f"   {idx+1}. {row['video_title']} (Score: {row['similarity_score']:.3f})")
        else:
            print("No results found")
            
    except Exception as e:
        print(f"❌ Query test failed: {e}")

def show_existing_data():
    """Show information about existing data"""
    print("=== Existing Data Overview ===\n")
    
    try:
        pipeline = VectorEmbeddingPipeline()
        
        print(f"📊 CSV Data:")
        print(f"   Total rows: {len(pipeline.metadata_df)}")
        print(f"   Unique videos: {pipeline.metadata_df['video_url'].nunique()}")
        print(f"   Topics: {list(pipeline.metadata_df['topic'].unique())}")
        
        print(f"\n🎥 Video URLs:")
        print(f"   Unique URLs found: {len(pipeline.video_urls)}")
        
        # Check downloaded files
        from summarizer.download_video import verify_downloaded_files
        actual_files, _ = verify_downloaded_files()
        print(f"\n📁 Downloaded Files:")
        print(f"   Local files: {len(actual_files) if actual_files else 0}")
        
    except Exception as e:
        print(f"❌ Error showing data: {e}")

def test_environment():
    """Test environment setup and API connections"""
    print("=== Testing Environment Setup ===\n")
    
    try:
        # Test pipeline initialization
        print("1. Testing pipeline initialization...")
        pipeline = VectorEmbeddingPipeline()
        print("✅ Pipeline initialized successfully\n")
        
        # Test Pinecone connection
        print("2. Testing Pinecone connection...")
        if pipeline.ensure_pinecone_index():
            print("✅ Pinecone connection successful\n")
        else:
            print("❌ Pinecone connection failed\n")
            return False
        
        # Test TwelveLabs connection
        print("3. Testing TwelveLabs connection...")
        try:
            indexes = pipeline.summarizer.list_indexes()
            print(f"✅ TwelveLabs connection successful")
            print(f"   Found {len(indexes.get('data', []))} existing indexes\n")
        except Exception as e:
            print(f"❌ TwelveLabs connection failed: {e}\n")
            return False
        
        print("🎉 All environment tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Environment test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main menu"""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "full":
            run_full_pipeline()
        elif command == "query":
            query = sys.argv[2] if len(sys.argv) > 2 else "motivational interviewing"
            run_query_test(query)
        elif command == "data":
            show_existing_data()
        elif command == "test":
            test_environment()
        else:
            print(f"Unknown command: {command}")
    else:
        print("Vector Embedding Pipeline Runner")
        print("\nUsage:")
        print("  python run_pipeline.py test     - Test environment setup and API connections")
        print("  python run_pipeline.py full     - Run complete pipeline")
        print("  python run_pipeline.py query    - Test query functionality")
        print("  python run_pipeline.py data     - Show existing data overview")
        print("\nExample:")
        print("  python run_pipeline.py test     # Start here to verify setup")
        print("  python run_pipeline.py full     # Run complete processing")

if __name__ == "__main__":
    main()
