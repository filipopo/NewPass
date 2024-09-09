import os
import cv2
import base64
import numpy as np
import tensorflow as tf
from functools import wraps
from utils import L1Dist, cut_frame, preprocess_numpy, verify
from .models import Secret
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

APP_PATH = os.path.join('data', 'app')
siamese_model = os.path.join('data', 'siamesemodelv2.keras')
siamese_model = tf.keras.models.load_model(siamese_model, custom_objects={'L1Dist': L1Dist})

def index(request):
    if request.session.get('verified', False):
        return redirect('/secrets')  # Redirect to secrets page if already verified

    return render(request, 'index.html')

def checkVerification(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        if not request.session.get('verified', False):
            return redirect('/')  # Redirect to main page if not verified
        return func(request, *args, **kwargs)
    return wrapper

@checkVerification
def secrets(request):
    return render(request, 'secrets.html', {'mysecrets': Secret.objects.all()})

@checkVerification
def secret(request, id):
    mysecret = Secret.objects.get(id=id)
    fields = []

    # Loop over all fields but don't include the id which is the first one
    for field in mysecret._meta.fields[1:]:
        val = getattr(mysecret, field.name) 
        if val: fields.append(f'{field.name}: {val}')

    fields = {
        'mysecret': mysecret,
        'fields': fields
    }

    return render(request, 'secret.html', fields)

@csrf_exempt
def process_image(request):
    if request.method == 'POST':
        image = request.body.decode('utf-8')
        image = image.split(',', maxsplit=1)[1] # Remove base64 header
        image = np.frombuffer(base64.b64decode(image), np.uint8)
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)

        # Process the image as needed
        image = preprocess_numpy(cut_frame(image))
        results, verified = verify(image, siamese_model, APP_PATH, 0.7, 0.6)

        if verified:
            request.session['verified'] = True

        # Return the result
        return JsonResponse({'verified': verified})
    return JsonResponse({'error': 'Invalid request'}, status=400)
