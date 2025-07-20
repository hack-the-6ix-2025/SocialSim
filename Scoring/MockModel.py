from Model import Model
import numpy as np
import time

class MockModel(Model):
    def __init__(self):
        super().__init__()
        self.model = None  # Mock model does not use a real model

    def train(self, X, y):
        """
        Mock training method that simulates training without actually fitting a model.
        
        Args:
            X: Features for training
            y: Labels for training
        
        Returns:
            tuple: Validation accuracy, test accuracy, mock model path
        """
        # Simulate training by returning fixed accuracies and a mock model path
        return 0.85, 0.80, "mock_model_path.joblib"

    def predict(self, X):
        """
        Mock prediction method that returns a fixed prediction.
        
        Args:
            X: Features for prediction
        
        Returns:
            array: Predicted labels (simulated)
        """
        np.random.seed(int(time.time()))
        return np.random.randint(0, 101, size=len(X))