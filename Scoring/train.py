import os
import time
import numpy as np
import pinecone
import joblib
from dotenv import load_dotenv
from Model import Model  # Your existing RandomForestClassifier wrapper

# Load environment variables
load_dotenv()

# Initialize Pinecone
pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment="us-east-1-aws"
)

# Load Pinecone index
INDEX_NAME = "your-index-name"
index = pinecone.Index(INDEX_NAME)

# Example list of known vector IDs
ids = ["id1", "id2", "id3"]  # Replace with actual IDs, or dynamically fetch from your DB

# Fetch embeddings and metadata from Pinecone
response = index.fetch(ids=ids)

vectors = []
labels = []

for vid, vdata in response.vectors.items():
    if 'values' not in vdata or 'metadata' not in vdata:
        continue
    vectors.append(vdata['values'])
    label = vdata['metadata'].get('label')
    if label is not None:
        labels.append(label)
    else:
        print(f"⚠️ Warning: Missing label for vector ID {vid}")

# Convert to numpy arrays
X = np.array(vectors)
y = np.array(labels)

if len(X) == 0 or len(y) == 0:
    raise ValueError("No valid vectors or labels found. Check your Pinecone index and metadata.")

# Train the model and persist it
model = Model()
val_acc, test_acc, model_path = model.train(X, y)  # Ensure Model.train() returns model_path

# Print summary
print(f"\n✅ Training complete")
print(f"📊 Validation Accuracy: {val_acc:.4f}")
print(f"📊 Test Accuracy: {test_acc:.4f}")
print(f"💾 Model saved to: {model_path}")
