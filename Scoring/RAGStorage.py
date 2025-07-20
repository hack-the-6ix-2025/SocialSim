import time
import os
from dotenv import load_dotenv
from pinecone import Pinecone


class RAGStorage:
    def __init__(self, index_name: str, field_map: dict = {"text": "chunk_text"}):
        load_dotenv()
        self.index_name = index_name
        self.namespace = index_name.replace("index", "namespace")
        self.field_map = field_map

        api_key = os.environ.get("PINECONE_API_KEY")
        if not api_key:
            raise ValueError("PINECONE_API_KEY not found in environment variables.")

        self.ragProcessor = Pinecone(api_key=api_key)

        if not self.ragProcessor.has_index(index_name):
            print(f"Index '{index_name}' does not exist. Creating...")
            try:
                self.ragProcessor.create_index_for_model(
                    name=index_name,
                    cloud="aws",
                    region="us-east-1",
                    embed={
                        "model": "llama-text-embed-v2",
                        "field_map": field_map
                    }
                )
                time.sleep(2)
                print(f"Index '{index_name}' created successfully.")
            except Exception as e:
                raise RuntimeError(f"❌ Error creating index '{index_name}': {e}")
        else:
            print(f"Index '{index_name}' already exists.")

    def store(self, vectors: list[dict]):
        if not vectors:
            print("⚠️ No vectors to store.")
            return False

        index = self.ragProcessor.Index(self.index_name)
        valid_vectors = []

        for vector in vectors:
            if not isinstance(vector, dict):
                print(f"❌ Invalid vector format (not dict): {vector}")
                continue

            if "id" not in vector:
                print(f"❌ Missing 'id' in vector: {vector}")
                continue

            # Use field_map to validate required fields
            expected_field = self.field_map.get("text", "text")
            if "metadata" not in vector or expected_field not in vector["metadata"]:
                print(f"❌ Missing '{expected_field}' in vector: {vector['id']}")
                continue

            valid_vectors.append(vector)

        if not valid_vectors:
            print("⚠️ No valid vectors to store.")
            return False

        try:
            index.upsert_records(
                namespace=self.namespace,
                records=valid_vectors
            )
            print(f"✅ Stored {len(valid_vectors)} vectors to index '{self.index_name}' (namespace: '{self.namespace}').")
        except Exception as e:
            raise RuntimeError(f"❌ Failed to store vectors: {e}")

        return True

    def store_one(self, vector: dict):
        return self.store([vector])

    def retrieve(self, index_name: str = None, limit: int = None, ids: list = None):
        idx_name = index_name if index_name else self.index_name
        namespace = idx_name.replace("index", "namespace")
        index = self.ragProcessor.Index(idx_name)

        try:
            if ids:
                results = index.fetch(ids=ids, namespace=namespace)
                return results.get("vectors", {})
            else:
                results = index.query(
                    vector=[0.0] * 1536,  # Dummy vector
                    top_k=limit or 10000,
                    include_metadata=True,
                    namespace=namespace
                )

                vectors = {}
                for match in getattr(results, "matches", []):
                    vectors[match.id] = {
                        "id": match.id,
                        "values": getattr(match, "values", []),
                        "metadata": getattr(match, "metadata", {})
                    }
                return vectors

        except Exception as e:
            print(f"❌ Error retrieving vectors from index '{idx_name}': {e}")
            return {}


if __name__ == "__main__":
    index_name = "motivational-index"
    rag_storage = RAGStorage(index_name=index_name, field_map={"text": "chunk_text"})

    # Example use
    dummy_vector = {
        "id": "sample-1",
        "chunk_text": "This is a test chunk for embedding."
    }

    rag_storage.store_one(dummy_vector)
