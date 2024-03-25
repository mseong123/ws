import * as THREE from 'https://threejs.org/build/three.module.js';
import { global } from './global.js';
import { createGameSocket, multiGameStart} from './multiplayer.js';
import { updateGameSummary, updateMatchFix } from './utilities.js';

function processCamera(camera) {
	if (!global.gameplay.gameStart || global.gameplay.gameEnd) {
		camera.position.y = global.camera.initPositionY;
		camera.rotation.x = global.camera.initRotationX;
	}
	else {
		camera.position.y = 0;
		camera.rotation.x = 0;
	}
	camera.updateProjectionMatrix();
}

function processSphere() {
	global.sphere.sphereMesh.forEach((sphereMesh,idx)=>{
		//update position
		sphereMesh.position.set(global.sphere.sphereMeshProperty[idx].positionX, global.sphere.sphereMeshProperty[idx].positionY, global.sphere.sphereMeshProperty[idx].positionZ)
		//render visibility
		if (global.sphere.sphereMeshProperty[idx].visible)
			sphereMesh.visible = true;
		else
			sphereMesh.visible = false;
		
		//render surrounding circle color and opacity
		const circleMaterial = new THREE.LineBasicMaterial( { color: global.sphere.sphereMeshProperty[idx].circleColor, transparent:true, opacity:global.sphere.sphereMeshProperty[idx].circleOpacity});
		sphereMesh.children[0].material.dispose();
		sphereMesh.children[1].material.dispose();
		sphereMesh.children[0].material = circleMaterial;
		sphereMesh.children[1].material = circleMaterial;

		//render surrounding circle visibility
		if (global.sphere.sphereMeshProperty[idx].circleVisible) {
			sphereMesh.children[0].visible = true;
			sphereMesh.children[1].visible = true;
		}
		else {
			sphereMesh.children[0].visible = false;
			sphereMesh.children[1].visible = false;
		}
		//render opacity
		const sphereMaterial = new THREE.MeshPhongMaterial( { color: global.sphere.color, emissive: global.sphere.color, shininess:global.sphere.shininess, transparent:true, opacity:global.sphere.sphereMeshProperty[idx].opacity } );
		sphereMesh.material.dispose();
		sphereMesh.material = sphereMaterial;
	})
}

function processPaddle() {
	global.paddle.paddles.forEach((paddle,idx)=>{
		//Update position each paddle
		paddle.visible = global.paddle.paddlesProperty[idx].visible;
		paddle.position.set(global.paddle.paddlesProperty[idx].positionX, global.paddle.paddlesProperty[idx].positionY, global.paddle.paddlesProperty[idx].positionZ);
		//Update height and width of each paddle
		if (global.paddle.paddlesProperty[idx].width != paddle.geometry.width || global.paddle.paddlesProperty[idx].height != paddle.geometry.height) {
			const paddleGeometry = new THREE.BoxGeometry(global.paddle.paddlesProperty[idx].width, global.paddle.paddlesProperty[idx].height, global.paddle.thickness );
			paddle.geometry.dispose()
			paddle.geometry = paddleGeometry;
		}
	})
}

function processPowerUp() {
	global.powerUp.mesh.forEach((mesh, idx)=>{
		//rotate circle around each powerup
		mesh.rotation.z += global.powerUp.circleRotation;
		//render visible 
		if (global.powerUp.meshProperty[idx].visible)
			mesh.visible = true;
		else
			mesh.visible = false;
		//update position
		mesh.position.set(global.powerUp.meshProperty[idx].positionX, global.powerUp.meshProperty[idx].positionY, global.powerUp.meshProperty[idx].positionZ)
	})
	//rotate circle around each sphere
	global.sphere.sphereMesh.forEach(sphereMesh=>{
		sphereMesh.children[0].rotation.z += global.powerUp.circleRotation;
		sphereMesh.children[1].rotation.z += global.powerUp.circleRotation;
	})
}

function processBackground() {
	if (document.querySelector(".canvas-background").classList[2] !== global.gameplay.backgroundClass[global.gameplay.backgroundIndex])
		document.querySelectorAll(".canvas-background").forEach(background=>{
			background.classList.remove(background.classList[2]);
			background.classList.add(global.gameplay.backgroundClass[global.gameplay.backgroundIndex])
			const colorPalette = global.paddle.color[global.gameplay.backgroundIndex];
			for (let i = 0; i < global.paddle.maxPaddle; i++) {
				const paddleMaterial = new THREE.MeshPhongMaterial( { color: colorPalette[i], emissive: colorPalette[i], transparent:true, opacity:global.paddle.opacity });
				global.paddle.paddles[i].material.dispose();
				global.paddle.paddles[i].material = paddleMaterial;
			}
		})
}

function processUI() {
	if (global.ui.toggleCanvas)
		document.querySelector(".menu-canvas").classList.remove("display-none");
	else
		document.querySelector(".menu-canvas").classList.add("display-none");
	if (global.ui.toggleGame)
		document.querySelector(".menu-game").classList.remove("display-none");
	else
		document.querySelector(".menu-game").classList.add("display-none");
	if (global.ui.auth || global.ui.authNotRequired) {
		if (global.ui.auth)
			document.querySelector(".nav-multi").classList.remove("display-none");
		document.querySelector(".login-container").classList.add("display-none")
	}
	else {
		if (!global.ui.auth)
			document.querySelector(".nav-multi").classList.add("display-none");
		document.querySelector(".login-container").classList.remove("display-none");
	}
	global.ui.mainMenu?
		document.querySelector(".main-menu").classList.add("display-block"):document.querySelector(".main-menu").classList.remove("display-block");
	global.ui.local?
		document.querySelector(".local-menu").classList.add("display-block"):document.querySelector(".local-menu").classList.remove("display-block");
	global.ui.single?
		document.querySelector(".single-menu").classList.add("display-block"):document.querySelector(".single-menu").classList.remove("display-block");
	global.ui.two?
		document.querySelector(".two-menu").classList.add("display-block"):document.querySelector(".two-menu").classList.remove("display-block");
	global.ui.tournament?
		document.querySelector(".tournament-menu").classList.add("display-block"):document.querySelector(".tournament-menu").classList.remove("display-block");
	global.ui.multiLobby?
		document.querySelector(".multi-lobby-menu").classList.add("display-block"):document.querySelector(".multi-lobby-menu").classList.remove("display-block");
	if (global.socket.gameLobbyError) {
		document.querySelector(".multi-lobby-error").classList.remove("display-none");
		document.querySelector(".multi-lobby").classList.add("display-none");
	}
	else {
		document.querySelector(".multi-lobby-error").classList.add("display-none");
		document.querySelector(".multi-lobby").classList.remove("display-none");
	}
	global.ui.multiCreate?
		document.querySelector(".multi-create-menu").classList.add("display-block"):document.querySelector(".multi-create-menu").classList.remove("display-block");
	if (Object.keys(global.socket.gameInfo).length && !global.socket.gameError) {
		document.querySelector(".multi-create-option-menu").classList.remove("display-none");
		document.querySelector(".multi-create-warning").classList.add("display-none");
		document.querySelector(".multi-create-game-error").classList.add("display-none");
		document.querySelector(".multi-ready-game").classList.remove("display-none")
		document.querySelector(".multi-host-left-container").classList.add("display-none")
		document.querySelector(".multi-game-error-container").classList.add("display-none")
		if (global.socket.gameInfo.gameMode === 'versus') {
			document.querySelector(".multi-create-display-player-versus-one").classList.remove("display-none")
			document.querySelector(".multi-create-display-player-versus-two").classList.remove("display-none")
			document.querySelector(".multi-create-display-player-tournament").classList.add("display-none")
			if (global.socket.gameInfo.mainClient === global.gameplay.username)
				document.querySelector(".multi-start-game").classList.remove("display-none")
				
			else {
				document.querySelector(".multi-start-game").classList.add("display-none")
			}
		}
		else {
			document.querySelector(".multi-create-display-player-versus-one").classList.add("display-none")
			document.querySelector(".multi-create-display-player-versus-two").classList.add("display-none")
			document.querySelector(".multi-create-display-player-tournament").classList.remove("display-none")
			document.querySelector(".multi-start-game").classList.add("display-none")
			
			if (global.socket.gameInfo.mainClient === global.gameplay.username) {
				document.querySelector(".multi-matchfix").classList.remove("display-none")
				document.querySelector(".multi-tournament-matchFix-start-button").classList.remove("display-none")
			}
			else {
				document.querySelector(".multi-matchfix").classList.add("display-none")
				document.querySelector(".multi-tournament-matchFix-start-button").classList.add("display-none")
			}
			
		}
	}
	else {
		if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
			global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
		if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
			global.socket.gameSocket.close();
		document.querySelector(".multi-matchfix").classList.add("display-none")
		if (!global.gameplay.gameStart && !global.gameplay.gameEnd && !global.socket.matchFix) {
			document.querySelector(".multi-create-option-menu").classList.add("display-none");
			if (global.socket.gameError)
				document.querySelector(".multi-create-game-error").classList.remove("display-none");
			else
				document.querySelector(".multi-create-warning").classList.remove("display-none");
			document.querySelector(".multi-ready-game").classList.add("display-none")
			document.querySelector(".multi-start-game").classList.add("display-none")
		}
		if (!global.gameplay.gameStart && !global.gameplay.gameEnd && global.socket.matchFix) {
			global.socket.matchFix = 0;
			if (global.socket.gameError)
				document.querySelector(".multi-game-error-container").classList.remove("display-none")
			else 
				document.querySelector(".multi-host-left-container").classList.remove("display-none")
		}
		if (global.gameplay.gameStart && !global.gameplay.gameEnd) {
			if (global.socket.gameError)
				document.querySelector(".multi-game-error-container").classList.remove("display-none")
			else 
				document.querySelector(".multi-host-left-container").classList.remove("display-none")
			global.powerUp.shake.enable = 0;
			global.gameplay.initRotateY = 0;
			global.gameplay.initRotateX = 0;
		}
	}
	if (global.socket.matchFix) {
		document.querySelector(".multi-tournament-matchFix-container").classList.remove("display-none")
		updateMatchFix();
	}
	else
		document.querySelector(".multi-tournament-matchfix-container").classList.add("display-none");

	global.gameplay.ludicrious?
		document.querySelector(".timer").classList.add("timer-ludicrious"):document.querySelector(".timer").classList.remove("timer-ludicrious");
	for (let i = 0; i < global.gameplay.localSingleInfo.player.length; i++) {
		const parent = document.querySelector(".single-alias-display-inside");
		const target = document.querySelector(".single-" + global.gameplay.localSingleInfo.player[i].alias)
		
		if (!target) {
			const element = document.createElement('p');
			const button = document.createElement('button');
			button.setAttribute("type", "button")
			const xmark = document.createElement('i');
			xmark.classList.add("fa", "fa-xmark");
			xmark.setAttribute("single-identifier",global.gameplay.localSingleInfo.player[i].alias);
			button.addEventListener("click", (e)=>{
				for (let i = 0; i < global.gameplay.localSingleInfo.player.length; i++) {
					if (global.gameplay.localSingleInfo.player.length && global.gameplay.localSingleInfo.player[i] && global.gameplay.localSingleInfo.player[i].alias === e.target.getAttribute("single-identifier"))
						global.gameplay.localSingleInfo.player = [...global.gameplay.localSingleInfo.player.slice(0, i),...global.gameplay.localSingleInfo.player.slice(i + 1)];
				}
			})
			element.classList.add("single-" + global.gameplay.localSingleInfo.player[i].alias)
			element.textContent = global.gameplay.localSingleInfo.player[i].alias;
			parent.appendChild(element).appendChild(button).appendChild(xmark);
		}
	}

	for (let i = 0; i < global.gameplay.localTwoInfo.player.length; i++) {
		const parent = document.querySelector(".two-alias-display-inside");
		const target = document.querySelector(".two-" + global.gameplay.localTwoInfo.player[i].alias)
		
		if (!target) {
			const element = document.createElement('p');
			const button = document.createElement('button');
			button.setAttribute("type", "button")
			const xmark = document.createElement('i');
			xmark.classList.add("fa", "fa-xmark");
			xmark.setAttribute("two-identifier",global.gameplay.localTwoInfo.player[i].alias);
			button.addEventListener("click", (e)=>{
				for (let i = 0; i < global.gameplay.localTwoInfo.player.length; i++) {
					if (global.gameplay.localTwoInfo.player.length && global.gameplay.localTwoInfo.player[i] && global.gameplay.localTwoInfo.player[i].alias === e.target.getAttribute("two-identifier"))
						global.gameplay.localTwoInfo.player = [...global.gameplay.localTwoInfo.player.slice(0, i),...global.gameplay.localTwoInfo.player.slice(i + 1)];
				}
			})
			element.classList.add("two-" + global.gameplay.localTwoInfo.player[i].alias)
			element.textContent = global.gameplay.localTwoInfo.player[i].alias;
			parent.appendChild(element).appendChild(button).appendChild(xmark);
		}
	}

	for (let i = 0; i < global.gameplay.localTournamentInfo.player.length; i++) {
		const parent = document.querySelector(".tournament-alias-display-inside");
		const target = document.querySelector(".tournament-" + global.gameplay.localTournamentInfo.player[i].alias)
		
		if (!target) {
			const element = document.createElement('p');
			const button = document.createElement('button');
			button.setAttribute("type", "button")
			const xmark = document.createElement('i');
			xmark.classList.add("fa", "fa-xmark");
			xmark.setAttribute("tournament-identifier",global.gameplay.localTournamentInfo.player[i].alias);
			button.addEventListener("click", (e)=>{
				for (let i = 0; i < global.gameplay.localTournamentInfo.player.length; i++) {
					if (global.gameplay.localTournamentInfo.player.length && global.gameplay.localTournamentInfo.player[i] && global.gameplay.localTournamentInfo.player[i].alias === e.target.getAttribute("tournament-identifier"))
						global.gameplay.localTournamentInfo.player = [...global.gameplay.localTournamentInfo.player.slice(0, i),...global.gameplay.localTournamentInfo.player.slice(i + 1)];
				}
			})
			element.classList.add("tournament-" + global.gameplay.localTournamentInfo.player[i].alias)
			element.textContent = global.gameplay.localTournamentInfo.player[i].alias;
			parent.appendChild(element).appendChild(button).appendChild(xmark);
		}
	}
	document.getElementById("single-duration").value = global.gameplay.localSingleInfo.duration;
	document.getElementById("two-duration").value = global.gameplay.localTwoInfo.duration;
	document.getElementById("tournament-duration").value = global.gameplay.localTournamentInfo.duration;
	global.gameplay.localSingleInfo.powerUp? document.getElementById("single-powerup").checked=true:document.getElementById("single-powerup").checked=false;
	global.gameplay.localSingleInfo.ludicrious? document.getElementById("single-ludicrious").checked=true:document.getElementById("single-ludicrious").checked=false;
	global.gameplay.localTwoInfo.powerUp? document.getElementById("two-powerup").checked=true:document.getElementById("two-powerup").checked=false;
	global.gameplay.localTwoInfo.ludicrious? document.getElementById("two-ludicrious").checked=true:document.getElementById("two-ludicrious").checked=false;
	global.gameplay.localTournamentInfo.powerUp? document.getElementById("tournament-powerup").checked=true:document.getElementById("tournament-powerup").checked=false;
	global.gameplay.localTournamentInfo.ludicrious? document.getElementById("tournament-ludicrious").checked=true:document.getElementById("tournament-ludicrious").checked=false;
	
	const parentSingle = document.querySelector(".single-alias-display-inside")
	Array.from(parentSingle.children).forEach(child=>{
		if (global.gameplay.localSingleInfo.player.every(player=>{
			return "single-" + player.alias !== child.classList[0]
		}))
			parentSingle.removeChild(child);
	})
	const parentTwo = document.querySelector(".two-alias-display-inside")
	Array.from(parentTwo.children).forEach(child=>{
		if (global.gameplay.localTwoInfo.player.every(player=>{
			return "two-" + player.alias !== child.classList[0]
		}))
		parentTwo.removeChild(child);
	})
	const parentTournament = document.querySelector(".tournament-alias-display-inside")
	Array.from(parentTournament.children).forEach(child=>{
		if (global.gameplay.localTournamentInfo.player.every(player=>{
			return "tournament-" + player.alias !== child.classList[0]
		}))
		parentTournament.removeChild(child);
	})
	
	
	if (global.gameplay.gameStart && !global.gameplay.gameEnd) {
		//during gameStart and before gameEnd screen
		document.querySelector(".banner").classList.add("display-none");
		document.querySelector(".scoreboard").classList.remove("display-none");
		document.querySelector(".toggle-game").classList.remove("display-none");
		document.querySelector(".game-end-display-container").classList.add("display-none");
		global.gameplay.gameSummary? document.querySelector(".game-summary-container").classList.remove("display-none"):document.querySelector(".game-summary-container").classList.add("display-none");
		if (global.gameplay.cheat && !global.socket.spectate) {
			document.querySelector(".toggle-cheat").classList.remove("display-none");
			if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
				document.querySelector(".cheat-count").classList.remove("display-none");
				if (global.socket.gameInfo.playerGame[0].player.includes(global.gameplay.username))
					document.querySelector(".cheat-count").textContent = global.socket.gameInfo.playerGame[0].cheatCount;
				else 
					document.querySelector(".cheat-count").textContent = global.socket.gameInfo.playerGame[1].cheatCount;
			}
			else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament"){
				document.querySelector(".cheat-count").classList.remove("display-none");
				let tournamentPlayerIndex;
				if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias === global.gameplay.username)
					tournamentPlayerIndex = 0;
				else if (global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias === global.gameplay.username)
					tournamentPlayerIndex = 1;
				else
					tournamentPlayerIndex = -1;
				if (tournamentPlayerIndex !== -1)
					document.querySelector(".cheat-count").textContent = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][tournamentPlayerIndex].cheatCount;
				else
					document.querySelector(".toggle-cheat").classList.add("display-none");
			}
		}
		else
			document.querySelector(".toggle-cheat").classList.add("display-none");
		document.querySelector(".reset-game").classList.add("display-none");
		if (global.gameplay.local && global.gameplay.single) {
			document.querySelector(".scoreboard-one-name").textContent = global.gameplay.localSingleInfo.player[0].alias;
			document.querySelector(".scoreboard-one-score").textContent = global.gameplay.localSingleInfo.player[0].score;
			document.querySelector(".scoreboard-two-name").textContent = "A.I.";
			document.querySelector(".scoreboard-two-score").textContent = global.gameplay.computerScore;
			document.querySelector(".timer").textContent = global.gameplay.localSingleInfo.durationCount;
		}
		else if (global.gameplay.local && global.gameplay.two) {
			document.querySelector(".scoreboard-one-name").textContent = global.gameplay.localTwoInfo.player[0].alias;
			document.querySelector(".scoreboard-one-score").textContent = global.gameplay.localTwoInfo.player[0].score;
			document.querySelector(".scoreboard-two-name").textContent = global.gameplay.localTwoInfo.player[1].alias;
			document.querySelector(".scoreboard-two-score").textContent = global.gameplay.localTwoInfo.player[1].score;
			document.querySelector(".timer").textContent = global.gameplay.localTwoInfo.durationCount;
		}
		else if (global.gameplay.local && global.gameplay.tournament) {
			document.querySelector(".scoreboard-one-name").textContent = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].alias;
			document.querySelector(".scoreboard-one-score").textContent = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].score;
			document.querySelector(".scoreboard-two-name").textContent = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].alias;
			document.querySelector(".scoreboard-two-score").textContent = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].score;
			document.querySelector(".timer").textContent = global.gameplay.localTournamentInfo.durationCount;
			
		}
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
			document.querySelector('.multi-create-display-player-versus-one').innerHTML = ''
			document.querySelector('.multi-create-display-player-versus-two').innerHTML = ''
			document.querySelector(".scoreboard-one-name").textContent = global.socket.gameInfo.playerGame[0].teamName;
			document.querySelector(".scoreboard-one-score").textContent = global.socket.gameInfo.playerGame[0].score;
			document.querySelector(".scoreboard-two-name").textContent = global.socket.gameInfo.playerGame[1].teamName;
			document.querySelector(".scoreboard-two-score").textContent = global.socket.gameInfo.playerGame[1].score;
			document.querySelector(".timer").textContent = global.socket.gameInfo.durationCount;
			
		}
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
			document.querySelector('.multi-create-display-player-tournament').innerHTML = ''
			document.querySelector(".scoreboard-one-name").textContent = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias;
			document.querySelector(".scoreboard-one-score").textContent = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].score;
			document.querySelector(".scoreboard-two-name").textContent = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias;
			document.querySelector(".scoreboard-two-score").textContent = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].score;
			
			document.querySelector(".timer").textContent = global.socket.gameInfo.durationCount;
			
		}
		updateGameSummary();
	}
	else if (global.gameplay.gameStart && global.gameplay.gameEnd) {
		//for gameEnd screen
		updateGameSummary();

		document.querySelector(".game-summary-container").classList.remove("display-none");
		if (global.gameplay.single || global.gameplay.two || global.gameplay.tournament && 
			(global.gameplay.localTournamentInfo.currentRound === global.gameplay.localTournamentInfo.round - 1) || 
			!global.gameplay.local && global.socket.gameInfo.gameMode === "versus" ||
			(!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament" && global.socket.gameInfo.currentRound === global.socket.gameInfo.round - 1))
			document.querySelector(".game-end-display-container").classList.remove("display-none");
		document.querySelector(".banner").classList.add("display-none");
		document.querySelector(".scoreboard").classList.add("display-none");
		document.querySelector(".toggle-game").classList.add("display-none");
		if (global.gameplay.local || !global.gameplay.local && global.socket.gameInfo.gameMode === "versus")
			document.querySelector(".reset-game").classList.remove("display-none");
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament" && global.socket.gameInfo.mainClient === global.gameplay.username)
			document.querySelector(".reset-game").classList.remove("display-none");
		else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament" && global.socket.gameInfo.mainClient !== global.gameplay.username && global.socket.gameInfo.currentRound === global.socket.gameInfo.round - 1)
			document.querySelector(".reset-game").classList.remove("display-none");
		document.querySelector(".toggle-cheat").classList.add("display-none");
		document.querySelector(".cheat-count").classList.add("display-none");
	}
	else { 
		//for starting screen before gameStart
		document.querySelector(".game-summary-display").innerHTML = '';
		document.querySelector(".game-end-display-container").classList.add("display-none");
		if (global.ui.auth)
			document.querySelector(".banner").classList.remove("display-none");
		document.querySelector(".scoreboard").classList.add("display-none");
		document.querySelector(".toggle-game").classList.add("display-none");
		document.querySelector(".toggle-cheat").classList.add("display-none");
		document.querySelector(".game-summary-container").classList.add("display-none");
		
	}
	
	if (global.gameplay.pause) 
		document.querySelector(".pause").classList.remove("display-none");
	else 
		document.querySelector(".pause").classList.add("display-none");
	for (let i = 0; i < global.socket.gameLobbyInfo.length; i++) {
		const target = document.querySelector(".multi-lobby-game-container"+"."+global.socket.gameLobbyInfo[i].mainClient)
		if (!target) {
			const gameContainer = document.createElement('div');
			const gameOptionsContainer = document.createElement('div');
			const gameHost = document.createElement('h4');
			const playerNum = document.createElement('p');
			const status = document.createElement('p');
			const join = document.createElement('button');
			const spectate = document.createElement('button');
			gameContainer.classList.add('multi-lobby-game-container');
			gameContainer.classList.add(global.socket.gameLobbyInfo[i].mainClient);
			gameOptionsContainer.classList.add('multi-lobby-game-container-options');
			gameHost.classList.add("multi-lobby-game-header")
			gameHost.textContent = global.socket.gameLobbyInfo[i].mainClient + " " + global.socket.gameLobbyInfo[i].gameMode.toUpperCase();
			playerNum.classList.add("multi-game-player");
			playerNum.classList.add(global.socket.gameLobbyInfo[i].mainClient);
			playerNum.textContent = "Players: " + global.socket.gameLobbyInfo[i].player.length + " / " + global.paddle.maxPaddle;
			status.classList.add("multi-game-status");
			status.classList.add(global.socket.gameLobbyInfo[i].mainClient);
			status.textContent = "Not Live";
			join.setAttribute("type","button")
			join.classList.add("multi-game-join")
			join.classList.add(global.socket.gameLobbyInfo[i].mainClient)
			join.textContent = "JOIN";
			spectate.setAttribute("type","button")
			spectate.classList.add("multi-game-spectate")
			spectate.classList.add(global.socket.gameLobbyInfo[i].mainClient)
			spectate.textContent = "SPECTATE";
			join.addEventListener("click", (e)=>{
				if (global.gameplay.username !== e.target.classList[1]) {
					let currentGame;
					global.socket.gameLobbyInfo.forEach(game=>{
						if(game.mainClient === e.target.classList[1])
							currentGame = game;
					})
					if (currentGame.player.length < global.paddle.maxPaddle && !currentGame.player.includes(global.gameplay.username) && !currentGame.gameStart) {
						if (global.socket.gameLobbySocket && global.socket.gameLobbySocket.readyState === WebSocket.OPEN)
							global.socket.gameLobbySocket.send(JSON.stringify({mode:"join", mainClient:e.target.classList[1]}))
						createGameSocket(e.target.classList[1])
						global.socket.gameSocket.onopen = function() {
								global.ui.multiCreate = 1;
								global.ui.multiLobby = 0;
								if (global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN)
									global.socket.gameSocket.send(JSON.stringify({
										mode:"join",
									}))
							}
					}
				}
			})
			spectate.addEventListener("click", (e)=>{
				createGameSocket(e.target.classList[1])
				global.socket.gameSocket.onopen = function() {
					global.socket.spectate = 1;
					multiGameStart();
				}
			})
			gameOptionsContainer.appendChild(playerNum);
			gameOptionsContainer.appendChild(status);
			gameOptionsContainer.appendChild(join);
			gameOptionsContainer.appendChild(spectate);
			gameContainer.appendChild(gameHost)
			gameContainer.appendChild(gameOptionsContainer)
			document.querySelector('.multi-lobby-display').appendChild(gameContainer);
		}
		else {
			global.socket.gameLobbyInfo[i].player.length < global.paddle.maxPaddle? document.querySelector(".multi-game-join." + global.socket.gameLobbyInfo[i].mainClient).disabled = false :document.querySelector(".multi-game-join." + global.socket.gameLobbyInfo[i].mainClient).disabled = true;
			if (global.socket.gameLobbyInfo[i].gameStart) {
				document.querySelector(".multi-game-spectate." + global.socket.gameLobbyInfo[i].mainClient).disabled = false;
				document.querySelector(".multi-game-join." + global.socket.gameLobbyInfo[i].mainClient).disabled = true;
				document.querySelector(".multi-game-status." + global.socket.gameLobbyInfo[i].mainClient).textContent = "Live";
				document.querySelector(".multi-game-status." + global.socket.gameLobbyInfo[i].mainClient).classList.add("live");
			}
			else {
				document.querySelector(".multi-game-spectate." + global.socket.gameLobbyInfo[i].mainClient).disabled = true;
				document.querySelector(".multi-game-join." + global.socket.gameLobbyInfo[i].mainClient).disabled = false;
				document.querySelector(".multi-game-status." + global.socket.gameLobbyInfo[i].mainClient).textContent = "Not Live";
				document.querySelector(".multi-game-status." + global.socket.gameLobbyInfo[i].mainClient).classList.remove("live");
			}
			document.querySelector(".multi-game-player." + global.socket.gameLobbyInfo[i].mainClient).textContent = "Players: " + global.socket.gameLobbyInfo[i].player.length + " / " + global.paddle.maxPaddle;
				

		}
	}
	const multiLobbyDisplay = document.querySelector(".multi-lobby-display")
	Array.from(multiLobbyDisplay.children).forEach(child=>{
		if (global.socket.gameLobbyInfo.every(game=>{
			return game.mainClient !== child.classList[1]
		}))
		multiLobbyDisplay.removeChild(child);
	})
	if (global.socket.gameInfo.mainClient) {
		document.querySelector(".multi-create-mainClient").textContent = global.socket.gameInfo.mainClient + " " + global.socket.gameInfo.gameMode.toUpperCase();
		if (global.socket.gameInfo.gameMode == "versus") {
			const playerArrayOne = global.socket.gameInfo.playerGame[0].player
			const playerArrayTwo = global.socket.gameInfo.playerGame[1].player
			
			const versusMultiCreateDisplayPlayerOne = document.querySelector(".multi-create-display-player-versus-one")
			Array.from(versusMultiCreateDisplayPlayerOne.children).forEach(child=>{
				
				if (playerArrayOne.every(player=>{
					return player !== child.classList[1]
				}))
					versusMultiCreateDisplayPlayerOne.removeChild(child);
			})
			const versusMultiCreateDisplayPlayerTwo = document.querySelector(".multi-create-display-player-versus-two")
			Array.from(versusMultiCreateDisplayPlayerTwo.children).forEach(child=>{
				if (playerArrayTwo.every(player=>{
					return player !== child.classList[1]
				}))
					versusMultiCreateDisplayPlayerTwo.removeChild(child);
			})

			playerArrayOne.forEach(playerList=>{
				const target = document.querySelector(".multi-create-versus." + playerList)
				if (!target) {
					
					const player = document.createElement('p');
					const ready = document.createElement('span');
					ready.textContent = "READY";
					ready.classList.add("ready");
					ready.classList.add("multi-ready-versus");
					ready.classList.add(playerList);
					ready.classList.add("display-none");
					player.textContent = playerList;
					player.classList.add("multi-create-versus")
					player.classList.add(playerList)
					player.appendChild(ready);
					document.querySelector('.multi-create-display-player-versus-one').appendChild(player)
				}
			})
			
			playerArrayTwo.forEach(playerList=>{
				const target = document.querySelector(".multi-create-versus." + playerList)
				if (!target) {
					const player = document.createElement('p');
					const ready = document.createElement('span');
					ready.textContent = "READY";
					ready.classList.add("ready");
					ready.classList.add("multi-ready-versus");
					ready.classList.add(playerList);
					ready.classList.add("display-none");
					player.textContent = playerList;
					player.classList.add("multi-create-versus")
					player.classList.add(playerList)
					player.appendChild(ready);
					document.querySelector('.multi-create-display-player-versus-two').appendChild(player)
				}
			})
			
			
			const playerArray = Object.keys(global.socket.gameInfo.player)
			playerArray.forEach(player=>{
				global.socket.gameInfo.player[player].ready? document.querySelector(".multi-ready-versus."+player).classList.remove("display-none"):document.querySelector(".multi-ready-versus."+player).classList.add("display-none")
			})
			if ((playerArray.every(player=>{
				return global.socket.gameInfo.player[player].ready === 1
			})) && global.socket.gameInfo.playerGame[0].player.length>0 && global.socket.gameInfo.playerGame[1].player.length>0)
				document.querySelector(".multi-start-game").classList.add("ready")
			else 
				document.querySelector(".multi-start-game").classList.remove("ready")
		}
		else {
			const playerArray = Object.keys(global.socket.gameInfo.player)
			const tournamentMultiCreateDisplayPlayer = document.querySelector(".multi-create-display-player-tournament")
			for (let i = 0; i < playerArray.length; i++) {
				const target = document.querySelector(".multi-create-tournament."+global.socket.gameInfo.player[playerArray[i]].name)
				if (!target) {
					const player = document.createElement('p');
					const ready = document.createElement('span');
					ready.textContent = "READY";
					ready.classList.add("ready");
					ready.classList.add("multi-ready-tournament")
					ready.classList.add(global.socket.gameInfo.player[playerArray[i]].name);
					ready.classList.add("display-none");
					player.textContent = global.socket.gameInfo.player[playerArray[i]].name;
					player.classList.add("multi-create-tournament")
					player.classList.add(global.socket.gameInfo.player[playerArray[i]].name)
					player.appendChild(ready);
					document.querySelector('.multi-create-display-player-tournament').appendChild(player)
				}
				global.socket.gameInfo.player[playerArray[i]].ready? document.querySelector(".multi-ready-tournament."+global.socket.gameInfo.player[playerArray[i]].name).classList.remove("display-none"):document.querySelector(".multi-ready-tournament." + global.socket.gameInfo.player[playerArray[i]].name).classList.add("display-none")
			}
			Array.from(tournamentMultiCreateDisplayPlayer.children).forEach(child=>{
				if (playerArray.every(player=>{
					return player !== child.classList[1]
				}))
				tournamentMultiCreateDisplayPlayer.removeChild(child);
			})
			if (playerArray.every(player=>{
				return global.socket.gameInfo.player[player].ready === 1
			}))
				document.querySelector(".multi-matchFix").classList.add("ready")
			else 
				document.querySelector(".multi-matchFix").classList.remove("ready")
		}
		
		if (global.socket.gameInfo.mainClient === global.gameplay.username) {
			document.getElementById("multi-create-duration").disabled = false;
			document.getElementById("multi-create-ludicrious").disabled = false;
			document.getElementById("multi-create-powerUp").disabled = false;
			
		}
		else {
			document.getElementById("multi-create-duration").disabled = true;
			document.getElementById("multi-create-ludicrious").disabled = true;
			document.getElementById("multi-create-powerUp").disabled = true;
		}
		document.getElementById("multi-create-duration").value = global.socket.gameInfo.duration;
		global.socket.gameInfo.ludicrious? document.getElementById("multi-create-ludicrious").checked=true:document.getElementById("multi-create-ludicrious").checked=false;
		global.socket.gameInfo.powerUp? document.getElementById("multi-create-powerUp").checked=true:document.getElementById("multi-create-powerUp").checked=false;
		if (global.socket.ready) 
			document.querySelector(".multi-ready-game").classList.add("ready")
		else
			document.querySelector(".multi-ready-game").classList.remove("ready")
			
		if (global.socket.gameInfo.gameMode === "versus") {
			document.querySelector(".multi-create-display-player-versus-container").classList.remove("display-none");
			document.querySelector(".multi-create-display-player-tournament").classList.add("display-none");
		}
		else {
			document.querySelector(".multi-create-display-player-versus-container").classList.add("display-none");
			document.querySelector(".multi-create-display-player-tournament").classList.remove("display-none");
		}
		global.socket.spectate? document.querySelector(".nav-pause").classList.add("display-none"):document.querySelector(".nav-pause").classList.remove("display-none");
	}
	
	global.socket.spectate? document.querySelector(".spectate-container").classList.remove("display-none"):document.querySelector(".spectate-container").classList.add("display-none")
}

function processShakeEffect() {
	const arena3D = global.arena3D;
	if (global.powerUp.shake.enable && !global.gameplay.pause) {
		const randomNum = Math.floor(Math.random() * 6);
		if (randomNum === 0)
			arena3D.position.x += 1 * global.powerUp.shake.multiplier;
		else if (randomNum === 1)
			arena3D.position.x -= 1 * global.powerUp.shake.multiplier;
		else if (randomNum === 2)
			arena3D.position.y += 1 * global.powerUp.shake.multiplier;
		else if (randomNum === 3)
			arena3D.position.y -= 1 * global.powerUp.shake.multiplier;
		else if (randomNum === 4)
			arena3D.position.z += 1 * global.powerUp.shake.multiplier;
		else if (randomNum === 5)
			arena3D.position.z -= 1 * global.powerUp.shake.multiplier;
	}
	else 
		arena3D.position.set(0,0,0);
}

function processArenaRotateY() {
	if (global.gameplay.initRotateY && !global.gameplay.pause && !global.gameplay.gameEnd) {
		global.arena3D.position.z += global.arena.depth;
		global.arena3D.rotation.y += global.gameplay.rotationY;
		global.powerUp.mesh.forEach(mesh=>{
			mesh.rotation.y = -global.arena3D.rotation.y;
		})
		global.sphere.sphereMesh.forEach(sphereMesh=>{
			sphereMesh.rotation.y = -global.arena3D.rotation.y;
		})
		global.arena3D.position.z -= global.arena.depth;
	}
}

function processArenaRotateX() {
	if (global.gameplay.initRotateX && !global.gameplay.pause && !global.gameplay.gameEnd) {
		global.arena3D.position.z += global.arena.depth;
		global.arena3D.rotation.x += global.gameplay.rotationX;
		global.powerUp.mesh.forEach(mesh=>{
			mesh.rotation.x = -global.arena3D.rotation.x;
		})
		global.sphere.sphereMesh.forEach(sphereMesh=>{
			sphereMesh.rotation.x = -global.arena3D.rotation.x;
		})
		
		global.arena3D.position.z -=global.arena.depth;
	}
}

function processFrameTimer() {
	if (global.gameplay.gameStart && !global.gameplay.pause && !global.gameplay.gameEnd) {
		//roundStart shadow issue actions for ALL CLIENTS
		if (global.gameplay.roundStart === 0) {
			global.pointLight.castShadow = false;
			global.gameplay.shadowFrame = 0;
		}
		if (global.gameplay.roundStart === 1)
			global.gameplay.shadowFrame++;
		if (global.gameplay.shadowFrame === global.gameplay.shadowFrameLimit)
			global.pointLight.castShadow = true;
	
		// Below gameplay delay and powerup executed by mainClient
		if (global.gameplay.local || !global.gameplay.local && global.gameplay.username === global.socket.gameInfo.mainClient) {
			if (global.gameplay.roundStart === 0) 
				global.gameplay.roundStartFrame++;
			
			if (global.gameplay.roundStartFrame === global.gameplay.roundStartFrameLimit) {
				global.gameplay.roundStart = 1;
				global.gameplay.roundStartFrame = 0;
			}
			// powerup timer
			if (global.powerUp.enable) {
				if (global.powerUp.meshProperty.every(meshProperty=>{
					return !meshProperty.visible;
				}))
					global.powerUp.durationFrame++;
				if (global.powerUp.durationFrame >= global.powerUp.durationFrameLimit) {
					resetPowerUp();
					global.powerUp.durationFrame = 0;
				}
			}
		}
	}
}



function reduceTime(info) {
	const [minute, second] = info.durationCount.split(':')
	const date = new Date(1970, 0, 1, 0, minute, second);
	const newDate = date.getTime() - 1000;
	date.setTime(newDate);
	info.durationCount = date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
	//set ludicrious mode
	if (info.ludicrious) {
		if (date.getMinutes() < global.gameplay.ludicriousYminuteUpper && date.getMinutes() >= global.gameplay.ludicriousYminuteLower 
		&& date.getSeconds() < global.gameplay.ludicriousYsecondUpper  && date.getSeconds() >= global.gameplay.ludicriousYsecondLower) {
			global.gameplay.initRotateY = 1;
			global.gameplay.initRotateX = 0;
			global.gameplay.ludicrious = 1;
		}
		if (date.getMinutes() < global.gameplay.ludicriousXminuteUpper && date.getMinutes() >= global.gameplay.ludicriousXminuteLower 
			&& date.getSeconds() < global.gameplay.ludicriousXsecondUpper  && date.getSeconds() >= global.gameplay.ludicriousXsecondLower){
				global.gameplay.initRotateY = 0;
				global.gameplay.initRotateX = 1;
				global.gameplay.ludicrious = 1;
		}
		if (date.getMinutes() < global.gameplay.ludicriousYXminuteUpper && date.getMinutes() >= global.gameplay.ludicriousYXminuteLower 
			&& date.getSeconds() < global.gameplay.ludicriousYXsecondUpper  && date.getSeconds() >= global.gameplay.ludicriousYXsecondLower){
				global.gameplay.initRotateY = 1;
				global.gameplay.initRotateX = 1;
				global.gameplay.ludicrious = 1;
		}
	}
	if (minute === '00' && second === '01') {
		global.gameplay.gameEnd = 1;
		populateWinner();
		if (!global.gameplay.local && global.socket.gameInfo.mainClient === global.gameplay.username && global.socket.gameSocket && global.socket.gameSocket.readyState === WebSocket.OPEN) {
			global.socket.gameSocket.send(JSON.stringify({
				mode:"gameEnd",
				gameInfo:global.socket.gameInfo
			}));
		}
	}
}

function processCountDown(frameTimer) {
	if (global.gameplay.gameStart && !global.gameplay.pause && !global.gameplay.gameEnd) {
		if (global.gameplay.local && global.gameplay.single) {
			if (frameTimer.now - frameTimer.prev > 0) {
				reduceTime(global.gameplay.localSingleInfo)
				frameTimer.prev = frameTimer.now;
			}
		}
		else if (global.gameplay.local && global.gameplay.two) {
			if (frameTimer.now - frameTimer.prev > 0) {
				reduceTime(global.gameplay.localTwoInfo)
				frameTimer.prev = frameTimer.now;
			}
		}
		else if (global.gameplay.local && global.gameplay.tournament) {
			if (frameTimer.now - frameTimer.prev > 0) {
				reduceTime(global.gameplay.localTournamentInfo)
				frameTimer.prev = frameTimer.now;
			}
		}
		else if (!global.gameplay.local && global.socket.gameInfo.mainClient === global.gameplay.username && global.socket.gameInfo.gameMode === "versus") {
			if (frameTimer.now - frameTimer.prev > 0) {
				reduceTime(global.socket.gameInfo)
				frameTimer.prev = frameTimer.now;
			}
		}
		else if (!global.gameplay.local && global.socket.gameInfo.mainClient === global.gameplay.username && global.socket.gameInfo.gameMode === "tournament") {
			if (frameTimer.now - frameTimer.prev > 0) {
				reduceTime(global.socket.gameInfo)
				frameTimer.prev = frameTimer.now;
			}
		}
	}
}



export { processPaddle, processSphere, processCamera, processPowerUp, processBackground, processUI, processShakeEffect, processArenaRotateY, processArenaRotateX, processFrameTimer, processCountDown }