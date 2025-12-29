# Plant AI Project

This project aims to create an AI for plant information and disease detection.

## Setup

1.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Download the dataset:**
    ```bash
    git clone https://github.com/spMohanty/PlantVillage-Dataset data
    ```

3.  **Train the model:**
    ```bash
    cd src
    python train.py
    ```
    *Note: The training process will take a very long time.*

4.  **Run a prediction:**
    ```bash
    cd src
    python app.py <path_to_image>
    ```
