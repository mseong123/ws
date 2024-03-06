function getCookie (name) {
	let value = `; ${document.cookie}`;
	let parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetch_login(data) {
	try {
		const response = await fetch(document.global.fetch.authURL, { 
			method:"POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCookie('csrftoken')
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
		console.error('Game socket closed unexpectedly');
	};
}

export function createGameSocket(mainClient) {
	document.global.socket.gameSocket = new WebSocket(
		'ws://'
		+ window.location.host
		+ '/game/game/' + mainClient + '/'
	);

	document.global.socket.gameSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		document.global.socket.gameSocketInfo = data.gameSocketInfo;
	};

	document.global.socket.gameSocket.onclose = function(e) {
		console.error('Game socket closed unexpectedly');
	};
}


export function keyBindingMultiplayer() {
	const multi = document.querySelector(".nav-multi");
	multi.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 0;
		document.global.ui.multiLobby = 1;
		createGameLobbyWebSocket();
	})
	const multiLobbyBack = document.querySelector(".multi-lobby-back");
	multiLobbyBack.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 1;
		document.global.ui.multiLobby = 0;
		document.global.socket.gameLobbySocket.close();
	})
	const multiCreateLeave = document.querySelector(".multi-leave");
	multiCreateLeave.addEventListener("click", (e)=>{
		document.global.ui.multiLobby = 1;
		document.global.ui.multiCreate = 0;
		document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"leave"}));
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
	const multiCreateGame = document.querySelector(".multi-create-game");
	multiCreateGame.addEventListener("click", (e)=>{
		if (document.global.socket.gameLobbyInfo.every(gameLobbyInfo=>{
			return gameLobbyInfo.mainClient !== document.global.gameplay.username
		})) {
			document.global.socket.gameLobbySocket.send(JSON.stringify({mode:"create", player:document.global.gameplay.username}));
			document.global.ui.multiCreate = 1;
			document.global.ui.multiLobby = 0;
		}
		
	})
}
