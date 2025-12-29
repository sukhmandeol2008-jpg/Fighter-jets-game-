import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def create_data_generators(base_dir='../data/raw/color', batch_size=32, img_size=(128, 128)):
    """
    Creates training and validation data generators from the PlantVillage dataset.
    """
    datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2,  # Use 20% of the data for validation
        rotation_range=40,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    train_generator = datagen.flow_from_directory(
        base_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training'  # Set as training data
    )

    validation_generator = datagen.flow_from_directory(
        base_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation'  # Set as validation data
    )

    return train_generator, validation_generator

if __name__ == '__main__':
    train_gen, val_gen = create_data_generators()
    print("Class indices:", train_gen.class_indices)
    print("Number of classes:", len(train_gen.class_indices))
