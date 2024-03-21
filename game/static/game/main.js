import * as THREE from 'https://threejs.org/build/three.module.js';
import { global } from './global.js';
import { createArenaMesh, createSphereMesh, createCamera, createPaddleMesh, createDirectionalLight, createPointLight, createShadowPlanes } from './3Dobject.js';
import { createPowerUp } from './3Dpowerup.js';
import { processPaddle, processSphere, processCamera, processPowerUp, processBackground, processShakeEffect, processUI, processArenaRotateY, processArenaRotateX, processFrameTimer, processCountDown } from './render.js'
import { keyBindingGame, processGame, movePaddle } from './gameplay.js';
import { keyBindingMultiplayer, sendMultiPlayerData} from './multiplayer.js';
import { keyBindingProfile} from './profile.js';
import { keyBindingChat} from './chat.js';

function windowResize(e) {
	const canvas = document.querySelector(".canvas-container");
	const mainContainer = document.querySelector("body");
	if (mainContainer.clientWidth >= 577 && mainContainer.clientWidth <= 993) {
		canvas.style.height = mainContainer.clientHeight;
		canvas.style.width = (canvas.clientHeight * global.arena.aspect) + 'px';
	}
	else if (mainContainer.clientWidth < 577) {
		canvas.style.width = "100%"
		canvas.style.height = (canvas.clientWidth / global.arena.aspect) + 'px';
	}
	else {
		console.log("here")
		canvas.style.width = global.desktopCanvasWidth;
		canvas.style.height = (canvas.clientWidth / global.arena.aspect) + 'px';
	}
	global.desktopCanvasHeight = canvas.clientHeight;
	
	//for each individual client
	global.directionalLight.positionX = canvas.clientWidth;
	global.directionalLight.positionY = canvas.clientWidth;
	
	//for local  or multiplayer mainClient
	if (global.gameplay.local || !global.gameplay.local && global.gameplay.username === global.socket.gameInfo.mainClient) {
		global.sphere.sphereMesh.forEach(sphereMesh=>{
			sphereMesh.velocityX = canvas.clientWidth / global.sphere.velocityDivision;
			sphereMesh.velocityY = canvas.clientWidth / global.sphere.velocityDivision;
			sphereMesh.velocityZ = canvas.clientWidth / global.sphere.velocityDivision;
		})
	}
}

function resizeRenderer() {
	const width = document.querySelector(".canvas-container").clienthWidth;
	const height = document.querySelector(".canvas-container").clienthHeight;

	global.renderer.setSize(width,height);
	global.renderer.setPixelRatio(window.devicePixelRatio);
}


function resizeRendererToDisplaySize() {
	const canvas = global.renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if ( needResize ) {
		global.renderer.setSize( width, height, false );
	}
	return needResize;
}

function main() {
	const frameTimer = {
		now:0,
		prev:0,
	};

	//render background
	document.querySelector(".canvas-background-1").classList.add(global.gameplay.backgroundClass[global.gameplay.backgroundIndex]);
	document.querySelector(".canvas-background-2").classList.add(global.gameplay.backgroundClass[global.gameplay.backgroundIndex]);
	windowResize();
	resizeRenderer();

	//key binding
	window.addEventListener('resize', resizeRenderer);
	window.addEventListener("resize", windowResize);
	keyBindingGame();
	keyBindingMultiplayer();
	keyBindingProfile();
	keyBindingChat();

	const scene = new THREE.Scene();
	global.renderer.setClearColor( 0x000000, 0 );
	global.renderer.shadowMap.enabled = true;

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

	function render( time ) {
		if (global.gameplay.gameStart)
			frameTimer.now = Math.floor(time * 0.001);
		else {
			frameTimer.now = 0;
			frameTimer.prev = 0;
		}
		if ( resizeRendererToDisplaySize() ) {
			const canvas = global.renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		processSphere();
		processPaddle();
		processCamera(camera);
		processPowerUp();
		processBackground();
		processShakeEffect();
		processUI();
		processArenaRotateY();
		processArenaRotateX();
		processCountDown(frameTimer);
		processFrameTimer();
		if (global.gameplay.rotate90) {
			global.arena3D.rotation.y = -Math.PI / 2;
			for (let i = 0; i < global.powerUp.mesh.length; i++) {
				global.powerUp.mesh[i].rotation.y = Math.PI / 2;
			}
			global.sphere.sphereMesh.forEach(sphereMesh=>{
				sphereMesh.rotation.y = Math.PI / 2;
			})
		}
		processGame();
		movePaddle();
		sendMultiPlayerData();
		global.renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

main();