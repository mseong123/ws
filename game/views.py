from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth import authenticate

# Create your views here.
def index(request):
	return render(request, "game/ft_transcendence.html")

def auth(request):
	if request.method == 'POST':
		try:
			data = request.json()
		except ValueError as e:
			return HttpResponseBadRequest(f'Invalid JSON data: {e}')
	print(data)
