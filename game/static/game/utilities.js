import { global } from './global.js';

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

function updateMatchFix() {
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

function matchFix() {
	const randomNumArray = [];
	let j = 0;
	global.gameplay.localTournamentInfo.round = global.gameplay.localTournamentInfo.player.length - 1;
	while (randomNumArray.length != global.gameplay.localTournamentInfo.player.length) {
		const randomNum = Math.floor(Math.random() * global.gameplay.localTournamentInfo.player.length)
		if (randomNumArray.every(array => {
			return array != randomNum
		}))
			randomNumArray.push(randomNum);
	}
	for (let i = 0; i < randomNumArray.length - 1; i++) {
		
		const round = [];
		for (let k = j; k < j + 2 && j < (randomNumArray.length - 1) * 2 ; k++) {
			const player = {
				alias:'',
				score:0,
				winner:false
			};
			if (randomNumArray[k] !== undefined)
				player.alias = global.gameplay.localTournamentInfo.player[randomNumArray[k]].alias;
			else
				player.alias = "?";
			round.push(player)
		}
		j += 2;
		global.gameplay.localTournamentInfo.playerGame.push(round);
	}
}

function matchFixMulti() {
	const randomNumArray = [];
	let j = 0;
	const players = Object.keys(global.socket.gameInfo.player)
	global.socket.gameInfo.round = players.length - 1;
	while (randomNumArray.length != players.length) {
		const randomNum = Math.floor(Math.random() * players.length)
		if (randomNumArray.every(array => {
			return array != randomNum
		}))
			randomNumArray.push(randomNum);
	}
	for (let i = 0; i < randomNumArray.length - 1; i++) {
		
		const round = [];
		for (let k = j; k < j + 2 && j < (randomNumArray.length - 1) * 2 ; k++) {
			const player = {
				alias:'',
				score:0,
				winner:false,
				cheatCount:global.gameplay.defaultCheatCount
			};
			if (randomNumArray[k] !== undefined)
				player.alias = players[randomNumArray[k]];
			else
				player.alias = "?";
			round.push(player)
		}
		j += 2;
		global.socket.gameInfo.playerGame.push(round);
	}
}

function populateWinner() {
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


function transformDesktop(newX, newY) {
	const canvas = document.querySelector(".canvas-container");
	
	canvas.style.transform = `scaleX(${newX / canvas.clientWidth}) scaleY(${newY / canvas.clientHeight})`;
}

export { updateGameSummary, updateMatchFix, matchFix, matchFixMulti, populateWinner, transformDesktop} 