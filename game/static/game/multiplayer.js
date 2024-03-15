import {gameStart, matchFixMulti, adjustPaddles, resetGame} from './gameplay.js'
import {updateMatchFix, populateWinner} from './render.js'


function getCookie (name) {
	let value = `; ${document.cookie}`;
	let parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

function getCookie2 () {
	return document.querySelector('[name="csrfmiddlewaretoken"]').value;
}

document.addEventListener('DOMContentLoaded', async function () {
	try {
		const response = await fetch(document.global.fetch.sessionURL, { 
			method:"POST",
			credentials: "include",
			headers: {
				"X-CSRFToken": getCookie("csrftoken")?getCookie("csrftoken"):getCookie2()
			  }
		});
		const data = await response.json();
		if (data.authenticated) {
			document.global.gameplay.username = data.username;
			document.global.ui.auth = 1;
			document.global.ui.toggleCanvas = 0;
			document.global.ui.login = 0;
			document.global.ui.mainMenu = 1;
		}
		else
			document.global.ui.auth = 0;

	  } catch (error) {
		console.error(`Server error: ${error.message}`);
	  }
})

async function fetch_login(data) {
	try {
		const response = await fetch(document.global.fetch.authURL, { 
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
		console.error(`Server error: ${error.message}`);
	  }
}

async function fetch_logout() {
	try {
		const response = await fetch(document.global.fetch.logoutURL, { 
			method:"POST",
			credentials: "include",
			headers: {
				"X-CSRFToken": getCookie('csrftoken')
			  },
		});
		return response.json();
	  } catch (error) {
		console.error(`Server error: ${error.message}`);
	  }
}

function createGameLobbyWebSocket() {
	document.global.socket.gameLobbySocket = new WebSocket(
		'ws://'
		+ window.location.host
		+ '/game/lobby/'
	);

	document.global.socket.gameLobbySocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		document.global.socket.gameLobbyInfo = data.gameLobbyInfo;
	};

	document.global.socket.gameLobbySocket.onclose = function(e) {
		document.global.socket.gameLobbySocket = null;
		console.log('Game socket closed');
	};
	document.global.socket.gameLobbySocket.onerror = function(event) {
		console.log('WebSocket Game Lobby Error:', event);
	};
}

export function multiGameStart() {
	document.global.gameplay.local = 0;
	document.global.powerUp.enable = document.global.socket.gameInfo.powerUp;
	document.querySelector(".game-summary-header-type").textContent = "Multiplayer " + document.global.socket.gameInfo.gameMode.toUpperCase();
	if (document.global.socket.gameInfo.gameMode === "tournament") {
		document.global.socket.matchFix = 0;
		document.querySelector(".multi-tournament-matchFix-display").innerHTML = '';
	}
	gameStart();
}

export function processSendLiveGameData(liveGameData) {
	const clientWidth = document.global.clientWidth; 
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
	const clientWidth = document.global.clientWidth; 
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
	document.global.socket.gameSocket = new WebSocket(
		'ws://'
		+ window.location.host
		+ '/game/active/' + mainClient + '/'
	);

	document.global.socket.gameSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.mode === "gameOption" && document.global.gameplay.gameEnd !== 1)
			document.global.socket.gameInfo = data.gameInfo;
		else if (data.mode === "gameStart") {
			multiGameStart();
		}
		else if (data.mode === "gameEnd" && document.global.socket.gameInfo.mainClient !== document.global.gameplay.username) {
			document.global.gameplay.gameEnd = 1;
			document.global.socket.gameInfo = data.gameInfo;
			populateWinner();
			if (document.global.socket.gameInfo.gameMode === "versus" || document.global.socket.gameInfo.gameMode === "tournament" && document.global.socket.gameInfo.currentRound === document.global.socket.gameInfo.round - 1) {
				if (document.global.socket.gameLobbySocket && document.global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
					document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
				if (document.global.socket.gameSocket && document.global.socket.gameSocket.readyState === WebSocket.OPEN)
					document.global.socket.gameSocket.close();
			}
		}
		else if (data.mode === "matchFix") {
			document.global.socket.matchFix = 1;
			document.global.ui.multiCreate = 0;
			document.global.ui.toggleCanvas = 0;
			document.global.socket.gameInfo = data.gameInfo;
			updateMatchFix();
		}
		else if (data.mode === "enableLargePaddle") {
			if (document.global.sphere.sphereMeshProperty[0].velocityZ <= 0) {
				const paddlesProperty = document.global.paddle.paddlesProperty;
				if (document.global.socket.gameInfo.gameMode === "tournament") {
					paddlesProperty[0].largePaddle = 1;
					paddlesProperty[0].width *= document.global.powerUp.largePaddle.multiplier;
					paddlesProperty[0].height *= document.global.powerUp.largePaddle.multiplier;
					adjustPaddles(paddlesProperty[0])
				}
				else if (document.global.socket.gameInfo.gameMode === "versus") {
					for (let i = 1; i <= document.global.socket.gameInfo.playerGame[0].player.length; i++) {
						paddlesProperty[i - 1].largePaddle = 1;
						paddlesProperty[i - 1].width *= document.global.powerUp.largePaddle.multiplier;
						paddlesProperty[i - 1].height *= document.global.powerUp.largePaddle.multiplier;
						adjustPaddles(paddlesProperty[i - 1]);
					}
				}
			}
			else {
				const paddlesProperty = document.global.paddle.paddlesProperty;
				if (document.global.socket.gameInfo.gameMode === "tournament") {
					document.global.paddle.paddlesProperty[1].largePaddle = 1;
					document.global.paddle.paddlesProperty[1].width *= document.global.powerUp.largePaddle.multiplier;
					document.global.paddle.paddlesProperty[1].height *= document.global.powerUp.largePaddle.multiplier;
					adjustPaddles(document.global.paddle.paddlesProperty[1])
				}
				else if (document.global.socket.gameInfo.gameMode === "versus") {
					for (let i = document.global.socket.gameInfo.playerGame[0].player.length + 1; i <= document.global.socket.gameInfo.playerGame[1].player.length + document.global.socket.gameInfo.playerGame[0].player.length; i++) {
						paddlesProperty[i - 1].largePaddle = 1;
						paddlesProperty[i - 1].width *= document.global.powerUp.largePaddle.multiplier;
						paddlesProperty[i - 1].height *= document.global.powerUp.largePaddle.multiplier;
						adjustPaddles(paddlesProperty[i - 1]);
					}
				}
			}
			
		}
		else if (data.mode === "enableInvisibility") {
			if (document.global.sphere.sphereMeshProperty[0].velocityZ <= 0) {
				const paddlesProperty = document.global.paddle.paddlesProperty;
				if (document.global.socket.gameInfo.gameMode === "tournament")
					paddlesProperty[0].invisibility = 1;
				else if (!document.global.gameplay.local && document.global.socket.gameInfo.gameMode === "versus") {
					for (let i = 1; i <= document.global.socket.gameInfo.playerGame[0].player.length; i++) 
						paddlesProperty[i - 1].invisibility = 1;
				}
			}
			else {
				const paddlesProperty = document.global.paddle.paddlesProperty;
				if (!document.global.gameplay.local && document.global.socket.gameInfo.gameMode === "tournament")
					paddlesProperty[1].invisibility = 1;
				else if (document.global.socket.gameInfo.gameMode === "versus") {
					for (let i = document.global.socket.gameInfo.playerGame[0].player.length + 1; i <= document.global.socket.gameInfo.playerGame[1].player.length + document.global.socket.gameInfo.playerGame[0].player.length; i++)
						paddlesProperty[i - 1].invisibility = 1;
				}
			}
		}
		else if (data.mode === "resetPaddle") {
			document.global.paddle.paddlesProperty.forEach(paddleProperty=>{
				//large paddles reset
				paddleProperty.largePaddle = 0;
				paddleProperty.width = document.global.paddle.defaultWidth;
				paddleProperty.height = document.global.paddle.defaultHeight;
				//paddles invisibility reset
				paddleProperty.invisibility = 0;
			});
		}
		else if (data.mode === "pause") {
			document.global.gameplay.pause = data.pause;
		}
		else if (data.mode === "mainClient" && document.global.socket.gameInfo.mainClient !== document.global.gameplay.username) {
			document.global.socket.gameInfo = data.gameInfo;
			let liveGameData = data.liveGameData;
			processReceiveLiveGameData(liveGameData);
			if (document.global.socket.gameInfo.gameMode === "versus") {
				let paddleIndex = document.global.socket.gameInfo.playerGame[0].player.indexOf(document.global.socket.gameInfo.mainClient);
				if (paddleIndex === -1)
					paddleIndex = document.global.socket.gameInfo.playerGame[1].player.indexOf(document.global.socket.gameInfo.mainClient) + document.global.socket.gameInfo.playerGame[0].player.length;
				document.global.paddle.paddlesProperty[paddleIndex] = data.liveGameData.paddlesProperty;
			}
			else {
				let tournamentPaddleIndex;;
				if (document.global.socket.gameInfo.playerGame[document.global.socket.gameInfo.currentRound][0].alias === document.global.socket.gameInfo.mainClient)
					tournamentPaddleIndex = 0;
				else if (document.global.socket.gameInfo.playerGame[document.global.socket.gameInfo.currentRound][1].alias === document.global.socket.gameInfo.mainClient)
					tournamentPaddleIndex = 1;
				else
					tournamentPaddleIndex = -1;
				if (tournamentPaddleIndex !== -1)
					document.global.paddle.paddlesProperty[tournamentPaddleIndex] = data.liveGameData.paddlesProperty;
			}
			document.global.sphere.sphereMeshProperty = data.liveGameData.sphereMeshProperty;
			document.global.gameplay.ludicrious = data.liveGameData.ludicrious;
			document.global.gameplay.roundStart = data.liveGameData.roundStart;
			document.global.gameplay.initRotateY = data.liveGameData.initRotateY;
			document.global.gameplay.initRotateX = data.liveGameData.initRotateX;
			document.global.gameplay.backgroundIndex = data.liveGameData.backgroundIndex;
			document.global.powerUp.meshProperty = data.liveGameData.meshProperty;
			document.global.powerUp.shake.enable = data.liveGameData.shake;
		}
		else if (data.mode === "player" && data.playerName !== document.global.gameplay.username) {
			const clientWidth = document.global.clientWidth; 
			let paddlesProperty = data.liveGameData;
			if (Object.keys(paddlesProperty).length) {
				paddlesProperty.positionX = paddlesProperty.positionX * clientWidth;
				paddlesProperty.positionY = paddlesProperty.positionY * clientWidth;
				paddlesProperty.positionZ = paddlesProperty.positionZ * clientWidth;
				paddlesProperty.width = paddlesProperty.width * clientWidth;
				paddlesProperty.height = paddlesProperty.height * clientWidth;
			}
			
			if (document.global.socket.gameInfo.gameMode === "versus") {
				let paddleIndex; 
				paddleIndex = document.global.socket.gameInfo.playerGame[0].player.indexOf(data.playerName);
				if (paddleIndex === -1)
					paddleIndex = document.global.socket.gameInfo.playerGame[1].player.indexOf(data.playerName) + document.global.socket.gameInfo.playerGame[0].player.length;
				document.global.paddle.paddlesProperty[paddleIndex] = paddlesProperty
			}
			else {
				let tournamentPaddleIndex;
				if (document.global.socket.gameInfo.playerGame[document.global.socket.gameInfo.currentRound][0].alias === data.playerName)
					tournamentPaddleIndex = 0;
				else if (document.global.socket.gameInfo.playerGame[document.global.socket.gameInfo.currentRound][1].alias === data.playerName)
					tournamentPaddleIndex = 1;
				else
					tournamentPaddleIndex = -1;
				if (tournamentPaddleIndex !== -1) {
					document.global.paddle.paddlesProperty[tournamentPaddleIndex] = paddlesProperty
				}
			}
			
		}
			
	};

	document.global.socket.gameSocket.onclose = function(e) {
		document.global.socket.gameSocket = null;
	};
	document.global.socket.gameSocket.onerror = function(event) {
		console.error('WebSocket GameSocket Error:', event);
	};
}




export function keyBindingMultiplayer() {
	const multi = document.querySelector(".nav-multi");
	multi.addEventListener("click", (e)=>{
		if (document.global.gameplay.username) {
			document.global.ui.mainMenu = 0;
			document.global.ui.multiLobby = 1;
			createGameLobbyWebSocket();
		}
	})
	const multiLobbyBack = document.querySelector(".multi-lobby-back");
	multiLobbyBack.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 1;
		document.global.ui.multiLobby = 0;
		if (document.global.socket.gameLobbySocket)
			document.global.socket.gameLobbySocket.close();
	})
	const multiCreateLeave = document.querySelector(".multi-leave-game");
	multiCreateLeave.addEventListener("click", (e)=>{
		if (document.global.socket.gameLobbySocket && document.global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
			document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
		if (document.global.socket.gameSocket && document.global.socket.gameSocket.readyState === WebSocket.OPEN)
			document.global.socket.gameSocket.close();
		document.global.socket.gameInfo = {
			mainClient:"",
			gameMode:"",
			player:{},
			playerGame:[],
			currentRound:0,
			round:0,
			ludicrious:document.global.gameplay.defaultLudicrious,
			powerUp:document.global.gameplay.defaultPowerUp,
			duration:document.global.gameplay.defaultDuration,
			durationCount:document.global.gameplay.defaultDuration,
		};
		document.global.ui.multiLobby = 1;
		document.global.ui.multiCreate = 0;
		document.global.socket.ready = 0;
		document.querySelector('.multi-create-display-player-versus-one').innerHTML = ''
		document.querySelector('.multi-create-display-player-versus-two').innerHTML = ''
		document.querySelector('.multi-create-display-player-tournament').innerHTML = ''
	})
	const multiCreateReady = document.querySelector(".multi-ready-game");
	multiCreateReady.addEventListener("click", (e) => {
		document.global.socket.ready? document.global.socket.ready = 0:document.global.socket.ready =1;
		document.global.socket.gameSocket.send(JSON.stringify({mode:"updateReady", ready:document.global.socket.ready}))
	})
	const login = document.querySelector(".nav-login");
	login.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 0;
		document.global.ui.login = 1;
	})
	const logout = document.querySelector(".nav-logout");
	logout.addEventListener("click", (e)=>{
		fetch_logout().then(data=>{
			document.global.ui.auth = 0;
			document.global.gameplay.username = "";
		})
	})
	const loginBack = document.querySelector(".login-back");
	loginBack.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 1;
		document.global.ui.login = 0;
	})
	const loginSubmit = document.querySelector(".login");
	loginSubmit.addEventListener("submit", (e)=>{
		document.global.ui.authWarning = 0;
		e.preventDefault();
		fetch_login({username:document.getElementById("username").value, password:document.getElementById("password").value}).then(data=>{
			if (data.authenticated) {
				document.global.gameplay.username = data.username;
				document.global.ui.auth = 1;
				document.global.ui.toggleCanvas = 0;
				document.global.ui.login = 0;
				document.global.ui.mainMenu = 1;
			}
			else {
				document.global.gameplay.username = "";
				document.global.ui.auth = 0;
				document.global.ui.authWarning = 1;
			}
		});
	})
	const multiCreateVersus = document.querySelector(".multi-create-versus");
	multiCreateVersus.addEventListener("click", (e)=>{
		if (document.global.socket.gameLobbyInfo.every(gameLobbyInfo=>{
			return gameLobbyInfo.mainClient !== document.global.gameplay.username
		})) {
			document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"create", gameMode:"versus"}));
			createGameSocket(document.global.gameplay.username)
			document.global.socket.gameSocket.onopen = function() {
				document.global.ui.multiCreate = 1;
				document.global.ui.multiLobby = 0;
				document.global.socket.gameInfo.mainClient = document.global.gameplay.username;
				document.global.socket.gameInfo.gameMode = "versus";
				document.global.socket.gameInfo.playerGame = [{teamName:"TeamOne", score:0, player:[], winner:false},{teamName:"TeamTwo", score:0, player:[], winner:false}];
				document.global.socket.gameSocket.send(JSON.stringify({
					mode:"create",
					gameInfo:document.global.socket.gameInfo
				}))
			}
		}
	})
	const multiCreateTournament = document.querySelector(".multi-create-tournament");
	multiCreateTournament.addEventListener("click", (e)=>{
		if (document.global.socket.gameLobbyInfo.every(gameLobbyInfo=>{
			return gameLobbyInfo.mainClient !== document.global.gameplay.username
		})) {
			document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"create", gameMode:"tournament"}));
			createGameSocket(document.global.gameplay.username)
			document.global.socket.gameSocket.onopen = function() {
				document.global.ui.multiCreate = 1;
				document.global.ui.multiLobby = 0;
				document.global.socket.gameInfo.mainClient = document.global.gameplay.username;
				document.global.socket.gameInfo.gameMode = "tournament";
				document.global.socket.gameSocket.send(JSON.stringify({
					mode:"create",
					gameInfo:document.global.socket.gameInfo
				}))
			}
		}
	})
	const multiCreateDuration = document.getElementById("multi-create-duration");
	multiCreateDuration.addEventListener("change", (e) => {
		if (document.global.socket.gameInfo.mainClient && document.global.socket.gameInfo.mainClient === document.global.gameplay.username) {
			document.global.socket.gameInfo.duration = e.target.value;
			document.global.socket.gameSocket.send(JSON.stringify({mode:"updateDuration", duration:document.global.socket.gameInfo.duration}))
		}
	})
	const multiCreatePowerUp = document.getElementById("multi-create-powerUp");
	multiCreatePowerUp.addEventListener("change", (e) => {
		if (document.global.socket.gameInfo.mainClient && document.global.socket.gameInfo.mainClient === document.global.gameplay.username) {
			document.global.socket.gameInfo.powerUp? document.global.socket.gameInfo.powerUp = 0:document.global.socket.gameInfo.powerUp = 1;
			document.global.socket.gameSocket.send(JSON.stringify({mode:"updatePowerUp", powerUp:document.global.socket.gameInfo.powerUp}))
		}
	})
	const multiCreateLudicrious = document.getElementById("multi-create-ludicrious");
	multiCreateLudicrious.addEventListener("change", (e) => {
		if (document.global.socket.gameInfo.mainClient && document.global.socket.gameInfo.mainClient === document.global.gameplay.username) {
			document.global.socket.gameInfo.ludicrious? document.global.socket.gameInfo.ludicrious = 0:document.global.socket.gameInfo.ludicrious = 1;
			document.global.socket.gameSocket.send(JSON.stringify({mode:"updateLudicrious", ludicrious:document.global.socket.gameInfo.ludicrious}))
		}
	})
	const multiCreateChange = document.querySelector(".multi-create-change");
	multiCreateChange.addEventListener("click", (e) => {
		
		let index = document.global.socket.gameInfo.playerGame[0].player.indexOf(document.global.gameplay.username);
		if (index !== -1) {
			document.global.socket.gameInfo.playerGame[0].player = [...document.global.socket.gameInfo.playerGame[0].player.slice(0, index), ...document.global.socket.gameInfo.playerGame[0].player.slice(index+1)];
			document.global.socket.gameInfo.playerGame[1].player.push(document.global.gameplay.username)
			
		}
		else {
			index = document.global.socket.gameInfo.playerGame[1].player.indexOf(document.global.gameplay.username);
			if (index !== -1) {
				document.global.socket.gameInfo.playerGame[1].player = [...document.global.socket.gameInfo.playerGame[1].player.slice(0, index), ...document.global.socket.gameInfo.playerGame[1].player.slice(index+1)];
				document.global.socket.gameInfo.playerGame[0].player.push(document.global.gameplay.username)
			}
		}
		
		document.global.socket.gameSocket.send(JSON.stringify({mode:"updatePlayer", playerGame:document.global.socket.gameInfo.playerGame}))
	})
	const multiStartGame = document.querySelector(".multi-start-game");
	multiStartGame.addEventListener("click", (e) => {
		const playerArray = Object.keys(document.global.socket.gameInfo.player)
		if (playerArray.every(player=>{
			return document.global.socket.gameInfo.player[player].ready === 1
		}) && document.global.socket.gameInfo.playerGame[0].player.length>0 && document.global.socket.gameInfo.playerGame[1].player.length>0) {
			document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"gameStart", mainClient:document.global.socket.gameInfo.mainClient}))
			document.global.socket.gameSocket.send(JSON.stringify({mode:"gameStart"}))
		}
		
	})
	const multiMatchFix = document.querySelector(".multi-matchFix");
	multiMatchFix.addEventListener("click", (e) => {
		const playerArray = Object.keys(document.global.socket.gameInfo.player)
		if (document.global.socket.gameInfo.gameMode === "tournament" && playerArray.every(player=>{
			return document.global.socket.gameInfo.player[player].ready === 1
		})) {
			matchFixMulti();
			playerArray.forEach(player=>{
				document.global.socket.gameInfo.player[player].ready = 0;
			});
			document.global.socket.gameSocket.send(JSON.stringify({
				mode:"matchFix", 
				gameInfo:document.global.socket.gameInfo
			}))
		}
	})
	const multiMatchFixReady = document.querySelector(".multi-tournament-matchFix-ready-button");
	multiMatchFixReady.addEventListener("click", (e) => {
		if (document.global.socket.gameInfo.player[document.global.gameplay.username].ready)
			document.global.socket.gameSocket.send(JSON.stringify({mode:"updateReady", ready:0}))
		else 
			document.global.socket.gameSocket.send(JSON.stringify({mode:"updateReady", ready:1}))
	})

	const multiMatchFixStart = document.querySelector(".multi-tournament-matchFix-start-button");
	multiMatchFixStart.addEventListener("click", (e) => {
		const playerArray = Object.keys(document.global.socket.gameInfo.player)
		if (playerArray.every(player=>{
			return document.global.socket.gameInfo.player[player].ready === 1
		})) {
			document.global.socket.gameSocket.send(JSON.stringify({mode:"gameStart"}))
			document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"gameStart", mainClient:document.global.socket.gameInfo.mainClient}))
		}
		
	})
	const multiHostLeftLeave = document.querySelector(".multi-host-left-leave-button");
	multiHostLeftLeave.addEventListener("click", (e)=>{
		document.global.socket.ready = 0;
		document.global.socket.gameInfo = {
			mainClient:"",
			gameMode:"",
			player:{},
			playerGame:[],
			currentRound:0,
			round:0,
			ludicrious:document.global.gameplay.defaultLudicrious,
			powerUp:document.global.gameplay.defaultPowerUp,
			duration:document.global.gameplay.defaultDuration,
			durationCount:document.global.gameplay.defaultDuration,
		};
		resetGame();
	})
	

}
