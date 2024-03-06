import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class GameLobbyConsumer(WebsocketConsumer):
	gameLobbyInfo = []
	def connect(self):
		self.room_group_name = self.scope["url_route"]["kwargs"]["room_name"]
		if not self.scope['user'].is_authenticated:
			self.close()
		else:
			self.accept()
			async_to_sync(self.channel_layer.group_add)(
				self.room_group_name, self.channel_name)
			async_to_sync(self.channel_layer.group_send)(
			self.room_group_name, {"type": "gamelobby_message"}
			)
	
	def disconnect(self, close_code):
		GameLobbyConsumer.gameLobbyInfo = [game for game in GameLobbyConsumer.gameLobbyInfo if game.get('mainClient') != str(self.scope['user'])]
		for game in GameLobbyConsumer.gameLobbyInfo:
			if 'player' in game:
				game['player'] = [player for player in game['player'] if player != str(self.scope["user"])]
		# Leave room group
		
		async_to_sync(self.channel_layer.group_discard)(
			self.room_group_name, self.channel_name)
		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name, {"type": "gamelobby_message"}
		)

	# Receive message from WebSocket
	def receive(self, text_data):
		data_json = json.loads(text_data)
		if data_json["mode"] == 'create':
			found = any(game["mainClient"] == str(self.scope["user"]) for game in GameLobbyConsumer.gameLobbyInfo)
			if not found:
				GameLobbyConsumer.gameLobbyInfo.append({"mainClient":str(self.scope["user"])})
		elif data_json["mode"] == 'leave':
			GameLobbyConsumer.gameLobbyInfo = [
				game for game in GameLobbyConsumer.gameLobbyInfo if game.get('mainClient') != str(self.scope['user'])
			]
			for game in GameLobbyConsumer.gameLobbyInfo:
				if 'player' in game:
					game['player'] = [player for player in game['player'] if player != str(self.scope["user"])]
			print(GameLobbyConsumer.gameLobbyInfo)
		elif data_json["mode"] == 'join':
			for game in GameLobbyConsumer.gameLobbyInfo:
				if game['mainClient'] == data_json['mainClient']:
					if 'player' in game:
						game['player'].append(str(self.scope['user']))
					else:
						game['player'] = []
						game['player'].append(str(self.scope['user']))
		# Send message to room group
		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name, {"type": "gamelobby_message"}
		)

	# Receive message from room group
	def gamelobby_message(self, event):
		# Send message to WebSocket
		self.send(text_data=json.dumps({"gameLobbyInfo": GameLobbyConsumer.gameLobbyInfo}))

class GameConsumer(WebsocketConsumer):
	gameInfo = []
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
			self.room_group_name, {"type": "gamelobby_message"}
		)

	# Receive message from room group
	def gamelobby_message(self, event):
		data_json = event["message"]

		# Send message to WebSocket
		self.send(text_data=json.dumps({"gameLobbyInfo": gameLobbyInfo}))