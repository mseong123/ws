function getCookie (name) {
	let value = `; ${document.cookie}`;
	let parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetch_login(data) {
	try {
		const response = await fetch(document.global.fetch.auth, { 
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
		const response = await fetch(document.global.fetch.logout, { 
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
	document.global.socket.gameLobby = new WebSocket(
		'ws://'
		+ window.location.host
		+ '/game/lobby/'
	);


	// gameSocket.onmessage = function(e) {
		
	// 	const data = JSON.parse(e.data);
	// 	const user = document.createElement('p');
	// 	user.textContent = data.user;
	// 	user.classList.add(data.user)
	// 	document.querySelector('.lobby').appendChild(user);
	// };

	// gameSocket.onclose = function(e) {
	// 	const data = JSON.parse(e.data);
	// 	document.querySelector('.')
	// 	console.error('Chat socket closed unexpectedly');
	// };
}


export function keyBindingMultiplayer() {
	const multi = document.querySelector(".nav-multi");
	multi.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 0;
		document.global.ui.multi = 1;
		createGameLobbyWebSocket();
	})
	const multiBack = document.querySelector(".multi-back");
	multiBack.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 1;
		document.global.ui.multi = 0;
	})
	const login = document.querySelector(".nav-login");
	login.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 0;
		document.global.ui.login = 1;
	})
	const logout = document.querySelector(".nav-logout");
	logout.addEventListener("click", (e)=>{
		fetch_logout().then(data=>{
			document.global.login.status = 0;
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
		fetch_login({username:"melee", password:"lameass123"}).then(data=>{
			if (data.authenticated) {
				document.global.gameplay.username = data.username;
				document.global.login.status = 1;
			}
			else
				document.global.login.status = 0;
		});
	})
}