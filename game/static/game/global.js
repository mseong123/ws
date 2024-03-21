import * as THREE from 'https://threejs.org/build/three.module.js';

const global = {
	renderer:new THREE.WebGLRenderer( { antialias: true, canvas:document.querySelector(".canvas") } ),
	clientWidth:document.querySelector(".canvas-container").clientWidth,
	arena:{
		widthDivision:2.5,
		aspect:4 / 3,
		color:"#fff",
		thickness:6,
	},
	desktopCanvasWidth:900,
	sphere:{
		sphereMeshProperty:[],
		radiusDivision:100,
		widthSegments:12,
		sphereMesh:[],
		sphereMeshProperty:[],
		radiusDivision:100, 
		widthSegments:12,
		heightSegments:12,
		shininess:60,
		velocityTopLimit:3,
		velocityBottomLimit:1,
		color:"#686868",
		velocityDivision:300,
	},
	camera:{
		fov:62,
		near:0.1,
		far:3000,
		initRotationX:-Math.PI / 6.5,
	},
	colorSpace:["#0E2954","#1F6E8C","#2E8A99","#84A7A1","#453C67", "#6D67E4", "#46C2CB", "#F2F7A1"],
	colorOcean:["#F6F4EB","#91C8E4","#749BC2","#4682A9", "#ECF4D6", "#9AD0C2", "#2D9596", "#265073"],
	colorAlien:["#635985","#443C68","#393053","#18122B", "#711DB0", "#C21292", "#EF4040", "#FFA732"],
	colorDesert:["#472D2D","#553939","#704F4F","#A77979", "#9B4444", "#C68484","#A3C9AA","#EEEEEE"],
	paddle:{
		paddles:[],
		paddlesProperty:[],
		opacity:0.9,
		maxPaddle:4,
		distanceFromEdgeModifier:2,
		hitBackModifier:5,
	},
	directionalLight:{
		color:"#FFF",
		intensity:15,
		positionZ:0,
	},
	pointLight:{
		color:"#FFF",
		intensity:10,
		distance:5000,
	},
	shadowPlane: {
		opacity:0.3,
	},
	powerUp: {
		enable:1,
		widthSegments:6,
		heightSegments:6,
		shininess:60,
		circleRotation:0.1,
		index:0,
		durationFrame:0, 
		durationFrameLimit:750, 
		mesh:[],
		meshProperty:[],
		color:["#FFA500", "#088F8F", "#7F7F7F", "#B22222", "#123456"],
		largePaddle:{
			multiplier:4,
		},
		shake:{
			multiplier:4,
			enable:0,
		},
		invisibility:{
			opacity:0.1,
		},
		ultimate:{
			count:10,
		},
	},
	gameplay:{
		username:"",
		backgroundClass:["canvas-url-space", "canvas-url-ocean", "canvas-url-alien", "canvas-url-desert"],
		backgroundIndex:Math.floor(Math.random() * 4), 
		roundStart:0,
		gameStart:0,
		gameEnd:0,
		pause:0,
		gameSummary:0,
		single:0,
		playerIndex:[], 
		immortality:0,
		cheat:1,
		defaultLudicrious:0,
		defaultPowerUp:1,
		defaultCheatCount:3,
		ludicrious:0,
		ludicriousYminuteUpper:1,
		ludicriousYminuteLower:0,
		ludicriousYsecondUpper:60,
		ludicriousYsecondLower:30,
		ludicriousXminuteUpper:1,
		ludicriousXminuteLower:0,
		ludicriousXsecondUpper:30,
		ludicriousXsecondLower:10,
		ludicriousYXminuteUpper:1,
		ludicriousYXminuteLower:0,
		ludicriousYXsecondUpper:10,
		ludicriousYXsecondLower:0,
		initRotateY:1,
		initRotateX:0,
		rotationY:0.005,
		rotationX:0.005,
		rotate90:0,
		roundStartFrame:0,
		roundStartFrameLimit:30,
		shadowFrame:0,
		shadowFrameLimit:5,
		defaultDuration:"01:10",
		local:1,
		computerScore:0,
		computerWinner:false,
	},
	keyboard:{
		w:0,
		a:0,
		s:0,
		d:0,
		up:0,
		down:0,
		left:0,
		right:0,
		speed:5,
	},
	touch:{
		startX:0,
		startY:0,
	},
	ui: {
		toggleCanvas:0,
		toggleChat:0,
		toggleGame:0,
		chat:1,
		mainMenu:1,
		login:0,
		local:0,
		single:0,
		two:0,
		tournament:0,
		multiLobby:0,
		multiCreate:0,
		auth:0,
		authWarning:0,
		profile:0,
	},
	fetch: {
		authURL:"auth/",
		sessionURL:"session/",
		logoutURL:"logout/",
	},
	socket: {
		gameLobbySocket:null,
		gameLobbyInfo:[],
		gameSocket:null,
		ready:0,
		matchFix:0,
		spectate:0,
		gameLobbyError:0,
		gameError:0,
	},
		
};

global.arena.width = global.clientWidth / global.arena.widthDivision;
global.arena.height = global.clientWidth / global.arena.aspect / global.arena.widthDivision;
global.arena.depth = global.clientWidth / global.arena.aspect;
global.desktopCanvasHeight = global.desktopCanvasWidth * global.arena.aspect;
global.sphere.radius = global.clientWidth /global.sphere.radiusDivision;
global.sphere.velocityX = global.clientWidth / global.sphere.velocityDivision;
global.sphere.velocityY = global.clientWidth / global.sphere.velocityDivision;
global.sphere.velocityZ = global.clientWidth /global.sphere.velocityDivision;
global.sphere.circleRadius = global.sphere.radius * 2;
global.camera.positionZ = global.clientWidth / global.arena.aspect;
global.camera.initPositionY = global.arena.width;
global.paddle.color = [global.colorSpace, global.colorOcean, global.colorAlien, global.colorDesert];
global.paddle.defaultWidth = global.clientWidth / global.arena.widthDivision / 5;
global.paddle.defaultHeight = global.clientWidth / global.arena.aspect / global.arena.widthDivision / 7;
global.paddle.thickness = global.clientWidth / global.arena.aspect / 100;
global.directionalLight.positionX = global.clientWidth;
global.directionalLight.positionY = global.clientWidh;
global.shadowPlane.sideWidth = global.clientWidth / global.arena.aspect / global.arena.widthDivision;
global.shadowPlane.sideHeight = global.clientWidth  / global.arena.aspect;
global.shadowPlane.TopBottomWidth = global.clientWidth / global.arena.widthDivision;
global.powerUp.radius = global.sphere.radius;
global.powerUp.circleRadius = global.powerUp.radius * 3;
global.gameplay.localSingleInfo = { 
	player:[{alias:"Player", score:0, winner:false}],
	ludicrious:global.gameplay.defaultLudicrious,
	powerUp:global.gameplay.defaultPowerUp,
	duration:global.gameplay.defaultDuration,
	durationCount:global.gameplay.defaultDuration,
};
global.gameplay.localTwoInfo = { 
	player:[{alias:"Player-One", score:0, winner:false}, {alias:"Player-Two", score:0, winner:false}],
	ludicrious:global.gameplay.defaultLudicrious,
	powerUp:global.gameplay.defaultPowerUp,
	duration:global.gameplay.defaultDuration,
	durationCount:global.gameplay.defaultDuration,
};
global.gameplay.localTournamentInfo = { 
	player:[{alias:"Player-One"}, {alias:"Player-Two"}],
	playerGame:[],
	currentRound:0,
	round:0,
	ludicrious:global.gameplay.defaultLudicrious,
	powerUp:global.gameplay.defaultPowerUp,
	duration:global.gameplay.defaultDuration,
	durationCount:global.gameplay.defaultDuration,
};
global.socket.gameInfo = {
	mainClient:"",
	gameMode:"",
	player:{},
	playerGame:[],
	currentRound:0,
	round:0,
	cheatCount:0,
	ludicrious:global.gameplay.defaultLudicrious,
	powerUp:global.gameplay.defaultPowerUp,
	teamUp:0,
	duration:global.gameplay.defaultDuration,
	durationCount:global.gameplay.defaultDuration,
};

export {global};
