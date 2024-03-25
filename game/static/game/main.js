import * as THREE from 'https://threejs.org/build/three.module.js';
import { global } from './global.js';
import { createArenaMesh, createSphereMesh, createCamera, createPaddleMesh, createDirectionalLight, createPointLight, createShadowPlanes } from './3Dobject.js';
import { createPowerUp } from './3Dpowerup.js';
import { processPaddle, processSphere, processCamera, processPowerUp, processBackground, processShakeEffect, processUI, processArenaRotateY, processArenaRotateX, processFrameTimer, processCountDown } from './render.js'
import { keyBindingGame, processGame, movePaddle } from './gameplay.js';
import { keyBindingMultiplayer, sendMultiPlayerData} from './multiplayer.js';
import { keyBindingProfile} from './profile.js';
import { keyBindingChat} from './chat.js';
import { transformDesktop } from './utilities.js'

function windowResize(e) {
	const canvas = document.querySelector(".canvas-container");
	//for each individual client
	global.directionalLight.positionX = canvas.clientWidth;
	global.directionalLight.positionY = canvas.clientWidth;

	if (global.ui.auth || global.ui.authNotRequired) {
		const canvas = document.querySelector(".canvas-container");
		const body = document.querySelector("body");
		document.querySelector(".banner").classList.remove("display-none");
		document.querySelector(".login-banner-container").classList.add("display-none");
		if (body.clientWidth < 577) {
			canvas.style.width = body.clientWidth
			canvas.style.height = (body.clientWidth / global.arena.aspect) + 'px';
			document.querySelector(".profile-container").style.width = "100%";
			document.querySelector(".chat-container").style.width = "100%";
			document.querySelector(".main-nav").style.width = body.clientWidth;
			document.querySelector(".main-nav").style.height = global.mainNavInitMobileHeight;
			canvas.style.transform ='';
			if (global.ui.profile){
				document.querySelector(".profile-container").style.height = document.querySelector(".main-container").clientHeight - (body.clientWidth / global.arena.aspect) - global.mainNavInitMobileHeight;
				document.querySelector(".chat-container").style.height = "0";
			}
			else {
				document.querySelector(".profile-container").style.height = "0";
				document.querySelector(".chat-container").style.height = document.querySelector(".main-container").clientHeight - (body.clientWidth / global.arena.aspect) - global.mainNavInitMobileHeight;
			}
			
		}
		else if (body.clientWidth >= 577 && body.clientWidth <= 993) {
			canvas.style.height = body.clientHeight;
			canvas.style.width = (body.clientHeight * global.arena.aspect) + 'px';
			document.querySelector(".profile-container").style.height = "100vh";
			document.querySelector(".chat-container").style.height = "100vh";
			document.querySelector(".main-nav").style.height ="100vh";
			document.querySelector(".main-nav").style.width = global.mainNavInitMobileWidth;
			canvas.style.transform ='';
			if (global.ui.profile){
				document.querySelector(".profile-container").style.width = document.querySelector(".main-container").clientWidth - (body.clientHeight * global.arena.aspect) - global.mainNavInitMobileWidth;
				document.querySelector(".chat-container").style.width = "0";
			}
			else {
				document.querySelector(".profile-container").style.width = "0";
				document.querySelector(".chat-container").style.width = document.querySelector(".main-container").clientWidth - (body.clientHeight * global.arena.aspect) - global.mainNavInitMobileWidth;
			}
			
		}
		else {
			canvas.style.width = global.desktopCanvasWidth;
			canvas.style.height = global.desktopCanvasWidth / global.arena.aspect;

			transformDesktop(global.desktopCanvasWidth, global.desktopCanvasWidth / global.arena.aspect);
			document.querySelector(".profile-container").style.height = global.desktopCanvasWidth / global.arena.aspect;
			document.querySelector(".main-nav").style.height = global.desktopCanvasWidth / global.arena.aspect;
			document.querySelector(".main-nav").style.width = global.mainNavInitDesktopWidth;
			document.querySelector(".chat-container").style.height = global.desktopCanvasWidth / global.arena.aspect;
			if (global.ui.profile){
				document.querySelector(".profile-container").style.width = global.minWidthProfileChat;
				document.querySelector(".chat-container").style.width = "0";
			}
			else {
				document.querySelector(".chat-container").style.width = global.minWidthProfileChat;
				document.querySelector(".profile-container").style.width = "0";
			}
		}
	}
	else if (!global.ui.auth) {
		const canvas = document.querySelector(".canvas-container");
		const body = document.querySelector("body");
		document.querySelector(".banner").classList.add("display-none");
		document.querySelector(".login-banner-container").classList.remove("display-none");
		if (body.clientWidth < 577) {
			canvas.style.height = body.clientHeight;
			canvas.style.width = (body.clientHeight * global.arena.aspect) + 'px';
			canvas.style.transform ='';
			document.querySelector(".profile-container").style.height = "0";
			document.querySelector(".chat-container").style.height = "0";
			document.querySelector(".main-nav").style.height = "0";
		}
		else if (body.clientWidth >= 577 && body.clientWidth <= 993)  {
			let canvasWidth = body.clientWidth;
			let canvasHeight = body.clientWidth / global.arena.aspect;
			canvas.style.width = canvasWidth;
			canvas.style.height = canvasHeight;
			canvas.style.transform ='';
			document.querySelector(".profile-container").style.width = "0";
			document.querySelector(".chat-container").style.width = "0";
			document.querySelector(".main-nav").style.width = "0";
		}
		else {
			let canvasHeight = body.clientHeight;
			let canvasWidth = body.clientHeight * global.arena.aspect;
			if (canvasWidth < body.clientWidth) {
				canvasWidth = body.clientWidth;
				canvasHeight = body.clientWidth / global.arena.aspect;
			}
			canvas.style.width = global.desktopCanvasWidth;
			canvas.style.height = global.desktopCanvasWidth / global.arena.aspect;
			transformDesktop(canvasWidth, canvasHeight);
			document.querySelector(".profile-container").style.width = "0";
			document.querySelector(".chat-container").style.width = "0";
			document.querySelector(".main-nav").style.width = "0";
		}
	}
	
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

export { windowResize }