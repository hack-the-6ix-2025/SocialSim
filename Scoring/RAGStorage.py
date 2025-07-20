import time
from pinecone import Pinecone
import os
from dotenv import load_dotenv

class RAGStorage:
    index_name: str = None
    ragProcessor: any = None
    def __init__(self, index_name, field_map: dict = {"text": "chunk_text"}):
        load_dotenv()
        self.index_name = index_name
        self.ragProcessor = Pinecone(
            api_key=os.environ.get("PINECONE_API_KEY"),
        )
        if not self.ragProcessor.has_index(index_name):
            print(f"Index '{index_name}' does not exist. Creating...")
            try:
                self.ragProcessor.create_index_for_model(
                    name=index_name,
                    cloud="aws",
                    region="us-east-1",
                    embed={
                        "model":"llama-text-embed-v2",
                        "field_map":field_map
                    }
                )

                time.sleep(2)  
            except Exception as e:
                print(f"Error creating index '{index_name}': {e}")
                raise ValueError(f"Failed to create index: {e}")
            print(f"Index '{index_name}' created successfully.")
        else:
            print(f"Index '{index_name}' already exists.")

    def store(self, vectors: list[dict]):
        for vector in vectors:
            if not isinstance(vector, dict) or "id" not in vector or "text" not in vector:
                raise ValueError("Each vector must be a dict with at least 'id' and 'text' keys.")
        # Get the index instance
        if self.index_name is None:
            raise ValueError("Index name is not initialized while creating this object.")
        else: 
            index = self.ragProcessor.Index(self.index_name)
            # Store the data in the index
            try:
                index.upsert_records(
                    namespace=self.index_name.replace("index", "namespace"),
                    records=vectors
                )
                print(f"Data stored successfully in index '{self.index_name}'.")
            except Exception as e:
                print(f"Error storing data in index '{self.index_name}': {e}")
                raise ValueError(f"Failed to store data: {e}")
        return True

    def retrieve(self, index_name: str = None, limit: int = None, ids: list = None):
        # Retrieve vector embeddings from Pinecone based on index_name
        idx_name = index_name if index_name else self.index_name
        if idx_name is None:
            raise ValueError("Index name must be provided.")
        index = self.ragProcessor.Index(idx_name)
        try:
            if ids:
                # Fetch specific vectors by IDs
                results = index.fetch(
                    ids=ids,
                    namespace=idx_name.replace("index", "namespace")
                )
                if "vectors" not in results:
                    return {}
                return results["vectors"]
            else:
                # Query all vectors using a dummy query to get all results
                # Since we can't fetch all without IDs, we'll use query with a broad search
                results = index.query(
                    vector=[0.0] * 1536,  # Dummy vector - adjust dimension as needed
                    top_k=limit or 10000,  # Default large number to get all
                    include_metadata=True,
                    namespace=idx_name.replace("index", "namespace")
                )
                
                # Convert query results to fetch-like format
                vectors = {}
                if hasattr(results, 'matches'):
                    for match in results.matches:
                        vectors[match.id] = {
                            'id': match.id,
                            'values': match.values if hasattr(match, 'values') else [],
                            'metadata': match.metadata if hasattr(match, 'metadata') else {}
                        }
                
                return vectors
                
        except Exception as e:
            print(f"Error retrieving vectors from index '{idx_name}': {e}")
            # Return empty dict instead of raising error for better error handling
            return {}

if __name__ == "__main__":
    index_name = "example-index"
    rag_storage = RAGStorage(index_name)
    print(f"RAGStorage initialized with index: {rag_storage.index_name}")