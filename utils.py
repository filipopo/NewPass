import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Layer

# Siamese L1 Distance class
class L1Dist(Layer):
    # Init method - inheritance
    def __init__(self, **kwargs):
        super().__init__()

    # Magic happens here - similarity calculation
    def call(self, input_embedding, validation_embedding):
        return tf.math.abs(input_embedding - validation_embedding)

# Cut down frame to 250x250px from whatever it was e.g 640x480
def cut_frame(frame):
    height_change, width = frame.shape[:2]
    height_change /= 250
    width = int(width / height_change)

    frame = cv2.resize(frame, (width, 250))
    width //= 2
    frame = frame[:, width - 125: width + 125]

    return frame

def preprocess(img):
    # Resize the image to be 100x100x3
    img = tf.image.resize(img, (100, 100))

    # Scale image to be between 0 and 1 
    img /= 255.0

    # Return image
    return img

def preprocess_file(img):
    # Read in image from file path or object
    img = tf.io.read_file(img)

    # Load in the image
    img = tf.image.decode_jpeg(img, channels=3)

    # Make sure the image data type is float32 and not uint8
    #img = tf.image.convert_image_dtype(img, dtype=tf.float32)

    return preprocess(img)

def preprocess_numpy(img):
    img = tf.convert_to_tensor(img, dtype=tf.float32)
    return preprocess(img)

def verify(input_img, model, app_path, detection_threshold, verification_threshold):
    # Build results array
    results = []
    for image in os.listdir(app_path):
        validation_img = preprocess_file(os.path.join(app_path, image))

        # Make Predictions 
        result = model.predict(list(np.expand_dims([input_img, validation_img], axis=1)))
        results.append(result)

    # Detection Threshold: Metric above which a prediciton is considered positive 
    detection = np.sum(np.array(results) > detection_threshold)

    # Verification Threshold: Proportion of positive predictions / total positive samples 
    verification = detection / len(os.listdir(app_path)) 
    verified = bool(verification > verification_threshold)

    return results, verified
