from django.urls import re_path, path

from . import consumers

websocket_urlpatterns = [
    re_path(r"game/(?P<room_name>\w+)/$", consumers.GameLobbyConsumer.as_asgi()),
	re_path(r"game/active/(?P<room_name>\w+)/$", consumers.GameConsumer.as_asgi()),
]