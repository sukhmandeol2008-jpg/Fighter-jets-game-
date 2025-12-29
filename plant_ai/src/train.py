import json
from data_generator import create_data_generators
from model import create_model

def train_model():
    """
    Trains the CNN model using the PlantVillage dataset.
    """
    # Parameters
    batch_size = 32
    # This will take a long time to run. For a quicker test, reduce the number of epochs.
    epochs = 15

    # Create the training and validation data generators
    train_generator, validation_generator = create_data_generators(batch_size=batch_size)

    # Get the number of classes from the generator
    num_classes = len(train_generator.class_indices)

    # Save the class indices to a file
    with open('class_indices.json', 'w') as f:
        json.dump(train_generator.class_indices, f)


    # Create the model
    model = create_model(input_shape=(128, 128, 3), num_classes=num_classes)

    # Train the model
    history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // batch_size,
        epochs=epochs,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // batch_size
    )

    print("Training complete.")
    print("Final validation accuracy:", history.history['val_accuracy'][-1])

    # Save the trained model
    model.save('plant_disease_model.h5')
    print("Model saved to plant_disease_model.h5")


if __name__ == '__main__':
    train_model()
