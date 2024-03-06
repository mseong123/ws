function windowResize(e) {
	const canvas = document.querySelector(".canvas-container");
	canvas.style.height = (canvas.clientWidth / document.global.arena.aspect) + 'px';
	//for each individual client
	document.global.directionalLight.positionX = canvas.clientWidth;
	document.global.directionalLight.positionY = canvas.clientWidth;
	//for canvas/chat responsive effect when screenwidth changes
	if (window.innerWidth >= 769) 
		document.global.ui.chat = 0;

	//for local  or multiplayer mainClient
	if (document.global.gameplay.local || !document.global.gameplay.local && document.global.gameplay.mainClient) {
		document.global.sphere.sphereMesh.forEach(sphereMesh=>{
			sphereMesh.velocityX = canvas.clientWidth / document.global.sphere.velocityDivision;
			sphereMesh.velocityY = canvas.clientWidth / document.global.sphere.velocityDivision;
			sphereMesh.velocityZ = canvas.clientWidth / document.global.sphere.velocityDivision;
		})
	}
}

function initGlobal() {
	const canvas = document.querySelector(".canvas-container");
	const clientWidth = canvas.clientWidth;

	//initiate global variable
	document.global = {};
	document.global.clientWidth = clientWidth;

	//arena info
	document.global.arena = {};
	document.global.arena.widthDivision = 2.5;
	document.global.arena.aspect = 4 / 3;
	document.global.arena.color = "#fff";
	document.global.arena.thickness = 6;
	document.global.arena.width = clientWidth / document.global.arena.widthDivision;
	document.global.arena.height = clientWidth / document.global.arena.aspect / document.global.arena.widthDivision;
	document.global.arena.depth = clientWidth / document.global.arena.aspect;

	//sphere info
	document.global.sphere = {};
	document.global.sphere.sphereMesh = [];
	document.global.sphere.sphereMeshProperty = [];
	document.global.sphere.radiusDivision = 100; //to change to be based on clientwidth
	document.global.sphere.widthSegments = 12;
	document.global.sphere.heightSegments = 12;
	document.global.sphere.shininess = 60;
	document.global.sphere.velocityTopLimit = 3;
	document.global.sphere.velocityBottomLimit = 1;
	document.global.sphere.color = "#686868";
	document.global.sphere.velocityDivision = 200;
	document.global.sphere.radius = clientWidth / document.global.sphere.radiusDivision;
	document.global.sphere.circleRadius = document.global.sphere.radius * 2;
	document.global.sphere.velocityX = clientWidth / document.global.sphere.velocityDivision;
	document.global.sphere.velocityY = clientWidth / document.global.sphere.velocityDivision;
	document.global.sphere.velocityZ = clientWidth / document.global.sphere.velocityDivision;

	//camera info
	document.global.camera = {};
	document.global.camera.fov = 60;
	document.global.camera.near = 0.1;
	document.global.camera.far = 3000;
	document.global.camera.positionZ = clientWidth / document.global.arena.aspect;
	document.global.camera.initPositionY = document.global.arena.width;
	document.global.camera.initRotationX = -Math.PI / 6.5;


	const colorSpace = ["#0E2954","#1F6E8C","#2E8A99","#84A7A1"];
	const colorOcean = ["#F6F4EB","#91C8E4","#749BC2","#4682A9"];
	const colorAlien = ["#635985","#443C68","#393053","#18122B"];
	const colorDesert = ["#472D2D","#553939","#704F4F","#A77979"];
	document.global.paddle={};
	document.global.paddle.paddles = [];
	document.global.paddle.paddlesProperty = [];
	document.global.paddle.color = [colorSpace, colorOcean, colorAlien, colorDesert];
	document.global.paddle.opacity = 0.9;
	document.global.paddle.distanceFromEdgeModifier= 2;
	document.global.paddle.hitBackModifier = 5;
	document.global.paddle.defaultWidth = clientWidth / document.global.arena.widthDivision / 5; //5
	document.global.paddle.defaultHeight = clientWidth / document.global.arena.aspect / document.global.arena.widthDivision / 7 //7;
	document.global.paddle.thickness = clientWidth / document.global.arena.aspect / 100;

	//directional light info
	
	document.global.directionalLight = {};
	document.global.directionalLight.color = "#FFF";
	document.global.directionalLight.intensity = 15;
	document.global.directionalLight.positionZ = 0;
	document.global.directionalLight.positionX = clientWidth;
	document.global.directionalLight.positionY = clientWidth;
	
	
	//point light info
	document.global.pointLight = {};
	document.global.pointLight.color = "#FFF";
	document.global.pointLight.intensity = 10;
	document.global.pointLight.distance = 5000;
	

	//shadow planes info
	document.global.shadowPlane = {};
	document.global.shadowPlane.opacity = 0.3
	document.global.shadowPlane.sideWidth = clientWidth / document.global.arena.aspect / document.global.arena.widthDivision;
	document.global.shadowPlane.sideHeight = clientWidth  / document.global.arena.aspect;
	document.global.shadowPlane.TopBottomWidth = clientWidth / document.global.arena.widthDivision;

	
	//overall powerup info
	
	document.global.powerUp = {};
	document.global.powerUp.enable = 1;
	document.global.powerUp.widthSegments = 6;
	document.global.powerUp.heightSegments = 6;
	document.global.powerUp.radius = document.global.sphere.radius;
	document.global.powerUp.circleRadius = document.global.powerUp.radius * 3;
	document.global.powerUp.shininess = 60;
	document.global.powerUp.circleRotation = 0.1;
	document.global.powerUp.index;
	document.global.powerUp.durationFrame = 0; //miliseconds
	document.global.powerUp.durationFrameLimit = 500; //miliseconds
	document.global.powerUp.mesh = [];
	document.global.powerUp.meshProperty = [];
	document.global.powerUp.color = ["#FFA500", "#088F8F", "#7F7F7F", "#B22222", "#123456"];
	
	//largepaddle powerup info
	document.global.powerUp.largePaddle = {};
	document.global.powerUp.largePaddle.multiplier = 4;

	//shake powerup info
	document.global.powerUp.shake = {};
	document.global.powerUp.shake.multiplier = 4;
	document.global.powerUp.shake.enable = 0;

	//invisibility powerup info
	document.global.powerUp.invisibility = {};
	document.global.powerUp.invisibility.opacity = 0.1;

	//ultimate powerup info
	document.global.powerUp.ultimate = {};
	document.global.powerUp.ultimate.count = 10;
		
	//gameplay
	document.global.gameplay = {};
	document.global.gameplay.username = "";
	document.global.gameplay.backgroundClass = ["canvas-url-space", "canvas-url-ocean", "canvas-url-alien", "canvas-url-desert"];
	document.global.gameplay.backgroundIndex = Math.floor(Math.random() * 4); 
	document.global.gameplay.roundStart = 0;
	document.global.gameplay.gameStart = 0;
	document.global.gameplay.gameEnd = 0;
	document.global.gameplay.pause = 0;
	document.global.gameplay.gameSummary = 0;
	document.global.gameplay.single = 0;
	document.global.gameplay.playerIndex = []; 
	document.global.gameplay.immortality = 0; //for gameplay debugging purpose
	document.global.gameplay.cheat = 1; // for show purpose
	document.global.gameplay.ludicrious = 0;
	document.global.gameplay.ludicriousYminuteUpper = 1;
	document.global.gameplay.ludicriousYminuteLower = 0;
	document.global.gameplay.ludicriousYsecondUpper = 60;
	document.global.gameplay.ludicriousYsecondLower = 30;
	document.global.gameplay.ludicriousXminuteUpper = 1;
	document.global.gameplay.ludicriousXminuteLower = 0;
	document.global.gameplay.ludicriousXsecondUpper = 30;
	document.global.gameplay.ludicriousXsecondLower = 10;
	document.global.gameplay.ludicriousYXminuteUpper = 1;
	document.global.gameplay.ludicriousYXminuteLower = 0;
	document.global.gameplay.ludicriousYXsecondUpper = 10;
	document.global.gameplay.ludicriousYXsecondLower = 0;
	document.global.gameplay.initRotateY = 1;
	document.global.gameplay.initRotateX = 0;
	document.global.gameplay.rotationY = 0.005;
	document.global.gameplay.rotationX = 0.005;
	document.global.gameplay.rotate90 = 0;
	document.global.gameplay.roundStartFrame = 0;
	document.global.gameplay.roundStartFrameLimit = 30;
	document.global.gameplay.shadowFrame = 0;
	document.global.gameplay.shadowFrameLimit = 5;
	document.global.gameplay.defaultDuration = "00:10";

	//local or multiplayer game
	document.global.gameplay.local = 1;
	document.global.gameplay.localSingleInfo = { 
		player:[{alias:"Player", score:0, winner:false}],
		ludicrious:1,
		powerUp:1,
		duration:document.global.gameplay.defaultDuration,
		durationCount:document.global.gameplay.defaultDuration,
	};
	document.global.gameplay.localTwoInfo = { 
		player:[{alias:"Player-One", score:0, winner:false}, {alias:"Player-Two", score:0, winner:false}],
		ludicrious:1,
		powerUp:1,
		duration:document.global.gameplay.defaultDuration,
		durationCount:document.global.gameplay.defaultDuration,
	};
	document.global.gameplay.localTournamentInfo = { 
		player:[{alias:"Player-One"}, {alias:"Player-Two"}],
		playerGame:[],
		currentRound:0,
		round:0,
		ludicrious:1,
		powerUp:1,
		duration:document.global.gameplay.defaultDuration,
		durationCount:document.global.gameplay.defaultDuration,
	};
	document.global.gameplay.computerScore = 0;
	document.global.gameplay.computerWinner = false;
	document.global.gameplay.mainClient = 1;
	
	//other game info
	document.global.gameplay.playerNum = 0;
	document.global.gameplay.playerCount = 4;
	
	
	//keyboard
	document.global.keyboard = {};
	document.global.keyboard.w = 0;
	document.global.keyboard.a = 0;
	document.global.keyboard.s = 0;
	document.global.keyboard.d = 0;
	document.global.keyboard.up = 0;
	document.global.keyboard.down = 0;
	document.global.keyboard.left = 0;
	document.global.keyboard.right = 0;
	document.global.keyboard.speed = 5;

	//UI
	document.global.ui = {}
	document.global.ui.toggleCanvas = 0;
	document.global.ui.toggleChat = 0;
	document.global.ui.toggleGame = 0;
	document.global.ui.chat = 0;
	document.global.ui.mainMenu = 1;
	document.global.ui.login = 0;
	document.global.ui.local = 0;
	document.global.ui.single = 0;
	document.global.ui.two = 0;
	document.global.ui.tournament = 0;
	document.global.ui.multiLobby = 0;
	document.global.ui.multiCreate = 0;
	document.global.ui.auth = 0;
	

	//fetch
	document.global.fetch = {};
	document.global.fetch.authURL = "auth/";
	document.global.fetch.logoutURL = "logout/";

	//websockets
	document.global.socket = {}
	document.global.socket.gameLobbySocket;
	document.global.socket.gameLobbyInfo = [];
	document.global.socket.gameSocket;
	document.global.socket.gameSocketInfo = [];
	
}

export function init() {
	initGlobal();
	window.removeEventListener("resize", windowResize);
	window.addEventListener("resize", windowResize);
	windowResize();
}