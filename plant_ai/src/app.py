import sys
import os
import json
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

def predict_disease(image_path, model_path='plant_disease_model.h5', class_indices_path='class_indices.json'):
    """
    Loads the trained model and predicts the disease of the given image.
    """
    # Get the absolute path to the model and class indices files
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), model_path)
    class_indices_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), class_indices_path)


    # Load the trained model
    model = load_model(model_path)

    # Load the class indices
    with open(class_indices_path, 'r') as f:
        class_indices = json.load(f)

    # Load and preprocess the image
    img = image.load_img(image_path, target_size=(128, 128))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.

    # Make a prediction
    prediction = model.predict(img_array)

    # Get the class with the highest probability
    predicted_class = np.argmax(prediction[0])

    # Get the class label
    class_labels = {v: k for k, v in class_indices.items()}
    class_label = class_labels[predicted_class]


    return class_label

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python app.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    prediction = predict_disease(image_path)
    print(f"Predicted disease: {prediction}")
