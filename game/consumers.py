import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class GameLobbyConsumer(WebsocketConsumer):
	def connect(self):
		self.room_group_name = self.scope["url_route"]["kwargs"]["room_name"]
		if not self.scope['user'].is_authenticated:
			self.close()
		else:
			self.accept()
			async_to_sync(self.channel_layer.group_add)(
				self.room_group_name, self.channel_name)
		

	def disconnect(self, close_code):
		# Leave room group
		async_to_sync(self.channel_layer.group_discard)(
			self.room_group_name, self.channel_name)

	# Receive message from WebSocket
	def receive(self, data):
		data_json = json.loads(data)

		# Send message to room group
		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name, {"type": "gamelobby_message", "message": data_json}
		)

	# Receive message from room group
	def gamelobby_message(self, event):
		data_json = event["message"]

		# Send message to WebSocket
		self.send(text_data=json.dumps({"message": message}))