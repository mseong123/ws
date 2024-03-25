import * as THREE from 'https://threejs.org/build/three.module.js';
import {global} from './global.js';
import { matchFix, populateWinner } from './utilities.js'
import { windowResize } from './main.js'

function canvasKeydown(e) {
	let arrow = e.key;
	if (e.keyCode === 87)
		global.keyboard.w =1;
	if (e.keyCode === 83) 
		global.keyboard.s =1;
	if (e.keyCode === 65) 
		global.keyboard.a =1;
	if (e.keyCode === 68) 
		global.keyboard.d =1;
	if (arrow === 'ArrowUp')
		global.keyboard.up =1;
	if (arrow === 'ArrowDown')
		global.keyboard.down =1;
	if (arrow === 'ArrowLeft')
		global.keyboard.left =1;
	if (arrow === 'ArrowRight')
		global.keyboard.right =1;
}

function canvasKeyup(e) {
	let arrow = e.key;
	if (e.keyCode === 87)
		global.keyboard.w = 0;
	if (e.keyCode === 83) 
		global.keyboard.s =0;
	if (e.keyCode === 65) 
		global.keyboard.a =0;
	if (e.keyCode === 68) 
		global.keyboard.d =0;
	if (arrow === 'ArrowUp')
		global.keyboard.up =0;
	if (arrow === 'ArrowDown')
		global.keyboard.down =0;
	if (arrow === 'ArrowLeft')
		global.keyboard.left =0;
	if (arrow === 'ArrowRight')
		global.keyboard.right =0;
}

function canvasMouseMove(e) {
	const canvas = document.querySelector(".canvas");
	const canvasContainer = document.querySelector(".canvas-container");
	let paddleWidth = global.paddle.defaultWidth;
	let paddleHeight = global.paddle.defaultHeight;
	const canvasWidth = canvas.clientWidth;
	const canvasHeight = canvas.clientHeight;
	const arenaWidth = global.arena.width;
	const arenaHeight = global.arena.height;
	const offsetTop = canvasContainer.offsetTop;
	const offsetLeft = canvasContainer.offsetLeft;
    const mouseX = e.clientX - offsetLeft;
	const mouseY = e.clientY - offsetTop;
	const paddlesProperty = global.paddle.paddlesProperty;
	let versusPaddleIndex;
	let tournamentPaddleIndex;
	if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
		versusPaddleIndex = global.socket.gameInfo.playerGame[0].player.indexOf(global.gameplay.username);
		if (versusPaddleIndex === -1) {
			versusPaddleIndex = global.socket.gameInfo.playerGame[1].player.indexOf(global.gameplay.username)
			if (versusPaddleIndex !== -1)
				versusPaddleIndex += global.socket.gameInfo.playerGame[0].player.length
		}
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
		if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === global.gameplay.username)
			tournamentPaddleIndex = 0;
		else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === global.gameplay.username)
			tournamentPaddleIndex = 1;
		else
			tournamentPaddleIndex = -1;
	}

		
	//large paddle power up modification
	if ((global.gameplay.local && paddlesProperty[0].largePaddle) || !global.gameplay.local && global.socket.gameInfo.gameMode === "tournament" && tournamentPaddleIndex !== -1  && paddlesProperty[tournamentPaddleIndex].largePaddle || !global.gameplay.local && global.socket.gameInfo.gameMode === "versus" && versusPaddleIndex !== -1 && paddlesProperty[versusPaddleIndex].largePaddle) { 
		paddleWidth = paddleWidth * global.powerUp.largePaddle.multiplier;
		paddleHeight = paddleHeight * global.powerUp.largePaddle.multiplier;
	}
	

	//calculation of positionX and positionY for paddle
	let positionX = -((canvasWidth - mouseX) / canvasWidth * arenaWidth) + (arenaWidth / 2);
	if (positionX > (arenaWidth / 2) - (paddleWidth/2))
		positionX = (arenaWidth / 2) - (paddleWidth/2);
	else if (positionX < (-arenaWidth / 2) + (paddleWidth/2))
		positionX = (-arenaWidth / 2) + (paddleWidth/2)

	let positionY = -(-((canvasHeight - mouseY) / canvasHeight * arenaHeight) + (arenaHeight / 2));
	if (positionY > (arenaHeight / 2) - (paddleHeight/2))
		positionY = (arenaHeight / 2) - (paddleHeight/2);
	else if (positionY < (-arenaHeight / 2) + (paddleHeight/2))
		positionY = (-arenaHeight / 2) + (paddleHeight/2);
	
	if (!global.gameplay.pause) {
		// For local game, mouse is attached to paddle nearest to camera
		if (global.gameplay.local) {
			if ((global.arena3D.rotation.x - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.x - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[0].positionY = -positionY;
			else
				paddlesProperty[0].positionY = positionY;
			if ((global.arena3D.rotation.y - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.y - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[0].positionX = -positionX;
			else
				paddlesProperty[0].positionX = positionX;
		}
		//For multi versus, mouse is attached to player num
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus" && versusPaddleIndex !== -1) {
			if ((global.arena3D.rotation.x - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.x - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[versusPaddleIndex].positionY = -positionY;
			else
				paddlesProperty[versusPaddleIndex].positionY = positionY;
			if ((global.arena3D.rotation.y - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.y - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[versusPaddleIndex].positionX = -positionX;
			else
				paddlesProperty[versusPaddleIndex].positionX = positionX;
		}
		//For multi tournament, mouse is attached to index 0;
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament" && tournamentPaddleIndex !== -1) {
			if ((global.arena3D.rotation.x - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.x - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[tournamentPaddleIndex].positionY = -positionY;
			else
				paddlesProperty[tournamentPaddleIndex].positionY = positionY;
			if ((global.arena3D.rotation.y - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.y - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[tournamentPaddleIndex].positionX = -positionX;
			else
				paddlesProperty[tournamentPaddleIndex].positionX = positionX;
		}
	}
}

function canvasTouchMove(e) {
	if (e.touches.length < 2)
		e.preventDefault();
	const canvas = document.querySelector(".canvas");
	const canvasContainer = document.querySelector(".canvas-container");
	let paddleWidth = global.paddle.defaultWidth;
	let paddleHeight = global.paddle.defaultHeight;
	const canvasWidth = canvas.clientWidth;
	const canvasHeight = canvas.clientHeight;
	const arenaWidth = global.arena.width;
	const arenaHeight = global.arena.height;
	const offsetTop = canvasContainer.offsetTop;
	const offsetLeft = canvasContainer.offsetLeft;
    const touchX = e.touches[0].clientX - offsetLeft;
	const touchY = e.touches[0].clientY - offsetTop;;
	const paddlesProperty = global.paddle.paddlesProperty;
	let versusPaddleIndex;
	let tournamentPaddleIndex;
	if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
		versusPaddleIndex = global.socket.gameInfo.playerGame[0].player.indexOf(global.gameplay.username);
		if (versusPaddleIndex === -1) {
			versusPaddleIndex = global.socket.gameInfo.playerGame[1].player.indexOf(global.gameplay.username);
			if (versusPaddleIndex !== -1)
				versusPaddleIndex += global.socket.gameInfo.playerGame[0].player.length
		}
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
		if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === global.gameplay.username)
			tournamentPaddleIndex = 0;
		else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === global.gameplay.username)
			tournamentPaddleIndex = 1;
		else
			tournamentPaddleIndex = -1;
	}
		
	//large paddle power up modification
	if ((global.gameplay.local && paddlesProperty[0].largePaddle) || !global.gameplay.local && global.socket.gameInfo.gameMode === "tournament" && tournamentPaddleIndex !== -1  && paddlesProperty[tournamentPaddleIndex].largePaddle || !global.gameplay.local && global.socket.gameInfo.gameMode === "versus" && paddlesProperty[versusPaddleIndex].largePaddle) { 
		paddleWidth = paddleWidth * global.powerUp.largePaddle.multiplier;
		paddleHeight = paddleHeight * global.powerUp.largePaddle.multiplier;
	}
	
	//calculation of positionX and positionY for paddle
	let positionX = -((canvasWidth - touchX) / canvasWidth * arenaWidth) + (arenaWidth / 2);
	if (positionX > (arenaWidth / 2) - (paddleWidth/2))
		positionX = (arenaWidth / 2) - (paddleWidth/2);
	else if (positionX < (-arenaWidth / 2) + (paddleWidth/2))
		positionX = (-arenaWidth / 2) + (paddleWidth/2)

	let positionY = -(-((canvasHeight - touchY) / canvasHeight * arenaHeight) + (arenaHeight / 2));
	if (positionY > (arenaHeight / 2) - (paddleHeight/2))
		positionY = (arenaHeight / 2) - (paddleHeight/2);
	else if (positionY < (-arenaHeight / 2) + (paddleHeight/2))
		positionY = (-arenaHeight / 2) + (paddleHeight/2);
	
	global.touch.startX = e.touches[0].clientX - offsetTop;
	global.touch.startY = e.touches[0].clientY - offsetLeft;
	
	if (!global.gameplay.pause) {
		// For local game, mouse is attached to paddle nearest to camera
		if (global.gameplay.local) {
			if ((global.arena3D.rotation.x - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.x - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[0].positionY = -positionY;
			else
				paddlesProperty[0].positionY = positionY;
			if ((global.arena3D.rotation.y - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.y - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[0].positionX = -positionX;
			else
				paddlesProperty[0].positionX = positionX;
		}
		//For multi versus, mouse is attached to player num
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus" && versusPaddleIndex !== -1) {
			if ((global.arena3D.rotation.x - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.x - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[versusPaddleIndex].positionX = -positionX;
			else
				paddlesProperty[versusPaddleIndex].positionX = positionX;
			if ((global.arena3D.rotation.y - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.y - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[versusPaddleIndex].positionY = -positionY;
			else
				paddlesProperty[versusPaddleIndex].positionY = positionY;
		}
		//For multi tournament, mouse is attached to index 0;
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament" && tournamentPaddleIndex !== -1) {
			if ((global.arena3D.rotation.x - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.x - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[tournamentPaddleIndex].positionX = -positionX;
			else
				paddlesProperty[tournamentPaddleIndex].positionX = positionX;
			if ((global.arena3D.rotation.y - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.y - Math.PI/2) % (Math.PI * 2) < Math.PI)
				paddlesProperty[tournamentPaddleIndex].positionY = -positionY;
			else
				paddlesProperty[tournamentPaddleIndex].positionY = positionY;
		}
	}
}

function setPaddle() {
	if (global.gameplay.local || !global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
			const paddleMeshProperty = global.paddle.paddlesProperty;
			paddleMeshProperty[0].positionX = 0;
			paddleMeshProperty[0].positionY = 0;
			paddleMeshProperty[0].positionZ = (global.clientWidth / global.arena.aspect / 2) - (global.paddle.thickness * global.paddle.distanceFromEdgeModifier);
			paddleMeshProperty[0].visible = true;
			paddleMeshProperty[1].positionX = 0;
			paddleMeshProperty[1].positionY = 0;
			paddleMeshProperty[1].positionZ = -(global.clientWidth / global.arena.aspect / 2) + (global.paddle.thickness * global.paddle.distanceFromEdgeModifier)
			paddleMeshProperty[1].visible = true;
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
		const paddleMeshProperty = global.paddle.paddlesProperty;
		for (let i = 1; i <= global.socket.gameInfo.playerGame[0].player.length; i++) {
			paddleMeshProperty[i - 1].positionX = 0;
			paddleMeshProperty[i - 1].positionY = 0;
			paddleMeshProperty[i - 1].positionZ = (global.clientWidth / global.arena.aspect / 2) - (global.paddle.thickness * global.paddle.distanceFromEdgeModifier * i)
			paddleMeshProperty[i - 1].visible = true;
		}
		for (let i = global.socket.gameInfo.playerGame[0].player.length + 1; i <= global.socket.gameInfo.playerGame[1].player.length + global.socket.gameInfo.playerGame[0].player.length; i++) {
			paddleMeshProperty[i - 1].positionX = 0;
			paddleMeshProperty[i - 1].positionY = 0;
			paddleMeshProperty[i - 1].positionZ = -(global.clientWidth / global.arena.aspect / 2) + (global.paddle.thickness * global.paddle.distanceFromEdgeModifier * (i - global.socket.gameInfo.playerGame[0].player.length))
			paddleMeshProperty[i - 1].visible = true;
		}
	}
}

function gameStart() {
	global.gameplay.gameEnd = 0;
	global.gameplay.gameStart = 1;
	global.gameplay.initRotateY = 0;
	global.arena3D.rotation.y = 0;
	global.powerUp.mesh.forEach(mesh=>{
		mesh.rotation.y = 0;
		mesh.rotation.x = 0;
	})
	global.sphere.sphereMesh.forEach(sphereMesh=>{
		sphereMesh.rotation.y = 0;
		sphereMesh.rotation.x = 0;
	})
	setPaddle()
	//enable powerup based on game option
	if (global.gameplay.local || !global.gameplay.local && global.gameplay.username === global.socket.gameInfo.mainClient)
		resetPowerUp();
	//set orientation of screen based on player
	if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
		if (global.socket.gameInfo.playerGame[1].player.includes(global.gameplay.username))
			global.arena3D.rotation.y = Math.PI;
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
		if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === global.gameplay.username)
			global.arena3D.rotation.y = Math.PI;
	}
}

function resetPaddle() {
	global.paddle.paddlesProperty.forEach((paddlesProperty,idx)=>{
		if (idx === 0 || idx === 1) {
			paddlesProperty.positionX = 0;
			paddlesProperty.positionY = 0;
			if (idx === 0)
				paddlesProperty.positionZ = (global.clientWidth / global.arena.aspect / 2) - (global.paddle.thickness * global.paddle.distanceFromEdgeModifier);
			else
				paddlesProperty.positionZ = -(global.clientWidth / global.arena.aspect / 2) + (global.paddle.thickness * global.paddle.distanceFromEdgeModifier);
			paddlesProperty.visible = true;
		}
		else
			paddlesProperty.visible = false;
	})
}

function resetGame() {
	//overall game reset
	global.gameplay.gameStart = 0;
	global.gameplay.gameEnd = 0;
	global.gameplay.pause = 0;
	global.gameplay.gameSummary = 0;
	global.gameplay.local = 1;
	global.gameplay.initRotateY = 1;
	global.gameplay.initRotateX = 0;
	global.powerUp.enable = 1;
	global.powerUp.shake.enable = 0;
	global.arena3D.rotation.x = 0;
	global.arena3D.rotation.y = 0;
	global.gameplay.ludicrious = 0;
	global.ui.mainMenu = 1;
	global.ui.local = 0;
	global.ui.single = 0;
	global.ui.two = 0;
	global.ui.tournament = 0;
	global.ui.multiLobby = 0;
	global.ui.multiCreate = 0;
	global.socket.spectate = 0;
	resetPaddle();
	resetPowerUp();
	global.sphere.sphereMesh.forEach(sphereMesh=>{
		sphereMesh.rotation.x = 0;
		sphereMesh.rotation.y = 0;
	})
	global.powerUp.mesh.forEach(mesh=>{
		mesh.rotation.x = 0;
		mesh.rotation.y = 0;
	})
	//individual game format reset
	if (global.gameplay.single) {
		global.gameplay.localSingleInfo = {
			player:[{alias:"Player", score:0, winner:false}],
			ludicrious:global.gameplay.defaultLudicrious,
			powerUp:global.gameplay.defaultPowerUp,
			duration:global.gameplay.defaultDuration,
			durationCount:global.gameplay.defaultDuration
		};
		global.gameplay.single = 0;
		global.gameplay.computerScore = 0;
		global.gameplay.computerWinner = false;
	}
	else if (global.gameplay.two) {
		global.gameplay.localTwoInfo = {
			player:[{alias:"Player-One", score:0, winner:false}, {alias:"Player-Two", score:0, winner:false}],
			ludicrious:global.gameplay.defaultLudicrious,
			powerUp:global.gameplay.defaultPowerUp,
			duration:global.gameplay.defaultDuration,
			durationCount:global.gameplay.defaultDuration
		};
		global.gameplay.two = 0;
	}
	else if (global.gameplay.tournament) {
		if (global.gameplay.localTournamentInfo.currentRound < global.gameplay.localTournamentInfo.round - 1) {
			global.gameplay.localTournamentInfo.currentRound++;
			global.gameplay.localTournamentInfo.durationCount = global.gameplay.localTournamentInfo.duration;
			global.powerUp.enable = global.gameplay.localTournamentInfo.powerUp;
			gameStart();
		}
		else {
			global.gameplay.localTournamentInfo = {
				player:[{alias:"Player-One"}, {alias:"Player-Two"}],
				playerGame:[],
				currentRound:0,
				round:0,
				ludicrious:global.gameplay.defaultLudicrious,
				powerUp:global.gameplay.defaultPowerUp,
				duration:global.gameplay.defaultDuration,
				durationCount:global.gameplay.defaultDuration
			};
			global.gameplay.tournament = 0;
		}
	}
	else if (global.socket.gameInfo.gameMode ==="versus") {
		if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
			global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
			global.socket.gameSocket.close();
		global.socket.ready = 0;
		global.socket.gameInfo = {
			mainClient:"",
			gameMode:"",
			player:{},
			playerGame:[],
			currentRound:0,
			round:0,
			cheatCount:global.gameplay.defaultCheatCount,
			ludicrious:global.gameplay.defaultLudicrious,
			powerUp:global.gameplay.defaultPowerUp,
			duration:global.gameplay.defaultDuration,
			durationCount:global.gameplay.defaultDuration,
		};
		
	}
	else if (global.socket.gameInfo.gameMode ==="tournament") {
		if (global.socket.gameInfo.currentRound < global.socket.gameInfo.round - 1) {
			global.socket.gameInfo.currentRound++;
			global.socket.gameInfo.durationCount = global.socket.gameInfo.duration;
			global.powerUp.enable = global.socket.gameInfo.powerUp;
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"gameStart"}))
		}
		else {
			if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
				global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.close();
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
		}
	} 
} 

function resetPowerUp() {
	global.sphere.sphereMeshProperty.forEach((sphereMeshProperty, idx)=>{
		//reset visible for sphere circle
		sphereMeshProperty.circleVisible = false;
		//invisibility reset
		sphereMeshProperty.opacity = 1;
		//double and ultimate sphere reset
		if (idx === 0)
			sphereMeshProperty.visible = true;
		else
			sphereMeshProperty.visible = false;
	})
	//reset visible for powerup mesh
	global.powerUp.meshProperty.forEach(meshProperty=>{
		meshProperty.visible = false;
	})
	if (global.gameplay.local) 
		global.paddle.paddlesProperty.forEach(paddleProperty=>{
			//large paddles reset
			paddleProperty.largePaddle = 0;
			paddleProperty.width = global.paddle.defaultWidth;
			paddleProperty.height = global.paddle.defaultHeight;
			//paddles invisibility reset
			paddleProperty.invisibility = 0;
		});
	else {
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
			global.socket.gameSocket.send(JSON.stringify({
				mode:"resetPaddle",
			}))
	}
	//shake reset
	global.powerUp.shake.enable = 0;

	//set new random powerup and position
	if (global.powerUp.enable) {
		const random = Math.floor(Math.random() * 5);
		global.powerUp.meshProperty[random].visible = true;
		global.powerUp.meshProperty[random].positionX = Math.floor((Math.random() * (global.arena.width - global.powerUp.circleRadius)) - (global.arena.width - global.powerUp.circleRadius)/ 2);
		global.powerUp.meshProperty[random].positionY = Math.floor((Math.random() * (global.arena.height - global.powerUp.circleRadius)) - (global.arena.height -global.powerUp.circleRadius) / 2);
		global.powerUp.meshProperty[random].positionZ = Math.floor((Math.random() * (global.arena.depth / 3)) - (global.arena.depth / 3));
	}
}



//addeventlistener
function keyBindingGame() {
	const canvas = document.querySelector(".canvas");
	canvas.addEventListener("mousemove", canvasMouseMove);
	canvas.addEventListener("touchmove", canvasTouchMove);
	canvas.addEventListener("keydown", canvasKeydown);
	canvas.addEventListener("keyup", canvasKeyup);
	document.addEventListener("keydown", (e)=>{
		if (e.keyCode === 27 && global.gameplay.gameStart && !global.gameplay.gameEnd && !global.socket.spectate) {
			global.gameplay.pause? global.gameplay.pause = 0 :global.gameplay.pause = 1;
			if (!global.gameplay.local && global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"pause", pause:global.gameplay.pause}))
		}
		if (e.keyCode === 9)
			e.preventDefault();
		if (e.keyCode === 9 && global.gameplay.gameStart && !global.gameplay.gameEnd)
			global.gameplay.gameSummary = 1;
	})
	document.addEventListener("keyup", (e)=>{
		if (e.keyCode === 9)
			e.preventDefault();
		if (e.keyCode === 9 && global.gameplay.gameStart && !global.gameplay.gameEnd) 
			global.gameplay.gameSummary = 0;
	})
	
	document.addEventListener("click", (e)=>{
		if (!e.target.classList.contains("toggle-canvas")) {
			const menuCanvasChild = document.querySelector(".menu-canvas").querySelectorAll("*");
			if (Array.from(menuCanvasChild).every(child=>e.target !== child) && e.target !== document.querySelector(".menu-canvas"))
				global.ui.toggleCanvas = 0;
		}
		if (!e.target.classList.contains("toggle-game")) {
			const menuGameChild = document.querySelector(".menu-game").querySelectorAll("*");
			if (Array.from(menuGameChild).every(child=>e.target !== child) && e.target !== document.querySelector(".menu-game"))
				global.ui.toggleGame = 0;
		}
	})

	const logout =document.querySelector(".logout");
	logout.addEventListener("click", (e)=>{
		global.ui.auth = 0;
		global.ui.authNotRequired = 0;
		if (global.socket.gameInfo.mainClient) {
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
		}
		resetGame();
		windowResize();

	})
	const toggleCanvas = document.querySelector(".toggle-canvas");
	toggleCanvas.addEventListener("click", (e)=>{
		global.ui.toggleCanvas? global.ui.toggleCanvas = 0:global.ui.toggleCanvas = 1;
		e.stopPropagation();
	})

	const toggleGame = document.querySelector(".toggle-game");
	toggleGame.addEventListener("click", (e)=>{
		global.ui.toggleGame? global.ui.toggleGame = 0:global.ui.toggleGame = 1;
		e.stopPropagation();
	})
	const toggleCheat = document.querySelector(".toggle-cheat");
	toggleCheat.addEventListener("click", (e)=>{
		if (global.powerUp.meshProperty.some(meshProperty=>meshProperty.visible)) {
			if (global.gameplay.local)
				powerUpCollisionEffect(global.sphere.sphereMeshProperty[0])
			else if (!global.gameplay.local && global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"cheat", player:global.gameplay.username}));
		}
	})
	
	const local = document.querySelector(".nav-local");
	local.addEventListener("click", (e)=>{
		global.ui.mainMenu = 0;
		global.ui.local = 1;
	})
	const localBack = document.querySelector(".local-back");
	localBack.addEventListener("click", (e)=>{
		global.ui.mainMenu = 1;
		global.ui.local = 0;
	})
	const single = document.querySelector(".nav-single");
	single.addEventListener("click", (e)=>{
		global.ui.local = 0;
		global.ui.single = 1;
	})
	const two = document.querySelector(".nav-two");
	two.addEventListener("click", (e)=>{
		global.ui.local = 0;
		global.ui.two = 1;
	})
	const tournament = document.querySelector(".nav-tournament");
	tournament.addEventListener("click", (e)=>{
		global.ui.local = 0;
		global.ui.tournament = 1;
	})
	const singleBack = document.querySelector(".single-back");
	singleBack.addEventListener("click", (e)=>{
		global.ui.local = 1;
		global.ui.single = 0;
	})
	const twoBack = document.querySelector(".two-back");
	twoBack.addEventListener("click", (e)=>{
		global.ui.local = 1;
		global.ui.two = 0;
	})
	const tournamentBack = document.querySelector(".tournament-back");
	tournamentBack.addEventListener("click", (e)=>{
		global.ui.local = 1;
		global.ui.tournament = 0;
	})
	const singleAlias = document.querySelector(".single-alias");
	singleAlias.addEventListener("submit", (e)=>{
		e.preventDefault();
		const newPlayer = {
			alias:document.getElementById("single-alias-text").value,
			score:0,
			winner:false
		}
		document.getElementById("single-alias-text").value = "";
		if (global.gameplay.localSingleInfo.player.every(player=>{
			return player.alias !== newPlayer.alias;
		}) && global.gameplay.localSingleInfo.player.length < 1)
			global.gameplay.localSingleInfo.player.push(newPlayer);
	})
	const twoAlias = document.querySelector(".two-alias");
	twoAlias.addEventListener("submit", (e)=>{
		e.preventDefault();
		const newPlayer = {
			alias:document.getElementById("two-alias-text").value,
			score:0,
			winner:false
		}
		document.getElementById("two-alias-text").value = "";
		if (global.gameplay.localTwoInfo.player.every(player=>{
			return player.alias !== newPlayer.alias;
		}) && global.gameplay.localTwoInfo.player.length < 2)
			global.gameplay.localTwoInfo.player.push(newPlayer);
	})
	const tournamentAlias = document.querySelector(".tournament-alias");
	tournamentAlias.addEventListener("submit", (e)=>{
		e.preventDefault();
		const newPlayer = {
			alias:document.getElementById("tournament-alias-text").value,
		}
		document.getElementById("tournament-alias-text").value = "";
		if (global.gameplay.localTournamentInfo.player.every(player=>{
			return player.alias !== newPlayer.alias;
		}))
			global.gameplay.localTournamentInfo.player.push(newPlayer);
	})
	const singleDuration = document.getElementById("single-duration");
	singleDuration.addEventListener("change", (e)=>{
		global.gameplay.localSingleInfo.duration = e.target.value;
	})
	const twoDuration = document.getElementById("two-duration");
	twoDuration.addEventListener("change", (e)=>{
		global.gameplay.localTwoInfo.duration = e.target.value;
	})
	const tournamentDuration = document.getElementById("tournament-duration");
	tournamentDuration.addEventListener("change", (e)=>{
		global.gameplay.localTournamentInfo.duration = e.target.value;
	})
	const singlePowerup = document.getElementById("single-powerup");
	singlePowerup.addEventListener("change", (e)=>{
		global.gameplay.localSingleInfo.powerUp ? global.gameplay.localSingleInfo.powerUp = 0:global.gameplay.localSingleInfo.powerUp = 1;
	})
	const twoPowerup = document.getElementById("two-powerup");
	twoPowerup.addEventListener("change", (e)=>{
		global.gameplay.localTwoInfo.powerUp ? global.gameplay.localTwoInfo.powerUp = 0:global.gameplay.localTwoInfo.powerUp = 1;
	})
	const tournamentPowerup = document.getElementById("tournament-powerup");
	tournamentPowerup.addEventListener("change", (e)=>{
		global.gameplay.localTournamentInfo.powerUp ? global.gameplay.localTournamentInfo.powerUp = 0:global.gameplay.localTournamentInfo.powerUp = 1;
	})
	const singleLudicrious = document.getElementById("single-ludicrious");
	singleLudicrious.addEventListener("change", (e)=>{
		global.gameplay.localSingleInfo.ludicrious ? global.gameplay.localSingleInfo.ludicrious = 0:global.gameplay.localSingleInfo.ludicrious = 1;
	})
	const twoLudicrious = document.getElementById("two-ludicrious");
	twoLudicrious.addEventListener("change", (e)=>{
		global.gameplay.localTwoInfo.ludicrious ? global.gameplay.localTwoInfo.ludicrious = 0:global.gameplay.localTwoInfo.ludicrious = 1;
	})
	const tournamentLudicrious = document.getElementById("tournament-ludicrious");
	tournamentLudicrious.addEventListener("change", (e)=>{
		global.gameplay.localTournamentInfo.ludicrious ? global.gameplay.localTournamentInfo.ludicrious = 0:global.gameplay.localTournamentInfo.ludicrious = 1;
	})
	const singleStart = document.querySelector(".single-start");
	singleStart.addEventListener("click", (e)=>{
		if (global.gameplay.localSingleInfo.player.length === 1) {
			global.gameplay.local = 1;
			global.gameplay.single = 1;
			global.gameplay.localSingleInfo.durationCount = global.gameplay.localSingleInfo.duration;
			global.powerUp.enable = global.gameplay.localSingleInfo.powerUp;
			document.querySelector(".game-summary-header-type").textContent = "VERSUS A.I."
			gameStart()
		}
	})
	const twoStart = document.querySelector(".two-start");
	twoStart.addEventListener("click", (e)=>{
		if (global.gameplay.localTwoInfo.player.length === 2) {
			global.gameplay.local = 1;
			global.gameplay.two = 1;
			global.gameplay.localTwoInfo.durationCount = global.gameplay.localTwoInfo.duration;
			global.powerUp.enable = global.gameplay.localTwoInfo.powerUp;
			document.querySelector(".game-summary-header-type").textContent = "VERSUS"
			gameStart()
		}
	})
	const tournamentStart = document.querySelector(".tournament-start");
	tournamentStart.addEventListener("click", (e)=>{
		if (global.gameplay.localTournamentInfo.player.length >= 2) {
			global.gameplay.local = 1;
			global.gameplay.tournament = 1;
			global.gameplay.localTournamentInfo.durationCount = global.gameplay.localTournamentInfo.duration;
			global.powerUp.enable = global.gameplay.localTournamentInfo.powerUp;
			document.querySelector(".game-summary-header-type").textContent = "TOURNAMENT"
			matchFix();
			gameStart();
		}
	})

	const navPause = document.querySelector(".nav-pause");
	navPause.addEventListener("click", (e)=>{
		if (!global.gameplay.gameEnd) {
			global.gameplay.pause = 1;
			global.ui.toggleGame = 0;
			if (!global.gameplay.local && global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"pause", pause:global.gameplay.pause}))
		}
	})
	const pause = document.querySelector(".pause");
	pause.addEventListener("click", (e)=>{
		if (!global.gameplay.gameEnd && !global.socket.spectate) {
			global.gameplay.pause = 0;
			if (!global.gameplay.local && global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({mode:"pause", pause:global.gameplay.pause}))
		}
	})
	const gameSummary = document.querySelector(".game-summary-container");
	gameSummary.addEventListener("click", (e)=>{
		if (!global.gameplay.gameEnd)
			global.gameplay.gameSummary = 0;
	})
	const navGameSummary = document.querySelector(".nav-game-summary");
	navGameSummary.addEventListener("click", (e)=>{
		global.gameplay.gameSummary = 1;
		global.ui.toggleGame = 0;
	})

	const resetGameButton = document.querySelector(".reset-game-button");
	resetGameButton.addEventListener("click", (e)=>{
		resetGame();
	})

	const navReset = document.querySelector(".nav-reset");
	navReset.addEventListener("click", (e)=>{
		global.ui.toggleGame = 0;
		global.gameplay.gameEnd = 1;
		
		if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
			if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
				global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
			if (global.socket.gameInfo.mainClient === global.gameplay.username && global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN) {
				global.socket.gameSocket.send(JSON.stringify({
					mode:"gameEnd",
					gameInfo:global.socket.gameInfo
				}));
			}
			else {
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.close();
			}
		}
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
			if (global.socket.gameInfo.mainClient === global.gameplay.username && global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN) {
				global.socket.gameSocket.send(JSON.stringify({
					mode:"gameEnd",
					gameInfo:global.socket.gameInfo
				}));
			}
			else {
				global.socket.gameInfo.currentRound = global.socket.gameInfo.round - 1;
				if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
					global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
				if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
					global.socket.gameSocket.close();
			}
		}
		populateWinner();
	})

	const menuHome = document.querySelectorAll(".menu-home");
		menuHome.forEach(menuHome=>menuHome.addEventListener("click", (e)=>{
			global.gameplay.localSingleInfo = {
				player:[{alias:"Player", score:0, winner:false}],
				ludicrious:global.gameplay.defaultLudicrious,
				powerUp:global.gameplay.defaultPowerUp,
				duration:global.gameplay.defaultDuration,
				durationCount:global.gameplay.defaultDuration
			};
			global.gameplay.localTwoInfo = {
				player:[{alias:"Player-One", score:0, winner:false}, {alias:"Player-Two", score:0, winner:false}],
				ludicrious:global.gameplay.defaultLudicrious,
				powerUp:global.gameplay.defaultPowerUp,
				duration:global.gameplay.defaultDuration,
				durationCount:global.gameplay.defaultDuration
			};
			global.gameplay.localTournamentInfo = {
				player:[{alias:"Player-One"}, {alias:"Player-Two"}],
				playerGame:[],
				currentRound:0,
				round:0,
				ludicrious:global.gameplay.defaultLudicrious,
				powerUp:global.gameplay.defaultPowerUp,
				duration:global.gameplay.defaultDuration,
				durationCount:global.gameplay.defaultDuration
			};
			global.ui.mainMenu = 1;
			global.ui.local = 0;
			global.ui.single = 0;
			global.ui.two = 0;
			global.ui.tournament = 0;
			global.ui.multiLobby = 0;
			global.ui.multiCreate = 0;
		})
	)
}

function isBallAlignedWithPaddleX(paddlesProperty, sphereMeshProperty) {
	const halfPaddleWidth = paddlesProperty.width / 2;
	const sphereX = sphereMeshProperty.positionX;
	const paddleX = paddlesProperty.positionX;

	return sphereX >= paddleX - halfPaddleWidth && sphereX <= paddleX + halfPaddleWidth;
}

function isBallAlignedWithPaddleY(paddlesProperty, sphereMeshProperty) {
	const halfPaddleHeight = paddlesProperty.height / 2;
	const sphereY = sphereMeshProperty.positionY;
	const paddleY = paddlesProperty.positionY;

	return sphereY >= paddleY - halfPaddleHeight && sphereY <= paddleY + halfPaddleHeight;
}

function isPaddleCollision(sphereMeshProperty) {
	const sphereRadius =  global.sphere.radius;
	const paddleThickness = global.paddle.thickness;
	const paddlesProperty = global.paddle.paddlesProperty;
	
	for (let i = 0; i < paddlesProperty.length; i++) {
		let paddleZ = paddlesProperty[i].positionZ;
		let sphereZ = sphereMeshProperty.positionZ;
		if (paddleZ <= 0 && sphereZ - sphereRadius <= paddleZ && sphereZ - sphereRadius >= paddleZ - paddleThickness && isBallAlignedWithPaddleX(paddlesProperty[i], sphereMeshProperty) && isBallAlignedWithPaddleY(paddlesProperty[i], sphereMeshProperty) && paddlesProperty[i].visible)
			return i;
		else if (paddleZ > 0 && sphereZ + sphereRadius >= paddleZ - paddleThickness && sphereZ + sphereRadius <= paddleZ && isBallAlignedWithPaddleX(paddlesProperty[i], sphereMeshProperty) && isBallAlignedWithPaddleY(paddlesProperty[i], sphereMeshProperty) && paddlesProperty[i].visible)
			return i;
	}
	return false;
}

function hitSphereBack(paddlesProperty, sphereMeshProperty) {
	const velocityTopLimit = global.sphere.velocityTopLimit;
	const velocityBottomLimit = global.sphere.velocityBottomLimit;
	//invisibility effect
	if (paddlesProperty.invisibility) {
		sphereMeshProperty.circleOpacity = global.powerUp.invisibility.opacity;
		sphereMeshProperty.opacity = global.powerUp.invisibility.opacity;
	}
	else {
		sphereMeshProperty.circleOpacity = 1;
		sphereMeshProperty.opacity = 1;
	}
	sphereMeshProperty.velocityX = (sphereMeshProperty.positionX - paddlesProperty.positionX) / global.paddle.hitBackModifier; 
	sphereMeshProperty.velocityY = (sphereMeshProperty.positionY - paddlesProperty.positionY) / global.paddle.hitBackModifier;
	if (sphereMeshProperty.velocityY < velocityBottomLimit && sphereMeshProperty.velocityY > 0)
		sphereMeshProperty.velocityY = velocityBottomLimit;
	if (sphereMeshProperty.velocityY > -velocityBottomLimit && sphereMeshProperty.velocityY < 0)
		sphereMeshProperty.velocityY = -velocityBottomLimit;
	if (sphereMeshProperty.velocityX < velocityBottomLimit && sphereMeshProperty.velocityX > 0)
		sphereMeshProperty.velocityX = velocityBottomLimit;
	if (sphereMeshProperty.velocityX > -velocityBottomLimit && sphereMeshProperty.velocityX < 0)
		sphereMeshProperty.velocityX = -velocityBottomLimit;
	if (sphereMeshProperty.velocityX > velocityTopLimit)
		sphereMeshProperty.velocityX = velocityTopLimit;
	if (sphereMeshProperty.velocityX < -velocityTopLimit)
		sphereMeshProperty.velocityX = -velocityTopLimit;
	if (sphereMeshProperty.velocityY > velocityTopLimit)
		sphereMeshProperty.velocityY = velocityTopLimit;
	if (sphereMeshProperty.velocityY < -velocityTopLimit)
		sphereMeshProperty.velocityY = -velocityTopLimit;
	sphereMeshProperty.velocityZ *= -1;
  }

function isXCollision(sphereMeshProperty) {
	const radius = global.sphere.radius;
	const halfArenaWidth = global.arena.width / 2;
	const sphereX = sphereMeshProperty.positionX;
	return sphereX - radius <= -halfArenaWidth || sphereX + radius >= halfArenaWidth;
			
}

function isYCollision(sphereMeshProperty) {
	const radius = global.sphere.radius;
	const halfArenaHeight = global.arena.height / 2;
	const sphereY = sphereMeshProperty.positionY;
	return sphereY - radius <= -halfArenaHeight || sphereY + radius >= halfArenaHeight;
}

function isZCollision(sphereMeshProperty) {
	const radius = global.sphere.radius;
	const halfArenaDepth = global.arena.depth / 2;
	const sphereZ = sphereMeshProperty.positionZ;
	return sphereZ - radius <= -halfArenaDepth || sphereZ + radius >= halfArenaDepth
}

function isPowerUpCollision(sphereMeshProperty) {
	const sphereRadius = global.sphere.radius;
	const powerUpCircleRadius = global.powerUp.circleRadius;
	const vectorSphereMesh = new THREE.Vector3(sphereMeshProperty.positionX, sphereMeshProperty.positionY, sphereMeshProperty.positionZ);
	let vectorPowerUpMesh;

	global.powerUp.meshProperty.forEach(meshProperty=>{
		if (meshProperty.visible)
			vectorPowerUpMesh = new THREE.Vector3(meshProperty.positionX, meshProperty.positionY, meshProperty.positionZ);
	})
	if (vectorPowerUpMesh) {
		const distance = vectorSphereMesh.distanceTo(vectorPowerUpMesh);
		if (distance <= sphereRadius + powerUpCircleRadius)
			return true;
	}
	return false;
}

function adjustPaddles(paddlesProperty) {
	const halfArenaWidth = global.arena.width / 2;
	const halfArenaHeight = global.arena.height / 2;

	if (paddlesProperty.positionX + paddlesProperty.width /2 > halfArenaWidth)
		paddlesProperty.positionX = halfArenaWidth - paddlesProperty.width / 2;
	if (paddlesProperty.positionX - paddlesProperty.width /2 < -halfArenaWidth)
		paddlesProperty.positionX = -halfArenaWidth + paddlesProperty.width / 2;
	if (paddlesProperty.positionY + paddlesProperty.height /2 > halfArenaHeight)
		paddlesProperty.positionY = halfArenaHeight - paddlesProperty.height / 2;
	if (paddlesProperty.positionY - paddlesProperty.height/2  < -halfArenaHeight)
		paddlesProperty.positionY = -halfArenaHeight + paddlesProperty.height / 2;
}

function powerUpCollisionEffect(sphereMeshProperty) {
	let index;
	//set visibility of powerup sphere to false;
	global.powerUp.meshProperty.forEach((meshProperty,idx)=>{
		if (meshProperty.visible)
			index = idx;
	})
	global.powerUp.meshProperty[index].visible = false;
	//change color of rotating circle around each sphere to current powerup color and render visible
	global.sphere.sphereMeshProperty.forEach(property=>{
		property.circleColor = global.powerUp.color[index];
		property.circleVisible = true;
	})
	
	//INDIVIDUAL POWERUP effects
	//large paddle
	if (index === 0) {
		if (global.gameplay.local) {
			if (sphereMeshProperty.velocityZ <= 0) {
				global.paddle.paddlesProperty[0].largePaddle = 1;
				global.paddle.paddlesProperty[0].width *= global.powerUp.largePaddle.multiplier;
				global.paddle.paddlesProperty[0].height *= global.powerUp.largePaddle.multiplier;
				adjustPaddles(global.paddle.paddlesProperty[0])
			}
			else {
				global.paddle.paddlesProperty[1].largePaddle = 1;
				global.paddle.paddlesProperty[1].width *= global.powerUp.largePaddle.multiplier;
				global.paddle.paddlesProperty[1].height *= global.powerUp.largePaddle.multiplier;
				adjustPaddles(global.paddle.paddlesProperty[1])
			}
		}
		else {
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({
					mode:"enableLargePaddle",
				}))
		}
			
	}
	//shake
	else if (index === 1)
		global.powerUp.shake.enable = 1;

	//invisibility
	else if (index === 2) {
		if (global.gameplay.local) {
			if (sphereMeshProperty.velocityZ <= 0)
				global.paddle.paddlesProperty[0].invisibility = 1;
			else
				global.paddle.paddlesProperty[1].invisibility = 1;
		}
		else {
			if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
				global.socket.gameSocket.send(JSON.stringify({
					mode:"enableInvisibility",
				}))
		}
		sphereMeshProperty.opacity = global.powerUp.invisibility.opacity;
		sphereMeshProperty.circleOpacity = global.powerUp.invisibility.opacity;
	}

	//double 
	else if (index === 3) {
		global.sphere.sphereMeshProperty.forEach((property,idx)=>{
			if (idx === 0 || idx === 1) {
				if (idx === 1) {
					property.positionX = global.powerUp.meshProperty[index].positionX;
					property.positionY = global.powerUp.meshProperty[index].positionY;
					property.positionZ = global.powerUp.meshProperty[index].positionZ;
					property.velocityZ = global.sphere.sphereMeshProperty[0].velocityZ;
				}
				property.visible = true;
			}
			else
				property.visible = false;
		})
	}
	//ultimate
	else if (index === 4) {
		const sphereMeshPropertyOne = global.sphere.sphereMeshProperty[0];

		global.sphere.sphereMeshProperty.forEach((property,idx)=>{
			if (idx > 0) {
				if (idx < global.powerUp.ultimate.count / 4) {
					property.velocityX = -sphereMeshPropertyOne.velocityX / idx;
					property.velocityY = -sphereMeshPropertyOne.velocityY / idx;
					property.velocityZ = sphereMeshPropertyOne.velocityZ;
				}
				else if (idx < global.powerUp.ultimate.count / 2) {
					property.velocityX = sphereMeshPropertyOne.velocityX / idx;
					property.velocityY = sphereMeshPropertyOne.velocityY / idx;
					property.velocityZ = sphereMeshPropertyOne.velocityZ;
				}
				else if (idx < global.powerUp.ultimate.count * 3 / 4) {
					property.velocityX = -sphereMeshPropertyOne.velocityX / idx;
					property.velocityY = sphereMeshPropertyOne.velocityY / idx;
					property.velocityZ = sphereMeshPropertyOne.velocityZ;
				}
				else {
					property.velocityX = sphereMeshPropertyOne.velocityX / idx;
					property.velocityY = -sphereMeshPropertyOne.velocityY / idx;
					property.velocityZ = sphereMeshPropertyOne.velocityZ;
				}
				property.positionX = global.powerUp.meshProperty[index].positionX;
				property.positionY = global.powerUp.meshProperty[index].positionY;
				property.positionZ = global.powerUp.meshProperty[index].positionZ;
				property.velocityZ = sphereMeshPropertyOne.velocityZ;
				property.visible = true;
			}
		})
	}
}



function updateSpherePosition(sphereMeshProperty) {
	sphereMeshProperty.positionX += sphereMeshProperty.velocityX;
	sphereMeshProperty.positionY += sphereMeshProperty.velocityY;
	sphereMeshProperty.positionZ += sphereMeshProperty.velocityZ;
}

function processGame() {
	if (global.gameplay.local || (!global.gameplay.local && global.socket.gameInfo.mainClient === global.gameplay.username)) {
		if (global.gameplay.roundStart && global.gameplay.gameStart && !global.gameplay.pause && !global.gameplay.gameEnd) {
			global.sphere.sphereMeshProperty.forEach(sphereMeshProperty=>{
				if (sphereMeshProperty.visible) {
					updateSpherePosition(sphereMeshProperty)
					if(isXCollision(sphereMeshProperty)) {
						sphereMeshProperty.velocityX *= -1;
					}
					if(isYCollision(sphereMeshProperty)) {
						sphereMeshProperty.velocityY *= -1;
					}
					if(isZCollision(sphereMeshProperty)) {
						//for gameplay debugging
						if (global.gameplay.immortality) {
							sphereMeshProperty.velocityZ *= -1;
						}
						else {
							global.powerUp.durationFrame = 0;
							global.gameplay.roundStart = 0;
							if (global.gameplay.single) {
								if (sphereMeshProperty.positionZ > 0)
									global.gameplay.computerScore += 1;
								else {
									global.gameplay.localSingleInfo.player[0].score += 1;
								}
							}
							else if (global.gameplay.two) {
								if (sphereMeshProperty.positionZ > 0)
									global.gameplay.localTwoInfo.player[1].score += 1;
								else {
									global.gameplay.localTwoInfo.player[0].score += 1;
								}
							}
							else if (global.gameplay.tournament) {
								if (sphereMeshProperty.positionZ > 0)
									global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].score += 1;
								else
									global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].score += 1;
							}
							else if (!global.gameplay.local && global.socket.gameInfo.gameMode ==="versus") {
								if (sphereMeshProperty.positionZ > 0)
									global.socket.gameInfo.playerGame[1].score += 1;
								else
									global.socket.gameInfo.playerGame[0].score += 1;
							}
							else if (!global.gameplay.local && global.socket.gameInfo.gameMode ==="tournament") {
								if (sphereMeshProperty.positionZ > 0)
									global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].score += 1;
								else
								global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].score += 1;
							}
							global.sphere.sphereMeshProperty.forEach(sphereMeshProperty=>{
								sphereMeshProperty.positionX = 0;
								sphereMeshProperty.positionY = 0;
								sphereMeshProperty.positionZ = 0;
								sphereMeshProperty.velocityX = global.sphere.velocityX;
								sphereMeshProperty.velocityY = global.sphere.velocityY;
								sphereMeshProperty.velocityZ = global.sphere.velocityZ;
							})
							if (global.powerUp.enable)
								resetPowerUp();
						}
					}
					if (global.powerUp.enable && isPowerUpCollision(sphereMeshProperty)) {
						powerUpCollisionEffect(sphereMeshProperty);
					}
					let paddleCollisionIndex = isPaddleCollision(sphereMeshProperty);
					if(paddleCollisionIndex !== false)
						hitSphereBack(global.paddle.paddlesProperty[paddleCollisionIndex], sphereMeshProperty);
				}
			})
		}
	}
}

function movePaddle() {
	let arenaWidth = global.arena.width;
	let arenaHeight = global.arena.height;
	let paddleWidth = global.paddle.defaultWidth;
	let paddleHeight = global.paddle.defaultHeight;
	let largePaddleWidth = paddleWidth * global.powerUp.largePaddle.multiplier;
	let largePaddleHeight = paddleHeight * global.powerUp.largePaddle.multiplier;
	let paddleOne;
	let paddleTwo;
	
	//local game or multiplayer
	if (global.gameplay.local) {
		paddleOne = global.paddle.paddlesProperty[0];
		paddleTwo = global.paddle.paddlesProperty[1];
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
		let paddleIndex = global.socket.gameInfo.playerGame[0].player.indexOf(global.gameplay.username);
		if (paddleIndex === -1) {
			paddleIndex = global.socket.gameInfo.playerGame[1].player.indexOf(global.gameplay.username);
			if (paddleIndex !== -1)
				paddleIndex += global.socket.gameInfo.playerGame[0].player.length;
		}
		if (paddleIndex !== -1)
			paddleOne = global.paddle.paddlesProperty[paddleIndex];
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
		let tournamentPaddleIndex;
		if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
			if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === global.gameplay.username)
				tournamentPaddleIndex = 0;
			else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === global.gameplay.username)
				tournamentPaddleIndex = 1;
			else
				tournamentPaddleIndex = -1;
		}
		if (tournamentPaddleIndex !== -1)
			paddleOne = global.paddle.paddlesProperty[tournamentPaddleIndex];
	}
		

	//modification for large paddle powerup
	if (paddleOne) {
		if (paddleOne.largePaddle) {
			paddleWidth = largePaddleWidth;
			paddleHeight = largePaddleHeight;
		}
		if (!global.gameplay.pause && !global.gameplay.gameEnd) {
			if ((global.arena3D.rotation.x - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.x - Math.PI/2) % (Math.PI * 2) < Math.PI) {
				if (paddleOne.positionY < (arenaHeight / 2) - (paddleHeight/2))
					paddleOne.positionY += global.keyboard.s * global.keyboard.speed;
				if (paddleOne.positionY > (-arenaHeight / 2) + (paddleHeight/2))
					paddleOne.positionY -= global.keyboard.w * global.keyboard.speed;
			}
			else {
				if (paddleOne.positionY < (arenaHeight / 2) - (paddleHeight/2))
					paddleOne.positionY += global.keyboard.w * global.keyboard.speed;
				if (paddleOne.positionY > (-arenaHeight / 2) + (paddleHeight/2))
					paddleOne.positionY -= global.keyboard.s * global.keyboard.speed;
			}
			if ((global.arena3D.rotation.y - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.y - Math.PI/2) % (Math.PI * 2) < Math.PI) {
				if (paddleOne.positionX < (arenaWidth / 2) - (paddleWidth/2))
					paddleOne.positionX += global.keyboard.a * global.keyboard.speed;
				if (paddleOne.positionX > (-arenaWidth / 2) + (paddleWidth/2))
					paddleOne.positionX -= global.keyboard.d * global.keyboard.speed;
			}
			else {
				if (paddleOne.positionX < (arenaWidth / 2) - (paddleWidth/2))
					paddleOne.positionX += global.keyboard.d * global.keyboard.speed;
				if (paddleOne.positionX > (-arenaWidth / 2) + (paddleWidth/2))
					paddleOne.positionX -= global.keyboard.a * global.keyboard.speed;
			}
		}
	}
	if (global.gameplay.local && !global.gameplay.single) {
		let paddleWidth = global.paddle.defaultWidth;
		let paddleHeight = global.paddle.defaultHeight;
			//modification for large paddle powerup
			
		if (paddleTwo.largePaddle) {
			paddleWidth = largePaddleWidth;
			paddleHeight = largePaddleHeight;
		}
		if (!global.gameplay.pause && !global.gameplay.gameEnd) {
			if ((global.arena3D.rotation.x - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.x - Math.PI/2) % (Math.PI * 2) < Math.PI) {
				if (paddleTwo.positionY < (arenaHeight / 2) - (paddleHeight/2))
					paddleTwo.positionY += global.keyboard.down * global.keyboard.speed;
				if (paddleTwo.positionY > (-arenaHeight / 2) + (paddleHeight/2))
					paddleTwo.positionY -= global.keyboard.up * global.keyboard.speed;
			}
			else {
				if (paddleTwo.positionY < (arenaHeight / 2) - (paddleHeight/2))
					paddleTwo.positionY += global.keyboard.up * global.keyboard.speed;
				if (paddleTwo.positionY > (-arenaHeight / 2) + (paddleHeight/2))
					paddleTwo.positionY -= global.keyboard.down * global.keyboard.speed;
			}
			if ((global.arena3D.rotation.y - Math.PI / 2) % (Math.PI * 2) > 0 && (global.arena3D.rotation.y - Math.PI/2) % (Math.PI * 2) < Math.PI) {
				if (paddleTwo.positionX < (arenaWidth / 2) - (paddleWidth/2))
					paddleTwo.positionX += global.keyboard.left * global.keyboard.speed;
				if (paddleTwo.positionX > (-arenaWidth / 2) + (paddleWidth/2))
					paddleTwo.positionX -= global.keyboard.right * global.keyboard.speed;
			}
			else {
				if (paddleTwo.positionX < (arenaWidth / 2) - (paddleWidth/2))
					paddleTwo.positionX += global.keyboard.right * global.keyboard.speed;
				if (paddleTwo.positionX > (-arenaWidth / 2) + (paddleWidth/2))
					paddleTwo.positionX -= global.keyboard.left * global.keyboard.speed;
			}
		}
	}
}

export { gameStart, resetGame, resetPowerUp, keyBindingGame, adjustPaddles, powerUpCollisionEffect, processGame, movePaddle }








