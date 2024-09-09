# Newpass

Welcome to Newpass, my student research project about facial recognition in software for secrets management

The process of training the model can be seen in the Training.ipynb Jupyter notebook while you can use Verification.ipynb to verify the model using image files or perform a real-time test using opencv and your web camera

The student research paper can be found here: 

## Installation instructions

to get started install the dependencies

`pip install -r requirements.txt`

Then create the admin user

`python manage.py createsuperuser`

Now you're ready to start the server

`python manage.py runserver`

After starting it visit the url e.g

http://127.0.0.1:8000/

## When making changes

When changing the database model run this command to create the migration file

`python manage.py makemigrations webapp`

Then this comand to apply them

`python manage.py migrate`

## Troubleshooting

If you have problems with libraries not updating after changes being made in Jupyter, try this:

```
import importlib
import utils
importlib.reload(utils)
```

This project was tested with tensorflow 2.16.1, if you encounter any errors with newer versions do try to patch them up

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

https://vis-www.cs.umass.edu/lfw

https://github.com/nicknochnack/FaceRecognition

https://pyimagesearch.com/2023/01/09/face-recognition-with-siamese-networks-keras-and-tensorflow
