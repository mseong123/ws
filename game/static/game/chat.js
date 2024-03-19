export function keyBindingChat() {
	const chatExpandDesktop = document.querySelector(".chat-expand-desktop");
	chatExpandDesktop.addEventListener("click", (e)=>{
		document.global.ui.chat? document.global.ui.chat = 0:document.global.ui.chat = 1;
	})
}