export function keyBindingMultiplayer() {
	const multi = document.querySelector(".nav-multi");
	multi.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 0;
		document.global.ui.multi = 1;
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
	const loginBack = document.querySelector(".login-back");
	loginBack.addEventListener("click", (e)=>{
		document.global.ui.mainMenu = 1;
		document.global.ui.login = 0;
	})
	const loginSubmit = document.querySelector(".login");
	loginSubmit.addEventListener("submit", (e)=>{
		e.preventDefault();
	})
}