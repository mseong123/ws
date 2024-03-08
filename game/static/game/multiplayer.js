function getCookie (name) {
	let value = `; ${document.cookie}`;
	let parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

function getCookie2() {
	return document.querySelector('[name="csrfmiddlewaretoken"]').value
}

async function fetch_login(data) {
	try {
		const response = await fetch(document.global.fetch.authURL, { 
			method:"POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCookie2()
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
		console.log('Game socket closed');
	};
}

export function createGameSocket(mainClient) {
	document.global.socket.gameSocket = new WebSocket(
		'ws://'
		+ window.location.host
		+ '/game/active/' + mainClient + '/'
	);

	document.global.socket.gameSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		document.global.socket.gameInfo = data.gameInfo;
	};

	document.global.socket.gameSocket.onclose = function(e) {
		console.log('Game socket closed');
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
		document.global.socket.gameLobbySocket.close();
	})
	const multiCreateLeave = document.querySelector(".multi-leave-game");
	multiCreateLeave.addEventListener("click", (e)=>{
		document.global.ui.multiLobby = 1;
		document.global.ui.multiCreate = 0;
		document.global.socket.ready = 0;
		document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
		document.global.socket.gameSocket.close();
		document.global.socket.gameInfo = {
			mainClient:"",
			gameMode:"",
			player:{},
			playerGame:[],
			currentRound:0,
			round:0,
			ludicrious:1,
			powerUp:1,
			teamUp:0,
			duration:document.global.gameplay.defaultDuration,
			durationCount:document.global.gameplay.defaultDuration,
		};
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
		})
	})
	const loginBack = document.querySelector(".login-back");
	loginBack.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 1;
		document.global.ui.login = 0;
	})
	const loginSubmit = document.querySelector(".login");
	loginSubmit.addEventListener("submit", (e)=>{
		e.preventDefault();
		fetch_login({username:document.getElementById("username").value, password:document.getElementById("password").value}).then(data=>{
			if (data.authenticated) {
				document.global.gameplay.username = data.username;
				document.global.ui.auth = 1;
				document.global.ui.toggleCanvas = 0;
				document.global.ui.login = 0;
				document.global.ui.mainMenu = 1;
			}
			else
				document.global.ui.auth = 0;
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
				document.global.socket.gameInfo.playerGame = [{teamName:"Team One", score:0, player:[], winner:false},{teamName:"Team Two", score:0, player:[], winner:false}];
				document.global.socket.gameSocket.send(JSON.stringify({
					mode:"create",
					gameData:document.global.socket.gameInfo
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
					gameData:document.global.socket.gameInfo
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
}
