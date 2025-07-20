from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import time
import os
import numpy as np

class Model:
    def __init__(self):
        self.model = RandomForestClassifier()

    def train(self, X, y):
        """
        Train the model with the provided features and labels.

        Args:
            X: Features for training
            y: Labels for training

        Returns:
            tuple: Validation accuracy, test accuracy, model path
        """
        X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
        X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

        self.model.fit(X_train, y_train)

        val_accuracy = self.model.score(X_val, y_val)
        test_accuracy = self.model.score(X_test, y_test)

        # Save model
        persist_dir = os.path.join(os.path.dirname(__file__), "models")
        os.makedirs(persist_dir, exist_ok=True)

        timestamp = time.strftime('%Y%m%d_%H%M%S')
        model_path = os.path.join(persist_dir, f"scoring_model_{timestamp}.joblib")
        joblib.dump(self.model, model_path)

        return val_accuracy, test_accuracy, model_path

    def predict(self, X):
        """
        Predict labels for the provided features.

        Args:
            X: Features for prediction

        Returns:
            array: Predicted labels
        """
        return self.model.predict(X)
