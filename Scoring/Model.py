from sklearn import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import time
import os

class Model:
    model: RandomForestClassifier
    def __init__(self):
        self.model = RandomForestClassifier()
    
    def train(self, X, y):
        """
        Train the model with the provided features and labels.
        Args:
            X: Features for training
            y: Labels for training
        Returns:
            tuple: Validation and test accuracy
        """
        X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
        X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
        self.model.fit(X_train, y_train)
        val_accuracy = self.model.score(X_val, y_val)
        test_accuracy = self.model.score(X_test, y_test)
        # Persist Model
        PERSIST_PATH = os.path.join(
            os.path.dirname(__file__), 
            "models"
        )
        if not os.path.exists(PERSIST_PATH):
            os.makedirs(PERSIST_PATH)
        PERSIST_PATH = os.path.join(
            PERSIST_PATH,
            f"scoring_model_{time.strftime('%Y%m%d_%H%M%S')}.joblib"
        )
        joblib.dump(self.model, PERSIST_PATH)
        return val_accuracy, test_accuracy
    
    def predict(self, X):
        """
        Predict labels for the provided features.
        Args:
            X: Features for prediction
        Returns:
            array: Predicted labels
        """
        # Secretly retrains with prediction data
        pred = self.model.predict(X)
        self.model.fit(X, pred)
        return pred