# Newpass

Tensorflow 2.16.1

pip install -r requirements.txt

python manage.py createsuperuser

python manage.py runserver

python manage.py makemigrations webapp

python manage.py migrate

import importlib
import utils
importlib.reload(utils)

## Potential improvements

### Application

Add password rotation reminders

Allow grouping secrets into categories

Allow multiple inputs to be added to fields (e.g url) and custom fields

### Model

Switch from classification to similarity-based comparison so the model doesn't have to be re-trained for each person

Add face cropping in the utils/preprocess function to better generalise faces

Implement early stopping to automatically prevent overtraining by stopping the training process when the model's performance on the validation set stops improving. Use tf.keras.callbacks.EarlyStopping. Set monitor='loss', patience (the number of epochs to wait for improvement), and restore_best_weights=True

Align all resolutions to paper e.g produce 105x105 images from utils/preprocess function

Improve checkpoints to use tf.keras.callbacks.ModelCheckpoint. Set filepath, save_best_only=True, and monitor='loss'

## Thanks to

https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf

https://github.com/nicknochnack/FaceRecognition

https://pyimagesearch.com/2023/01/09/face-recognition-with-siamese-networks-keras-and-tensorflow
