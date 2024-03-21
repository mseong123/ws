import { global } from './global.js';
import { gameStart, adjustPaddles, resetGame, powerUpCollisionEffect } from './gameplay.js'
import { updateMatchFix , populateWinner, matchFixMulti} from './utilities.js'



function getCookie (name) {
	let value = `; ${document.cookie}`;
	let parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

function getCookie2() {
	return document.querySelector('[name="csrfmiddlewaretoken"]').value;
}

document.addEventListener('DOMContentLoaded', async function () {
	try {
		const response = await fetch(global.fetch.sessionURL, { 
			method:"POST",
			credentials: "include",
			headers: {
				"X-CSRFToken": getCookie("csrftoken")?getCookie("csrftoken"):getCookie2()
			  }
		});
		const data = await response.json();
		if (data.authenticated) {
			global.gameplay.username = data.username;
			global.ui.auth = 1;
			global.ui.toggleCanvas = 0;
			global.ui.login = 0;
			global.ui.mainMenu = 1;
		}
		else
			global.ui.auth = 0;

	  } catch (error) {
			console.log(`Server error: ${error.message}`);
	  }
})

async function fetch_login(data) {
	try {
		const response = await fetch(global.fetch.authURL, { 
			method:"POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCookie("csrftoken")
			  },
			body: JSON.stringify(data),
		});
		return response.json();
	  } catch (error) {
			console.log(`Server error: ${error.message}`);
	  }
}

async function fetch_logout() {
	try {
		const response = await fetch(global.fetch.logoutURL, { 
			method:"POST",
			credentials: "include",
			headers: {
				"X-CSRFToken": getCookie('csrftoken')
			  },
		});
		return response.json();
	  } catch (error) {
			console.log(`Server error: ${error.message}`);
	  }
}

async function createGameLobbyWebSocket() {
	global.socket.gameLobbySocket = new WebSocket(
		'ws://'
		+ window.location.host
		+ '/game/lobby/'
	);

	global.socket.gameLobbySocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		global.socket.gameLobbyInfo = data.gameLobbyInfo;
	};

	global.socket.gameLobbySocket.onclose = function(e) {
		global.socket.gameLobbySocket = null;
		if (e.code !== 1000) {
			global.socket.gameLobbyError = 1;
		}
	};
	global.socket.gameLobbySocket.onerror = function(e) {
		if (e.code !== 1000)
			global.socket.gameLobbyError = 1;
	};
}

function multiGameStart() {
	global.gameplay.local = 0;
	global.powerUp.enable = global.socket.gameInfo.powerUp;
	document.querySelector(".game-summary-header-type").textContent = "Multiplayer " + global.socket.gameInfo.gameMode.toUpperCase();

	if (global.socket.gameInfo.gameMode === "tournament") {
		global.socket.matchFix = 0;
		document.querySelector(".multi-tournament-matchFix-display").innerHTML = '';
	}
	gameStart();
}

function sendMultiPlayerData() {
	if (global.socket.gameInfo.mainClient && global.gameplay.gameStart && !global.gameplay.gameEnd && global.socket.gameSocket && !global.socket.spectate) {
		if (global.socket.gameInfo.mainClient === global.gameplay.username) {
			if (global.socket.gameInfo.gameMode === "versus") {
				let paddleIndex = global.socket.gameInfo.playerGame[0].player.indexOf(global.gameplay.username);
				if (paddleIndex === -1)
					paddleIndex = global.socket.gameInfo.playerGame[1].player.indexOf(global.gameplay.username) + global.socket.gameInfo.playerGame[0].player.length;
				let liveGameData =
				{
					sphereMeshProperty:JSON.parse(JSON.stringify(global.sphere.sphereMeshProperty)),
					paddlesProperty:{...global.paddle.paddlesProperty[paddleIndex]},
					ludicrious:global.gameplay.ludicrious,
					roundStart:global.gameplay.roundStart,
					initRotateY:global.gameplay.initRotateY,
					initRotateX:global.gameplay.initRotateX,
					shake:global.powerUp.shake.enable,
					backgroundIndex:global.gameplay.backgroundIndex,
					meshProperty:JSON.parse(JSON.stringify(global.powerUp.meshProperty)),
				}
				processSendLiveGameData(liveGameData)
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.send(JSON.stringify({
						mode:"mainClient",
						gameInfo:global.socket.gameInfo,
						liveGameData:liveGameData,
					}))
			}
			else {
				let tournamentPaddleIndex;
				if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === global.gameplay.username)
					tournamentPaddleIndex = 0;
				else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === global.gameplay.username)
					tournamentPaddleIndex = 1;
				else
					tournamentPaddleIndex = -1;
				let liveGameData =
				{
					sphereMeshProperty:JSON.parse(JSON.stringify(global.sphere.sphereMeshProperty)),
					paddlesProperty:tournamentPaddleIndex !== -1? {...global.paddle.paddlesProperty[tournamentPaddleIndex]}: {},
					ludicrious:global.gameplay.ludicrious,
					roundStart:global.gameplay.roundStart,
					initRotateY:global.gameplay.initRotateY,
					initRotateX:global.gameplay.initRotateX,
					shake:global.powerUp.shake.enable,
					backgroundIndex:global.gameplay.backgroundIndex,
					meshProperty:JSON.parse(JSON.stringify(global.powerUp.meshProperty)),
				}
				processSendLiveGameData(liveGameData)
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.send(JSON.stringify({
						mode:"mainClient",
						gameInfo:global.socket.gameInfo,
						liveGameData:liveGameData,
					}))
				
			}
		}
		else {
			const clientWidth = global.clientWidth; 
			let paddlesProperty = {}
			if (global.socket.gameInfo.gameMode === "versus") {
				let paddleIndex = global.socket.gameInfo.playerGame[0].player.indexOf(global.gameplay.username);
				if (paddleIndex === -1)
					paddleIndex = global.socket.gameInfo.playerGame[1].player.indexOf(global.gameplay.username) + global.socket.gameInfo.playerGame[0].player.length;
				paddlesProperty = {...global.paddle.paddlesProperty[paddleIndex]}
				paddlesProperty.positionX = paddlesProperty.positionX / clientWidth;
				paddlesProperty.positionY = paddlesProperty.positionY / clientWidth;
				paddlesProperty.positionZ = paddlesProperty.positionZ / clientWidth;
				paddlesProperty.width = paddlesProperty.width / clientWidth;
				paddlesProperty.height = paddlesProperty.height / clientWidth;
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.send(JSON.stringify({
						mode:"player",
						playerName:global.gameplay.username,
						liveGameData:paddlesProperty
					}))
			}
			else {
				let tournamentPaddleIndex;
				if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === global.gameplay.username)
					tournamentPaddleIndex = 0;
				else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === global.gameplay.username)
					tournamentPaddleIndex = 1;
				else
					tournamentPaddleIndex = -1;
				if (tournamentPaddleIndex !== -1) {
					paddlesProperty = {...global.paddle.paddlesProperty[tournamentPaddleIndex]}
					paddlesProperty.positionX = paddlesProperty.positionX / clientWidth;
					paddlesProperty.positionY = paddlesProperty.positionY / clientWidth;
					paddlesProperty.positionZ = paddlesProperty.positionZ / clientWidth;
					paddlesProperty.width = paddlesProperty.width / clientWidth;
					paddlesProperty.height = paddlesProperty.height / clientWidth;
				}
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.send(JSON.stringify({
						mode:"player",
						playerName:global.gameplay.username,
						liveGameData:paddlesProperty,
					}))
			}
		}
	}
}

export function processSendLiveGameData(liveGameData) {
	const clientWidth = global.clientWidth; 
	liveGameData.sphereMeshProperty.forEach(sphereMeshProperty=>{
		sphereMeshProperty.positionX = sphereMeshProperty.positionX / clientWidth;
		sphereMeshProperty.positionY = sphereMeshProperty.positionY / clientWidth;
		sphereMeshProperty.positionZ = sphereMeshProperty.positionZ / clientWidth;
		sphereMeshProperty.velocityX = sphereMeshProperty.velocityX / clientWidth;
		sphereMeshProperty.velocityY = sphereMeshProperty.velocityY / clientWidth;
		sphereMeshProperty.velocityZ = sphereMeshProperty.velocityZ / clientWidth;
	})
	if (Object.keys(liveGameData.paddlesProperty).length) {
		liveGameData.paddlesProperty.positionX = liveGameData.paddlesProperty.positionX / clientWidth;
		liveGameData.paddlesProperty.positionY = liveGameData.paddlesProperty.positionY / clientWidth;
		liveGameData.paddlesProperty.positionZ = liveGameData.paddlesProperty.positionZ / clientWidth;
		liveGameData.paddlesProperty.width = liveGameData.paddlesProperty.width / clientWidth;
		liveGameData.paddlesProperty.height = liveGameData.paddlesProperty.height / clientWidth;
	}
	liveGameData.meshProperty.forEach(meshProperty=>{
		meshProperty.positionX = meshProperty.positionX / clientWidth;
		meshProperty.positionY = meshProperty.positionY / clientWidth;
		meshProperty.positionZ = meshProperty.positionZ / clientWidth;
	})
}

function processReceiveLiveGameData(liveGameData) {
	const clientWidth = global.clientWidth; 
	liveGameData.sphereMeshProperty.forEach(sphereMeshProperty=>{
		sphereMeshProperty.positionX = sphereMeshProperty.positionX * clientWidth;
		sphereMeshProperty.positionY = sphereMeshProperty.positionY * clientWidth;
		sphereMeshProperty.positionZ = sphereMeshProperty.positionZ * clientWidth;
		sphereMeshProperty.velocityX = sphereMeshProperty.velocityX * clientWidth;
		sphereMeshProperty.velocityY = sphereMeshProperty.velocityY * clientWidth;
		sphereMeshProperty.velocityZ = sphereMeshProperty.velocityZ * clientWidth;
	})
	if (Object.keys(liveGameData.paddlesProperty).length) {
		liveGameData.paddlesProperty.positionX = liveGameData.paddlesProperty.positionX * clientWidth;
		liveGameData.paddlesProperty.positionY = liveGameData.paddlesProperty.positionY * clientWidth;
		liveGameData.paddlesProperty.positionZ = liveGameData.paddlesProperty.positionZ * clientWidth;
		liveGameData.paddlesProperty.width = liveGameData.paddlesProperty.width * clientWidth;
		liveGameData.paddlesProperty.height = liveGameData.paddlesProperty.height * clientWidth;
	}
	liveGameData.meshProperty.forEach(meshProperty=>{
		meshProperty.positionX = meshProperty.positionX * clientWidth;
		meshProperty.positionY = meshProperty.positionY * clientWidth;
		meshProperty.positionZ = meshProperty.positionZ * clientWidth;
	})

}

export function createGameSocket(mainClient) {
	global.socket.gameSocket = new WebSocket(
		'ws://'
		+ window.location.host
		+ '/game/active/' + mainClient + '/'
	);

	global.socket.gameSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.mode === "gameOption" && global.gameplay.gameEnd !== 1) {
			global.socket.gameInfo = data.gameInfo;
			if (global.socket.gameInfo.gameMode === "versus") {
				document.getElementById("multi-teamname-one").value = global.socket.gameInfo.playerGame[0].teamName;
				document.getElementById("multi-teamname-two").value = global.socket.gameInfo.playerGame[1].teamName;
			}
		}
		else if (data.mode === "gameStart") {
			multiGameStart();
		}
		else if (data.mode === "gameEnd" && global.socket.gameInfo.mainClient !== global.gameplay.username) {
			global.gameplay.gameEnd = 1;
			global.socket.gameInfo = data.gameInfo;
			populateWinner();
			if (global.socket.gameInfo.gameMode === "versus" || global.socket.gameInfo.gameMode === "tournament" && global.socket.gameInfo.currentRound === global.socket.gameInfo.round - 1) {
				if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
					global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.close();
			}
		}
		else if (data.mode === "matchFix") {
			global.socket.matchFix = 1;
			global.ui.multiCreate = 0;
			global.ui.toggleCanvas = 0;
			global.socket.gameInfo = data.gameInfo;
			updateMatchFix();
		}
		else if (data.mode === "enableLargePaddle") {
			if (global.sphere.sphereMeshProperty[0].velocityZ <= 0) {
				const paddlesProperty = global.paddle.paddlesProperty;
				if (global.socket.gameInfo.gameMode === "tournament") {
					paddlesProperty[0].largePaddle = 1;
					paddlesProperty[0].width *= global.powerUp.largePaddle.multiplier;
					paddlesProperty[0].height *= global.powerUp.largePaddle.multiplier;
					adjustPaddles(paddlesProperty[0])
				}
				else if (global.socket.gameInfo.gameMode === "versus") {
					for (let i = 1; i <= global.socket.gameInfo.playerGame[0].player.length; i++) {
						paddlesProperty[i - 1].largePaddle = 1;
						paddlesProperty[i - 1].width *= global.powerUp.largePaddle.multiplier;
						paddlesProperty[i - 1].height *= global.powerUp.largePaddle.multiplier;
						adjustPaddles(paddlesProperty[i - 1]);
					}
				}
			}
			else {
				const paddlesProperty = global.paddle.paddlesProperty;
				if (global.socket.gameInfo.gameMode === "tournament") {
					global.paddle.paddlesProperty[1].largePaddle = 1;
					global.paddle.paddlesProperty[1].width *= global.powerUp.largePaddle.multiplier;
					global.paddle.paddlesProperty[1].height *= global.powerUp.largePaddle.multiplier;
					adjustPaddles(global.paddle.paddlesProperty[1])
				}
				else if (global.socket.gameInfo.gameMode === "versus") {
					for (let i = global.socket.gameInfo.playerGame[0].player.length + 1; i <= global.socket.gameInfo.playerGame[1].player.length + global.socket.gameInfo.playerGame[0].player.length; i++) {
						paddlesProperty[i - 1].largePaddle = 1;
						paddlesProperty[i - 1].width *= global.powerUp.largePaddle.multiplier;
						paddlesProperty[i - 1].height *= global.powerUp.largePaddle.multiplier;
						adjustPaddles(paddlesProperty[i - 1]);
					}
				}
			}
			
		}
		else if (data.mode === "enableInvisibility") {
			if (global.sphere.sphereMeshProperty[0].velocityZ <= 0) {
				const paddlesProperty = global.paddle.paddlesProperty;
				if (global.socket.gameInfo.gameMode === "tournament")
					paddlesProperty[0].invisibility = 1;
				else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
					for (let i = 1; i <= global.socket.gameInfo.playerGame[0].player.length; i++) 
						paddlesProperty[i - 1].invisibility = 1;
				}
			}
			else {
				const paddlesProperty = global.paddle.paddlesProperty;
				if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament")
					paddlesProperty[1].invisibility = 1;
				else if (global.socket.gameInfo.gameMode === "versus") {
					for (let i = global.socket.gameInfo.playerGame[0].player.length + 1; i <= global.socket.gameInfo.playerGame[1].player.length + global.socket.gameInfo.playerGame[0].player.length; i++)
						paddlesProperty[i - 1].invisibility = 1;
				}
			}
		}
		else if (data.mode === "resetPaddle") {
			global.paddle.paddlesProperty.forEach(paddleProperty=>{
				//large paddles reset
				paddleProperty.largePaddle = 0;
				paddleProperty.width = global.paddle.defaultWidth;
				paddleProperty.height = global.paddle.defaultHeight;
				//paddles invisibility reset
				paddleProperty.invisibility = 0;
			});
		}
		else if (data.mode === "cheat" && global.socket.gameInfo.mainClient === global.gameplay.username) {
			if (global.socket.gameInfo.gameMode === "versus") {
				let index;
				if (global.socket.gameInfo.playerGame[0].player.indexOf(data.player) !== -1)
					index = 0;
				else
					index = 1;
				if (global.socket.gameInfo.playerGame[index].cheatCount > 0 && global.powerUp.meshProperty.some(meshProperty=>meshProperty.visible)) {
					global.socket.gameInfo.playerGame[index].cheatCount--; 
					powerUpCollisionEffect(global.sphere.sphereMeshProperty[0])
				}
			}
			else if (global.socket.gameInfo.gameMode === "tournament") {
				let tournamentPlayerIndex;
				if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === data.player)
					tournamentPlayerIndex = 0;
				else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === data.player)
					tournamentPlayerIndex = 1;
				else
					tournamentPlayerIndex = -1;
				if (tournamentPlayerIndex !== -1 && global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][tournamentPlayerIndex].cheatCount > 0 && global.powerUp.meshProperty.some(meshProperty=>meshProperty.visible)) {
					global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][tournamentPlayerIndex].cheatCount--; 
					powerUpCollisionEffect(global.sphere.sphereMeshProperty[0])
				}
			}
			
		}
		else if (data.mode === "pause") {
			global.gameplay.pause = data.pause;
		}
		else if (data.mode === "mainClient" && global.socket.gameInfo.mainClient !== global.gameplay.username) {
			global.socket.gameInfo = data.gameInfo;
			let liveGameData = data.liveGameData;
			processReceiveLiveGameData(liveGameData);
			if (global.socket.gameInfo.gameMode === "versus") {
				let paddleIndex = global.socket.gameInfo.playerGame[0].player.indexOf(global.socket.gameInfo.mainClient);
				if (paddleIndex === -1)
					paddleIndex = global.socket.gameInfo.playerGame[1].player.indexOf(global.socket.gameInfo.mainClient) + global.socket.gameInfo.playerGame[0].player.length;
				global.paddle.paddlesProperty[paddleIndex] = data.liveGameData.paddlesProperty;
			}
			else {
				let tournamentPaddleIndex;;
				if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === global.socket.gameInfo.mainClient)
					tournamentPaddleIndex = 0;
				else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === global.socket.gameInfo.mainClient)
					tournamentPaddleIndex = 1;
				else
					tournamentPaddleIndex = -1;
				if (tournamentPaddleIndex !== -1)
					global.paddle.paddlesProperty[tournamentPaddleIndex] = data.liveGameData.paddlesProperty;
			}
			global.sphere.sphereMeshProperty = data.liveGameData.sphereMeshProperty;
			global.gameplay.ludicrious = data.liveGameData.ludicrious;
			global.gameplay.roundStart = data.liveGameData.roundStart;
			global.gameplay.initRotateY = data.liveGameData.initRotateY;
			global.gameplay.initRotateX = data.liveGameData.initRotateX;
			global.gameplay.backgroundIndex = data.liveGameData.backgroundIndex;
			global.powerUp.meshProperty = data.liveGameData.meshProperty;
			global.powerUp.shake.enable = data.liveGameData.shake;
		}
		else if (data.mode === "player" && data.playerName !== global.gameplay.username) {
			const clientWidth = global.clientWidth; 
			let paddlesProperty = data.liveGameData;
			if (Object.keys(paddlesProperty).length) {
				paddlesProperty.positionX = paddlesProperty.positionX * clientWidth;
				paddlesProperty.positionY = paddlesProperty.positionY * clientWidth;
				paddlesProperty.positionZ = paddlesProperty.positionZ * clientWidth;
				paddlesProperty.width = paddlesProperty.width * clientWidth;
				paddlesProperty.height = paddlesProperty.height * clientWidth;
			}
			
			if (global.socket.gameInfo.gameMode === "versus") {
				let paddleIndex; 
				paddleIndex = global.socket.gameInfo.playerGame[0].player.indexOf(data.playerName);
				if (paddleIndex === -1)
					paddleIndex = global.socket.gameInfo.playerGame[1].player.indexOf(data.playerName) + global.socket.gameInfo.playerGame[0].player.length;
				global.paddle.paddlesProperty[paddleIndex] = paddlesProperty
			}
			else {
				let tournamentPaddleIndex;
				if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === data.playerName)
					tournamentPaddleIndex = 0;
				else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === data.playerName)
					tournamentPaddleIndex = 1;
				else
					tournamentPaddleIndex = -1;
				if (tournamentPaddleIndex !== -1) {
					global.paddle.paddlesProperty[tournamentPaddleIndex] = paddlesProperty
				}
			}
			
		}
			
	};

	global.socket.gameSocket.onclose = function(e) {
		global.socket.gameSocket = null;
		if (e.code !== 1000) 
			global.socket.gameError = 1;
	};
	global.socket.gameSocket.onerror = function(e) {
		if (e.code !== 1000)
			global.socket.gameError = 1;
	};
}

function keyBindingMultiplayer() {
	const multi = document.querySelector(".nav-multi");
	multi.addEventListener("click", (e)=>{
		if (global.gameplay.username) {
			global.ui.mainMenu = 0;
			global.ui.multiLobby = 1;
			createGameLobbyWebSocket();
		}
	})
	const multiLobbyBack = document.querySelector(".multi-lobby-back");
	multiLobbyBack.addEventListener("click", (e)=>{
		global.ui.mainMenu = 1;
		global.ui.multiLobby = 0;
		global.socket.gameLobbyError = 0;
		if (global.socket.gameLobbySocket)
			global.socket.gameLobbySocket.close();
	})
	const multiCreateLeave = document.querySelector(".multi-leave-game");
	multiCreateLeave.addEventListener("click", (e)=>{
		if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
			global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
			global.socket.gameSocket.close();
		global.socket.gameInfo = {
			mainClient:"",
			gameMode:"",
			player:{},
			playerGame:[],
			currentRound:0,
			round:0,
			ludicrious:global.gameplay.defaultLudicrious,
			powerUp:global.gameplay.defaultPowerUp,
			duration:global.gameplay.defaultDuration,
			durationCount:global.gameplay.defaultDuration,
		};
		if (global.socket.gameError) {
			global.ui.mainMenu = 1;
		}
		else 
			global.ui.multiLobby = 1;
		global.socket.gameError = 0;
		global.ui.multiCreate = 0;
		global.socket.ready = 0;
		document.querySelector('.multi-create-display-player-versus-one').innerHTML = ''
		document.querySelector('.multi-create-display-player-versus-two').innerHTML = ''
		document.querySelector('.multi-create-display-player-tournament').innerHTML = ''
	})
	const multiCreateReady = document.querySelector(".multi-ready-game");
	multiCreateReady.addEventListener("click", (e) => {
		global.socket.ready? global.socket.ready = 0:global.socket.ready =1;
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
			global.socket.gameSocket.send(JSON.stringify({mode:"updateReady", ready:global.socket.ready}))
	})
	const login = document.querySelector(".nav-login");
	login.addEventListener("click", (e)=>{
		global.ui.mainMenu = 0;
		global.ui.login = 1;
	})
	const logout = document.querySelector(".nav-logout");
	logout.addEventListener("click", (e)=>{
		fetch_logout().then(data=>{
			global.ui.auth = 0;
			global.gameplay.username = "";
		})
	})
	const loginBack = document.querySelector(".login-back");
	loginBack.addEventListener("click", (e)=>{
		global.ui.mainMenu = 1;
		global.ui.login = 0;
	})
	const loginSubmit = document.querySelector(".login");
	loginSubmit.addEventListener("submit", (e)=>{
		global.ui.authWarning = 0;
		e.preventDefault();
		fetch_login({username:document.getElementById("username").value, password:document.getElementById("password").value}).then(data=>{
			if (data.authenticated) {
				global.gameplay.username = data.username;
				global.ui.auth = 1;
				global.ui.toggleCanvas = 0;
				global.ui.login = 0;
				global.ui.mainMenu = 1;
				global.ui.toggleCanvas = 1;
			}
			else {
				global.gameplay.username = "";
				global.ui.auth = 0;
				global.ui.authWarning = 1;
			}
		});
	})
	const multiCreateVersus = document.querySelector(".multi-create-versus");
	multiCreateVersus.addEventListener("click", (e)=>{
		if (global.socket.gameLobbyInfo.every(gameLobbyInfo=>{
			return gameLobbyInfo.mainClient !== global.gameplay.username
		})) {
			if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
				global.socket.gameLobbySocket.send(JSON.stringify({mode:"create", gameMode:"versus"}));
			createGameSocket(global.gameplay.username)
			global.socket.gameSocket.onopen = function() {
				global.ui.multiCreate = 1;
				global.ui.multiLobby = 0;
				global.socket.gameInfo.mainClient = global.gameplay.username;
				global.socket.gameInfo.gameMode = "versus";
				global.socket.gameInfo.playerGame = [{teamName:"TeamOne", score:0, player:[], winner:false, cheatCount:global.gameplay.defaultCheatCount},{teamName:"TeamTwo", score:0, player:[], winner:false, cheatCount:global.gameplay.defaultCheatCount}];
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.send(JSON.stringify({
						mode:"create",
						gameInfo:global.socket.gameInfo
					}))
			}
		}
	})

	const multiTeamNameSubmitOne = document.querySelector(".multi-teamname-submit-one");
	multiTeamNameSubmitOne.addEventListener("submit", (e)=>{
		e.preventDefault();
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
			global.socket.gameSocket.send(JSON.stringify({
				mode:"updateTeamName",
				playerGame:global.socket.gameInfo.playerGame
			}))
	})
	const multiTeamNameOne = document.getElementById("multi-teamname-one");
	multiTeamNameOne.addEventListener("input", (e)=>{
		global.socket.gameInfo.playerGame[0].teamName = e.target.value;
		document.querySelector(".multi-teamname-button-one").click()
	})
	const multiTeamNameSubmitTwo = document.querySelector(".multi-teamname-submit-two");
	multiTeamNameSubmitTwo.addEventListener("submit", (e)=>{
		e.preventDefault();
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
			global.socket.gameSocket.send(JSON.stringify({
				mode:"updateTeamName",
				playerGame:global.socket.gameInfo.playerGame
			}))
	})
	const multiTeamNameTwo = document.getElementById("multi-teamname-two");
	multiTeamNameTwo.addEventListener("input", (e)=>{
		global.socket.gameInfo.playerGame[1].teamName = e.target.value;
		document.querySelector(".multi-teamname-button-two").click();
		
		
	})
	const multiCreateTournament = document.querySelector(".multi-create-tournament");
	multiCreateTournament.addEventListener("click", (e)=>{
		if (global.socket.gameLobbyInfo.every(gameLobbyInfo=>{
			return gameLobbyInfo.mainClient !== global.gameplay.username
		})) {
			if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
				global.socket.gameLobbySocket.send(JSON.stringify({mode:"create", gameMode:"tournament"}));
			createGameSocket(global.gameplay.username)
			global.socket.gameSocket.onopen = function() {
				global.ui.multiCreate = 1;
				global.ui.multiLobby = 0;
				global.socket.gameInfo.mainClient = global.gameplay.username;
				global.socket.gameInfo.gameMode = "tournament";
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.send(JSON.stringify({
						mode:"create",
						gameInfo:global.socket.gameInfo
					}))
			}
		}
	})
	const multiCreateDuration = document.getElementById("multi-create-duration");
	multiCreateDuration.addEventListener("change", (e) => {
		if (global.socket.gameInfo.mainClient && global.socket.gameInfo.mainClient === global.gameplay.username) {
			global.socket.gameInfo.duration = e.target.value;
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"updateDuration", duration:global.socket.gameInfo.duration}))
		}
	})
	const multiCreatePowerUp = document.getElementById("multi-create-powerUp");
	multiCreatePowerUp.addEventListener("change", (e) => {
		if (global.socket.gameInfo.mainClient && global.socket.gameInfo.mainClient === global.gameplay.username) {
			global.socket.gameInfo.powerUp? global.socket.gameInfo.powerUp = 0:global.socket.gameInfo.powerUp = 1;
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"updatePowerUp", powerUp:global.socket.gameInfo.powerUp}))
		}
	})
	const multiCreateLudicrious = document.getElementById("multi-create-ludicrious");
	multiCreateLudicrious.addEventListener("change", (e) => {
		if (global.socket.gameInfo.mainClient && global.socket.gameInfo.mainClient === global.gameplay.username) {
			global.socket.gameInfo.ludicrious? global.socket.gameInfo.ludicrious = 0:global.socket.gameInfo.ludicrious = 1;
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"updateLudicrious", ludicrious:global.socket.gameInfo.ludicrious}))
		}
	})
	const multiCreateChange = document.querySelector(".multi-create-change");
	multiCreateChange.addEventListener("click", (e) => {
		
		let index = global.socket.gameInfo.playerGame[0].player.indexOf(global.gameplay.username);
		if (index !== -1) {
			global.socket.gameInfo.playerGame[0].player = [...global.socket.gameInfo.playerGame[0].player.slice(0, index), ...global.socket.gameInfo.playerGame[0].player.slice(index+1)];
			global.socket.gameInfo.playerGame[1].player.push(global.gameplay.username)
			
		}
		else {
			index = global.socket.gameInfo.playerGame[1].player.indexOf(global.gameplay.username);
			if (index !== -1) {
				global.socket.gameInfo.playerGame[1].player = [...global.socket.gameInfo.playerGame[1].player.slice(0, index), ...global.socket.gameInfo.playerGame[1].player.slice(index+1)];
				global.socket.gameInfo.playerGame[0].player.push(global.gameplay.username)
			}
		}
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
			global.socket.gameSocket.send(JSON.stringify({mode:"updatePlayer", playerGame:global.socket.gameInfo.playerGame}))
	})
	const multiStartGame = document.querySelector(".multi-start-game");
	multiStartGame.addEventListener("click", (e) => {
		const playerArray = Object.keys(global.socket.gameInfo.player)
		if (playerArray.every(player=>{
			return global.socket.gameInfo.player[player].ready === 1
		}) && global.socket.gameInfo.playerGame[0].player.length>0 && global.socket.gameInfo.playerGame[1].player.length>0) {
			if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
				global.socket.gameLobbySocket.send(JSON.stringify({mode:"gameStart", mainClient:global.socket.gameInfo.mainClient}))
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"gameStart"}))
		}
		
	})
	const multiMatchFix = document.querySelector(".multi-matchFix");
	multiMatchFix.addEventListener("click", (e) => {
		const playerArray = Object.keys(global.socket.gameInfo.player)
		if (global.socket.gameInfo.gameMode === "tournament" && Object.keys(global.socket.gameInfo.player).length > 1 && playerArray.every(player=>{
			return global.socket.gameInfo.player[player].ready === 1
		})) {
			matchFixMulti();
			if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
				global.socket.gameLobbySocket.send(JSON.stringify({mode:"gameStart", mainClient:global.socket.gameInfo.mainClient}))
			playerArray.forEach(player=>{
				global.socket.gameInfo.player[player].ready = 0;
			});
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({
					mode:"matchFix", 
					gameInfo:global.socket.gameInfo
				}))
		}
	})
	const multiMatchFixReady = document.querySelector(".multi-tournament-matchFix-ready-button");
	multiMatchFixReady.addEventListener("click", (e) => {
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN) {
			if (global.socket.gameInfo.player[global.gameplay.username].ready)
				global.socket.gameSocket.send(JSON.stringify({mode:"updateReady", ready:0}))
			else 
				global.socket.gameSocket.send(JSON.stringify({mode:"updateReady", ready:1}))
		}
	})

	const multiMatchFixStart = document.querySelector(".multi-tournament-matchFix-start-button");
	multiMatchFixStart.addEventListener("click", (e) => {
		const playerArray = Object.keys(global.socket.gameInfo.player)
		if (playerArray.every(player=>{
			return global.socket.gameInfo.player[player].ready === 1
		})) {
			if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
				global.socket.gameLobbySocket.send(JSON.stringify({mode:"gameStart", mainClient:global.socket.gameInfo.mainClient}))
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"gameStart"}))
		}
		
	})
	const multiHostLeftLeave = document.querySelector(".multi-host-left-leave-button");
	multiHostLeftLeave.addEventListener("click", (e)=>{
		global.socket.ready = 0;
		global.socket.gameInfo = {
			mainClient:"",
			gameMode:"",
			player:{},
			playerGame:[],
			currentRound:0,
			round:0,
			ludicrious:global.gameplay.defaultLudicrious,
			powerUp:global.gameplay.defaultPowerUp,
			duration:global.gameplay.defaultDuration,
			durationCount:global.gameplay.defaultDuration,
		};
		resetGame();
	})
	const multiGameErrorLeave = document.querySelector(".multi-game-error-leave-button");
	multiGameErrorLeave.addEventListener("click", (e)=>{
		global.socket.ready = 0;
		global.socket.gameError = 0;
		global.socket.gameLobbyError = 0;
		global.socket.gameInfo = {
			mainClient:"",
			gameMode:"",
			player:{},
			playerGame:[],
			currentRound:0,
			round:0,
			ludicrious:global.gameplay.defaultLudicrious,
			powerUp:global.gameplay.defaultPowerUp,
			duration:global.gameplay.defaultDuration,
			durationCount:global.gameplay.defaultDuration,
		};
		resetGame();
	})
}

export { multiGameStart, sendMultiPlayerData, keyBindingMultiplayer}
