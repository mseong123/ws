import * as THREE from 'https://threejs.org/build/three.module.js';
import {processGame,movePaddle,keyBinding,resetPowerUp} from './gameplay.js';
import {keyBindingMultiplayer,createGameSocket, processSendLiveGameData, multiGameStart} from './multiplayer.js';
import {keyBindingProfile} from './profile.js';
import {keyBindingChat} from './chat.js';
import {createPowerUp,createFirstHalfCircleGeometry,createSecondHalfCircleGeometry} from './powerup.js';
import {init} from './init.js'
import { global } from './init.js';

function resizeRendererToDisplaySize( renderer ) {

	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if ( needResize ) {
		renderer.setSize( width, height, false );
	}
	return needResize;
}

function createArenaMesh(arena3D) {
	const arenaMaterial = new THREE.LineBasicMaterial( { color: global.arena.color } );
	
	const arenaMesh = [];
	for (let i = 0; i < global.arena.thickness; i++) {
		const arenaGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry( (global.clientWidth + i) / global.arena.widthDivision,
		(global.clientWidth + i) / global.arena.aspect / global.arena.widthDivision , (global.clientWidth + 1) / global.arena.aspect));
		arenaMesh.push(new THREE.LineSegments( arenaGeometry, arenaMaterial ));
		arena3D.add(arenaMesh[i]);
	}
	global.arenaMesh = arenaMesh;
}

function createPowerUpCircle(sphereMesh) {
	const firstHalfCircleGeometry = createFirstHalfCircleGeometry(global.sphere.circleRadius);
	const SecondHalfCircleGeometry = createSecondHalfCircleGeometry(global.sphere.circleRadius);
	const circleMaterial = new THREE.LineBasicMaterial( { color: "#fff", transparent:true, opacity:1});
	const firstHalfCircleMesh = new THREE.Line( firstHalfCircleGeometry, circleMaterial);
	const secondHalfCircleMesh = new THREE.Line( SecondHalfCircleGeometry, circleMaterial);
	firstHalfCircleMesh.visible = false;
	secondHalfCircleMesh.visible = false;
	sphereMesh.add(firstHalfCircleMesh);
	sphereMesh.add(secondHalfCircleMesh);

}

export function createSphereMesh(arena3D) {
	const sphereGeometry = new THREE.SphereGeometry( global.sphere.radius, global.sphere.widthSegments, global.sphere.heightSegments );
	const sphereMaterial = new THREE.MeshPhongMaterial( { color: global.sphere.color, emissive: global.sphere.color, shininess:global.sphere.shininess, transparent:true, opacity:1 } );
	
	for (let i = 0; i < global.powerUp.ultimate.count; i++) {
		const sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
		const sphereMeshProperty = {
			positionX:0,
			positionY:0,
			positionZ:0,
			velocityX:global.sphere.velocityX,
			velocityY:global.sphere.velocityY,
			velocityZ:global.sphere.velocityZ,
			opacity:1,
			visible:false,
			circleVisible:false,
			circleColor:"#fff",
			circleOpacity:1,
		}
		if (i === 0)
			sphereMeshProperty.visible = true;
		//create powerup surrounding circle timer
		createPowerUpCircle(sphereMesh);
		sphereMesh.castShadow=true;
		global.sphere.sphereMesh.push(sphereMesh);
		global.sphere.sphereMeshProperty.push(sphereMeshProperty);
		arena3D.add(sphereMesh);
	}
}

function createCamera() {
	const camera = new THREE.PerspectiveCamera( global.camera.fov, global.arena.aspect, global.camera.near, global.camera.far );
	camera.position.z = global.camera.positionZ;
	// camera.position.y = global.arena.width;
	// 	camera.rotation.x = -Math.PI/5
	return camera;
}

function createPaddleMesh(arena3D) {
	const colorPalette = global.paddle.color[global.gameplay.backgroundIndex];
	const paddleGeometry = new THREE.BoxGeometry(global.paddle.defaultWidth, global.paddle.defaultHeight, global.paddle.thickness )
	const paddlesProperty = global.paddle.paddlesProperty;
	for (let i = 0; i < global.paddle.maxPaddle; i++) {
		const paddleMaterial = new THREE.MeshPhongMaterial( { color: colorPalette[i], emissive: colorPalette[i], transparent:true, opacity:global.paddle.opacity });
		const paddleMeshPropertyTemplate = {
			visible:false,
			positionX:0,
			positionY:0,
			positionZ:0,
			largePaddle:0,
			invisibility:0,
			width:global.paddle.defaultWidth,
			height:global.paddle.defaultHeight
		}
		const paddleMesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
		paddleMesh.castShadow = true;
		global.paddle.paddles.push(paddleMesh);
		paddlesProperty.push(paddleMeshPropertyTemplate);
		arena3D.add(paddleMesh);
	}
	//render initial paddle
	paddlesProperty[0].positionX = 0;
	paddlesProperty[0].positionY = 0;
	paddlesProperty[0].positionZ = (global.clientWidth / global.arena.aspect / 2) - (global.paddle.thickness * global.paddle.distanceFromEdgeModifier);
	paddlesProperty[0].visible = true;
	paddlesProperty[1].positionX = 0;
	paddlesProperty[1].positionY = 0;
	paddlesProperty[1].positionZ = -(global.clientWidth / global.arena.aspect / 2) + (global.paddle.thickness * global.paddle.distanceFromEdgeModifier);
	paddlesProperty[1].visible = true;

}

function createDirectionalLight(arena3D) {
	const directionalLight = new THREE.DirectionalLight(global.directionalLight.color, global.directionalLight.intensity);
	directionalLight.position.set(global.directionalLight.positionX,global.directionalLight.positionY, global.directionalLight.positionZ);
	global.directionalLight = directionalLight;
	arena3D.add(directionalLight);
}

function createPointLight(arena3D) {
	const pointLight = new THREE.PointLight(global.pointLight.color , global.pointLight.intensity, global.pointLight.distance);
	global.pointLight = pointLight;
	arena3D.add(pointLight);
}

function createShadowPlanes(arena3D) {
	const geometrySides = new THREE.PlaneGeometry( global.shadowPlane.sideWidth, global.shadowPlane.sideHeight );
	const geometryTopBottom = new THREE.PlaneGeometry( global.shadowPlane.TopBottomWidth, global.shadowPlane.sideHeight );
	const material = new THREE.ShadowMaterial({side:THREE.DoubleSide});
	material.opacity = global.shadowPlane.opacity;
	const shadowPlanes = [];

	//sides
	for (let i = 0; i < 2; i++) {
		const plane = new THREE.Mesh( geometrySides, material );
		plane.rotateX( Math.PI /2 );
		plane.rotateY( Math.PI /2 );
		plane.receiveShadow = true;
		arena3D.add( plane );
		shadowPlanes[i] = plane;
	}
	shadowPlanes[0].position.set(-global.clientWidth / global.arena.widthDivision / 2, 0, 0);
	shadowPlanes[1].position.set(global.clientWidth / global.arena.widthDivision / 2, 0, 0);
	//top bottom
	for (let i = 2; i < 4; i++) {
		const plane = new THREE.Mesh( geometryTopBottom, material );
		plane.rotateX( Math.PI /2 );
		plane.receiveShadow = true;
		arena3D.add( plane );
		shadowPlanes[i] = plane;
	}
	shadowPlanes[2].position.set(0, global.clientWidth / global.arena.aspect/ global.arena.widthDivision / 2, 0);
	shadowPlanes[3].position.set(0,-global.clientWidth / global.arena.aspect/ global.arena.widthDivision / 2, 0);
	global.shadowPlanes = shadowPlanes;
}

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

function updateGameSummary() {
	const parent = document.querySelector(".game-summary-display");
	if (global.gameplay.local && global.gameplay.single) {
		if (parent.children.length === 0) {
			const roundSpan = document.createElement("span");
			const singleName = document.createElement("span");
			const singleScore = document.createElement("span");
			const AIname = document.createElement("span");
			const AIscore = document.createElement("span");
			singleName.textContent = global.gameplay.localSingleInfo.player[0].alias;
			singleScore.textContent = global.gameplay.localSingleInfo.player[0].score;
			singleScore.classList.add('single-'+global.gameplay.localSingleInfo.player[0].alias + "-score")
			AIname.textContent = "A.I."
			AIscore.textContent = global.gameplay.computerScore;
			AIscore.classList.add("AI-score")
			const roundDiv = document.createElement("div");
			const singleDiv = document.createElement("div");
			const separatorDiv = document.createElement("div");
			const AIDiv = document.createElement("div");
			roundDiv.appendChild(roundSpan);
			singleDiv.appendChild(singleName);
			singleDiv.appendChild(singleScore);
			separatorDiv.classList.add("separator")
			AIDiv.appendChild(AIname)
			AIDiv.appendChild(AIscore);
			const containerDiv = document.createElement("div");
			containerDiv.classList.add("game-summary-items");
			containerDiv.appendChild(roundDiv);
			containerDiv.appendChild(singleDiv);
			containerDiv.appendChild(separatorDiv);
			containerDiv.appendChild(AIDiv);
			parent.appendChild(containerDiv);
		}
		else {
			document.querySelector(".single-" + global.gameplay.localSingleInfo.player[0].alias + "-score").textContent = global.gameplay.localSingleInfo.player[0].score;
			document.querySelector(".AI-score").textContent = global.gameplay.computerScore;
		}
		if (global.gameplay.localSingleInfo.player[0].winner)
			document.querySelector(".game-summary-display").children[0].children[1].classList.add("won");
		else if (global.gameplay.computerWinner)
			document.querySelector(".game-summary-display").children[0].children[3].classList.add("won");
		
	}
	else if (global.gameplay.local && global.gameplay.two) {
		if (parent.children.length === 0) {
			const parent = document.querySelector(".game-summary-display");
			const roundSpan = document.createElement("span");
			const twoFirstName = document.createElement("span");
			const twoFirstScore = document.createElement("span");
			const twoSecondName = document.createElement("span");
			const twoSecondScore = document.createElement("span");
			twoFirstName.textContent = global.gameplay.localTwoInfo.player[0].alias;
			twoFirstScore.textContent = global.gameplay.localTwoInfo.player[0].score;
			twoFirstScore.classList.add("two-" + global.gameplay.localTwoInfo.player[0].alias + "-score")
			twoSecondName.textContent = global.gameplay.localTwoInfo.player[1].alias;
			twoSecondScore.textContent = global.gameplay.localTwoInfo.player[1].score;
			twoSecondScore.classList.add("two-" + global.gameplay.localTwoInfo.player[1].alias + "-score")
			const roundDiv = document.createElement("div");
			const twoFirstDiv = document.createElement("div");
			const separatorDiv = document.createElement("div");
			const twoSecondDiv = document.createElement("div");
			roundDiv.append(roundSpan);
			twoFirstDiv.appendChild(twoFirstName);
			twoFirstDiv.appendChild(twoFirstScore);
			separatorDiv.classList.add("separator")
			twoSecondDiv.appendChild(twoSecondName)
			twoSecondDiv.appendChild(twoSecondScore);
			const containerDiv = document.createElement("div");
			containerDiv.classList.add("game-summary-items")
			containerDiv.appendChild(roundDiv);
			containerDiv.appendChild(twoFirstDiv);
			containerDiv.appendChild(separatorDiv);
			containerDiv.appendChild(twoSecondDiv);
			parent.appendChild(containerDiv);
		}
		else {
			document.querySelector(".two-" + global.gameplay.localTwoInfo.player[0].alias + "-score").textContent = global.gameplay.localTwoInfo.player[0].score;
			document.querySelector(".two-" + global.gameplay.localTwoInfo.player[1].alias + "-score").textContent = global.gameplay.localTwoInfo.player[1].score;
		}
		if (global.gameplay.localTwoInfo.player[0].winner)
			document.querySelector(".game-summary-display").children[0].children[1].classList.add("won");
		else if (global.gameplay.localTwoInfo.player[1].winner)
			document.querySelector(".game-summary-display").children[0].children[3].classList.add("won");
	}
	else if (global.gameplay.local && global.gameplay.tournament) {
		if (parent.children.length === 0) {
			global.gameplay.localTournamentInfo.playerGame.forEach((playerGame,idx)=>{
				const roundSpan = document.createElement("span");
				const firstName = document.createElement("span");
				const firstScore = document.createElement("span");
				const secondName = document.createElement("span");
				const secondScore = document.createElement("span");
				roundSpan.textContent = "GAME " + (idx + 1);
				firstName.textContent = playerGame[0].alias;
				firstScore.textContent = playerGame[0].score;
				firstScore.setAttribute("data-player","tournament-" + playerGame[0].alias + '-' + idx + "-score")
				secondName.textContent = playerGame[1].alias;
				secondScore.textContent = playerGame[1].score;
				secondScore.setAttribute("data-player", "tournament-" + playerGame[1].alias + '-' + idx + "-score")
				const roundDiv = document.createElement("div");
				const firstDiv = document.createElement("div");
				const separatorDiv = document.createElement("div");
				const secondDiv = document.createElement("div");
				roundDiv.append(roundSpan);
				firstDiv.appendChild(firstName);
				firstDiv.appendChild(firstScore);
				separatorDiv.classList.add("separator")
				secondDiv.appendChild(secondName)
				secondDiv.appendChild(secondScore);
				const containerDiv = document.createElement("div");
				containerDiv.classList.add("game-summary-items")
				containerDiv.appendChild(roundDiv);
				containerDiv.appendChild(firstDiv);
				containerDiv.appendChild(separatorDiv);
				containerDiv.appendChild(secondDiv);
				parent.appendChild(containerDiv);
			})
		}
		else {
			global.gameplay.localTournamentInfo.playerGame.forEach((playerGame,idx)=>{
				parent.children[idx].children[1].children[0].textContent = playerGame[0].alias;
				parent.children[idx].children[3].children[0].textContent = playerGame[1].alias;
				parent.children[idx].children[1].children[1].setAttribute("data-player","tournament-" + playerGame[0].alias + '-' + idx + "-score")
				parent.children[idx].children[3].children[1].setAttribute("data-player","tournament-" + playerGame[1].alias + '-' + idx + "-score")
				if (playerGame[0].winner) {
					document.querySelector(".game-summary-display").children[idx].children[1].classList.add("won");
				}
					
				else if (playerGame[1].winner)
					document.querySelector(".game-summary-display").children[idx].children[3].classList.add("won");
			})
			document.querySelector('[data-player='+'"tournament-' + global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].alias + "-" +global.gameplay.localTournamentInfo.currentRound + '-score"]').textContent = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].score;
			document.querySelector('[data-player='+'"tournament-' + global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].alias + "-" +global.gameplay.localTournamentInfo.currentRound + '-score"]').textContent = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].score;
		}
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
		if (parent.children.length === 0) {
			global.socket.gameInfo.playerGame.forEach((playerGame,idx)=>{
				const headerContainer = document.createElement("h4");
				const teamName = document.createElement("span");
				const teamScore = document.createElement("span");
				teamName.textContent = playerGame.teamName;
				teamScore.textContent = playerGame.score;
				teamScore.classList.add('versus-'+playerGame.teamName + "-score")
				headerContainer.appendChild(teamName);
				headerContainer.appendChild(teamScore);
				headerContainer.classList.add("game-summary-versus-header");
				const containerDiv = document.createElement("div");
				containerDiv.classList.add("game-summary-versus-items");
				containerDiv.appendChild(headerContainer);
				playerGame.player.forEach((player, idx1)=>{
					const playerContainer = document.createElement("div");
					const playerDisplay = document.createElement("p");
					const playerColor= document.createElement("p");
					playerContainer.classList.add("game-summary-versus-player");
					playerDisplay.textContent = player;
					playerColor.classList.add("game-summary-versus-color");
					playerColor.classList.add(player);
					if (idx === 0)
						playerColor.style.backgroundColor = global.paddle.color[global.gameplay.backgroundIndex][idx1];
					else
						playerColor.style.backgroundColor = global.paddle.color[global.gameplay.backgroundIndex][idx1 + global.socket.gameInfo.playerGame[0].player.length];
					playerContainer.append(playerDisplay);
					playerContainer.append(playerColor);
					containerDiv.append(playerContainer);
				})
				parent.appendChild(containerDiv);
			})
		}
		else {
			document.querySelector(".versus-" + global.socket.gameInfo.playerGame[0].teamName + "-score").textContent = global.socket.gameInfo.playerGame[0].score;
			document.querySelector(".versus-" + global.socket.gameInfo.playerGame[1].teamName + "-score").textContent = global.socket.gameInfo.playerGame[1].score;
			global.socket.gameInfo.playerGame.forEach((playerGame,idx)=>{
				playerGame.player.forEach((player, idx1)=>{
					if (idx === 0)
						document.querySelector(".game-summary-versus-color."+player).style.backgroundColor = global.paddle.color[global.gameplay.backgroundIndex][idx1];
					else
						document.querySelector(".game-summary-versus-color."+player).style.backgroundColor = global.paddle.color[global.gameplay.backgroundIndex][idx1 + global.socket.gameInfo.playerGame[0].player.length];
				})
			})
		}
		if (global.socket.gameInfo.playerGame[0].winner)
			document.querySelector(".game-summary-display").children[0].children[0].classList.add("won");
		else if (global.socket.gameInfo.playerGame[1].winner)
			document.querySelector(".game-summary-display").children[1].children[0].classList.add("won");
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode ==="tournament") {
		if (parent.children.length === 0) {
			global.socket.gameInfo.playerGame.forEach((playerGame,idx)=>{
				const roundSpan = document.createElement("span");
				const firstName = document.createElement("span");
				const firstScore = document.createElement("span");
				const secondName = document.createElement("span");
				const secondScore = document.createElement("span");
				roundSpan.textContent = "Game " + (idx + 1);
				firstName.textContent = playerGame[0].alias;
				firstScore.textContent = playerGame[0].score;
				firstScore.setAttribute("data-player","multi-tournament-" + playerGame[0].alias + '-' + idx + "-score")
				secondName.textContent = playerGame[1].alias;
				secondScore.textContent = playerGame[1].score;
				secondScore.setAttribute("data-player", "multi-tournament-" + playerGame[1].alias + '-' + idx + "-score")
				const roundDiv = document.createElement("div");
				const firstDiv = document.createElement("div");
				const separatorDiv = document.createElement("div");
				const secondDiv = document.createElement("div");
				roundDiv.append(roundSpan);
				firstDiv.appendChild(firstName);
				firstDiv.appendChild(firstScore);
				separatorDiv.classList.add("separator")
				secondDiv.appendChild(secondName)
				secondDiv.appendChild(secondScore);
				const containerDiv = document.createElement("div");
				containerDiv.classList.add("game-summary-items")
				containerDiv.appendChild(roundDiv);
				containerDiv.appendChild(firstDiv);
				containerDiv.appendChild(separatorDiv);
				containerDiv.appendChild(secondDiv);
				parent.appendChild(containerDiv);
			})
		}
		else {
			global.socket.gameInfo.playerGame.forEach((playerGame,idx)=>{
				parent.children[idx].children[1].children[0].textContent = playerGame[0].alias;
				parent.children[idx].children[3].children[0].textContent = playerGame[1].alias;
				parent.children[idx].children[1].children[1].setAttribute("data-player","multi-tournament-" + playerGame[0].alias + '-' + idx + "-score")
				parent.children[idx].children[3].children[1].setAttribute("data-player","multi-tournament-" + playerGame[1].alias + '-' + idx + "-score")
				if (playerGame[0].winner) {
					document.querySelector(".game-summary-display").children[idx].children[1].classList.add("won");
				}
				else if (playerGame[1].winner)
					document.querySelector(".game-summary-display").children[idx].children[3].classList.add("won");
				})
			document.querySelector('[data-player='+'"multi-tournament-' + global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias + "-" +global.socket.gameInfo.currentRound + '-score"]').textContent = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].score;
			document.querySelector('[data-player='+'"multi-tournament-' + global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias + "-" +global.socket.gameInfo.currentRound + '-score"]').textContent = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].score;
		}
	}
}

export function updateMatchFix() {
	const parent = document.querySelector(".multi-tournament-matchFix-display");

	if (global.socket.gameInfo.mainClient) {
		if (parent.children.length === 0) {
			global.socket.gameInfo.playerGame.forEach((playerGame,idx)=>{
				const roundSpan = document.createElement("span");
				const firstName = document.createElement("span");
				const firstReady = document.createElement("span");
				const secondName = document.createElement("span");
				const secondReady = document.createElement("span");
				roundSpan.textContent = "Game " + (idx + 1);
				firstName.textContent = playerGame[0].alias;
				firstReady.textContent = "READY"
				firstReady.classList.add("ready");
				firstReady.classList.add("multi-ready-matchfix");
				firstReady.classList.add("display-none");
				firstReady.setAttribute("data-player","multi-matchFix-" + playerGame[0].alias + "-ready")
				secondName.textContent = playerGame[1].alias;
				secondReady.textContent = "READY";
				secondReady.classList.add("ready");
				secondReady.classList.add("multi-ready-matchfix");
				secondReady.classList.add("display-none");
				secondReady.setAttribute("data-player", "multi-matchFix-" + playerGame[1].alias + "-ready")
				const roundDiv = document.createElement("div");
				const firstDiv = document.createElement("div");
				const separatorDiv = document.createElement("div");
				const secondDiv = document.createElement("div");
				roundDiv.append(roundSpan);
				firstDiv.appendChild(firstName);
				firstDiv.appendChild(firstReady);
				separatorDiv.classList.add("separator")
				secondDiv.appendChild(secondName)
				secondDiv.appendChild(secondReady);
				const containerDiv = document.createElement("div");
				containerDiv.classList.add("multi-tournament-matchFix-items")
				containerDiv.appendChild(roundDiv);
				containerDiv.appendChild(firstDiv);
				containerDiv.appendChild(separatorDiv);
				containerDiv.appendChild(secondDiv);
				parent.appendChild(containerDiv);
			})
		}
		else {
			const playerArray = Object.keys(global.socket.gameInfo.player);
			playerArray.forEach(player=>{
				global.socket.gameInfo.player[player].ready? document.querySelector('[data-player='+'"multi-matchFix-' + player + '-ready"]').classList.remove('display-none') :document.querySelector('[data-player='+'"multi-matchFix-' + player + '-ready"]').classList.add('display-none') 
			})
		}
	}
	
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
	if (global.ui.auth) {
		document.querySelector(".nav-local").classList.add("display-none");
		document.querySelector(".nav-multi").classList.remove("display-none");
	}
	else {
		document.querySelector(".nav-local").classList.remove("display-none");
		document.querySelector(".nav-multi").classList.add("display-none");
	}
		
	global.ui.mainMenu?
		document.querySelector(".main-menu").classList.add("display-block"):document.querySelector(".main-menu").classList.remove("display-block");
	global.ui.login?
		document.querySelector(".login-menu").classList.add("display-block"):document.querySelector(".login-menu").classList.remove("display-block");
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
	if (global.ui.auth) {
		document.querySelector(".nav-logout").classList.remove("display-none");
		document.querySelector(".nav-login").classList.add("display-none");
	}
	else {
		document.querySelector(".nav-logout").classList.add("display-none");
		document.querySelector(".nav-login").classList.remove("display-none");
	}
	global.ui.authWarning? document.querySelector(".login-warning").classList.remove("display-none") : document.querySelector(".login-warning").classList.add("display-none");
	
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
	
	if (document.querySelector(".main-container").clientWidth < 577) {
		document.querySelector(".profile-container").style.width = "100%";
		document.querySelector(".chat-container").style.width = "100%";
		document.querySelector(".main-nav").style.height = "initial";
		document.querySelector(".main-nav").style.width = "100%";
		
		if (global.ui.profile){
			document.querySelector(".profile-container").style.height = document.querySelector(".main-container").clientHeight - document.querySelector(".canvas-container").clientHeight - document.querySelector(".main-nav").clientHeight;
			document.querySelector(".chat-container").style.height = "0";
		}
		else {
			document.querySelector(".profile-container").style.height = "0";
			document.querySelector(".chat-container").style.height = document.querySelector(".main-container").clientHeight - document.querySelector(".canvas-container").clientHeight - document.querySelector(".main-nav").clientHeight;
		}
	}
	else if (document.querySelector(".main-container").clientWidth >= 577 && document.querySelector(".main-container").clientWidth <= 993) {
		document.querySelector(".profile-container").style.height = "100vh";
		document.querySelector(".chat-container").style.height = "100vh";
		document.querySelector(".main-nav").style.height ="100vh";
		if (global.ui.profile){
			document.querySelector(".profile-container").style.width = document.querySelector(".main-container").clientWidth - document.querySelector(".canvas-container").clientWidth - document.querySelector(".main-nav").clientWidth;
			document.querySelector(".chat-container").style.width = "0";
		}
		else {
			document.querySelector(".profile-container").style.width = "0";
			document.querySelector(".chat-container").style.width = document.querySelector(".main-container").clientWidth - document.querySelector(".canvas-container").clientWidth - document.querySelector(".main-nav").clientWidth;
		}
	}
	else {
		document.querySelector(".profile-container").style.height = global.desktopCanvasHeight;
		document.querySelector(".main-nav").style.height = global.desktopCanvasHeight;
		document.querySelector(".chat-container").style.height = global.desktopCanvasHeight;
		if (global.ui.profile){
			document.querySelector(".profile-container").style.width = document.querySelector(".main-container").clientWidth - document.querySelector(".canvas-container").clientWidth - document.querySelector(".main-nav").clientWidth - document.querySelector(".fr-start").clientWidth - document.querySelector(".fr-end").clientWidth;
			document.querySelector(".chat-container").style.width = "0";
		}
		else {
			document.querySelector(".profile-container").style.width = "0";
			document.querySelector(".chat-container").style.width = document.querySelector(".main-container").clientWidth - document.querySelector(".canvas-container").clientWidth - document.querySelector(".main-nav").clientWidth - document.querySelector(".fr-start").clientWidth - document.querySelector(".fr-end").clientWidth;
		}	
	}
	global.socket.spectate? document.querySelector(".spectate-container").classList.remove("display-none"):document.querySelector(".spectate-container").classList.add("display-none")
	
	
}

function arenaRotateY() {
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

function arenaRotateX() {
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



function shakeEffect() {
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

function setTimer() {
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

export function populateWinner() {
	if (global.gameplay.local && global.gameplay.single) {
		const scoreOne = parseInt(global.gameplay.localSingleInfo.player[0].score);
		const scoreAI = parseInt(global.gameplay.computerScore);
		if (scoreOne > scoreAI) {
			global.gameplay.localSingleInfo.player[0].winner = true;
			global.gameplay.computerWinner = false;
		}
		else if (scoreAI > scoreOne) {
			global.gameplay.localSingleInfo.player[0].winner = false;
			global.gameplay.computerWinner = true;
		}
	}
	else if (global.gameplay.local && global.gameplay.two) {
		const scoreOne = parseInt(global.gameplay.localTwoInfo.player[0].score);
		const scoreTwo = parseInt(global.gameplay.localTwoInfo.player[1].score);
		if (scoreOne > scoreTwo) {
			global.gameplay.localTwoInfo.player[0].winner = true;
			global.gameplay.localTwoInfo.player[1].winner = false;
		}
		else if (scoreTwo > scoreOne) {
			global.gameplay.localTwoInfo.player[0].winner = false;
			global.gameplay.localTwoInfo.player[1].winner = true;
		}
	}
	else if (global.gameplay.local && global.gameplay.tournament) {
		const scoreOne = parseInt(global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].score);
		const scoreTwo = parseInt(global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].score);
		let winnerAlias;
		if (scoreOne > scoreTwo) {
			global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].winner = true;
			global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].winner = false;
			winnerAlias = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].alias;
		}
		else if (scoreTwo > scoreOne) {
			global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].winner = true;
			global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].winner = false;
			winnerAlias = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].alias;
		}
		else {
			const randomWinner = Math.floor(Math.random() * 1)
			if (randomWinner === 0)
				winnerAlias = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][0].alias;
			else
				winnerAlias = global.gameplay.localTournamentInfo.playerGame[global.gameplay.localTournamentInfo.currentRound][1].alias;
		}

		for (let i = 0; i < global.gameplay.localTournamentInfo.playerGame.length; i++) {
			if (global.gameplay.localTournamentInfo.playerGame[i][0].alias === "?") {
				global.gameplay.localTournamentInfo.playerGame[i][0].alias = winnerAlias;
				break;
			}
			else if (global.gameplay.localTournamentInfo.playerGame[i][1].alias === "?") {
				global.gameplay.localTournamentInfo.playerGame[i][1].alias = winnerAlias;
				break;
			}
		}
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "versus") {
		const scoreOne = parseInt(global.socket.gameInfo.playerGame[0].score);
		const scoreTwo = parseInt(global.socket.gameInfo.playerGame[1].score);
		if (scoreOne > scoreTwo) {
			global.socket.gameInfo.playerGame[0].winner = true;
			global.socket.gameInfo.playerGame[1].winner = false;
		}
		else if (scoreTwo > scoreOne) {
			global.socket.gameInfo.playerGame[0].winner = false;
			global.socket.gameInfo.playerGame[1].winner = true;
		}
	}
	else if (!global.gameplay.local && global.socket.gameInfo.gameMode === "tournament") {
		const scoreOne = parseInt(global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].score);
		const scoreTwo = parseInt(global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].score);
		let winnerAlias;
		if (scoreOne > scoreTwo) {
			global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].winner = true;
			global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].winner = false;
			winnerAlias = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias;
		}
		else if (scoreTwo > scoreOne) {
			global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].winner = true;
			global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].winner = false;
			winnerAlias = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias;
		}
		else {
			const randomWinner = Math.floor(Math.random() * 1)
			if (randomWinner === 0)
				winnerAlias = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][0].alias;
			else
				winnerAlias = global.socket.gameInfo.playerGame[global.socket.gameInfo.currentRound][1].alias;
		}
		if (global.socket.gameInfo.currentRound < global.socket.gameInfo.round - 1) {
			for (let i = 0; i < global.socket.gameInfo.playerGame.length; i++) {
				if (global.socket.gameInfo.playerGame[i][0].alias === "?") {
					global.socket.gameInfo.playerGame[i][0].alias = winnerAlias;
					break;
				}
				else if (global.socket.gameInfo.playerGame[i][1].alias === "?") {
					global.socket.gameInfo.playerGame[i][1].alias = winnerAlias;
					break;
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

function sendMultiData() {
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




export function main() {
	const frameTimer = {
		now:0,
		prev:0,
	};

	init();
	//render background
	document.querySelector(".canvas-background-1").classList.add(global.gameplay.backgroundClass[global.gameplay.backgroundIndex]);
	document.querySelector(".canvas-background-2").classList.add(global.gameplay.backgroundClass[global.gameplay.backgroundIndex]);
	keyBinding();
	keyBindingMultiplayer();
	keyBindingProfile();
	keyBindingChat();
	
	const canvas = document.querySelector( '.canvas' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
	const scene = new THREE.Scene();
	renderer.setClearColor( 0x000000, 0 );
	renderer.shadowMap.enabled = true;

	//create arena scenegraph
	const arena3D = new THREE.Object3D();

	//create all other Pong objects
	createArenaMesh(arena3D);
	createSphereMesh(arena3D);
	const camera = createCamera();
	createPaddleMesh(arena3D);
	createDirectionalLight(arena3D);
	createPointLight(arena3D);
	createShadowPlanes(arena3D);
	createPowerUp(arena3D);
	//attach arena and add to scene
	global.arena3D = arena3D;
	scene.add(arena3D);

	function resizeRenderer() {
		const width = document.querySelector(".canvas-container").clienthWidth;
		const height = document.querySelector(".canvas-container").clienthHeight;
	
		renderer.setSize(width,height);
		renderer.setPixelRatio(window.devicePixelRatio);
	}
	resizeRenderer();
	window.addEventListener('resize', resizeRenderer);

	function render( time ) {
		if (global.gameplay.gameStart)
			frameTimer.now = Math.floor(time * 0.001);
		else {
			frameTimer.now = 0;
			frameTimer.prev = 0;
		}
		
		
		if ( resizeRendererToDisplaySize( renderer ) ) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		
		processCountDown(frameTimer);
		processCamera(camera);
		
		processSphere();
		processPaddle();
		processPowerUp();
		processGame();
		processBackground();
		processUI();
		shakeEffect();
		arenaRotateY();
		arenaRotateX();
		if (global.gameplay.rotate90) {
			global.arena3D.rotation.y = -Math.PI / 2;
			for (let i = 0; i < global.powerUp.mesh.length; i++) {
				global.powerUp.mesh[i].rotation.y = Math.PI / 2;
			}
			global.sphere.sphereMesh.forEach(sphereMesh=>{
				sphereMesh.rotation.y = Math.PI / 2;
			})
		}
		movePaddle();
		setTimer();
		renderer.render( scene, camera );
		sendMultiData()
		

		global.requestID = requestAnimationFrame(render);
	}
	global.requestID = requestAnimationFrame(render);
}

main();