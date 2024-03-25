import json
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth import authenticate,login, logout

# Create your views here.
def index(request):
	return render(request, "game/index.html")

def auth(request):
	if request.method == 'POST':
		try:
			json_data = json.loads(request.body.decode('utf-8'))
		except ValueError as e:
			return HttpResponseBadRequest(f'Invalid JSON data: {e}')
		user = authenticate(username=json_data['username'], password=json_data['password'])
		if user is not None:
			login(request, user)
			return JsonResponse({
					'authenticated':True,
					"username":str(request.user)
					})
		else:
			return JsonResponse({'authenticated':False})

def session(request):
	if request.method == 'POST':
		if request.user is not None and request.user.is_authenticated:
			return JsonResponse({
					'authenticated':True,
					"username":str(request.user)
					})
		else:
			return JsonResponse({'authenticated':False})

def user_logout(request):
	logout(request)
	return JsonResponse({'authenticated':False})
