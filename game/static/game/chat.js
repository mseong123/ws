export function keyBindingChat() {
	const chatExpand = document.querySelector(".chat-expand");
	chatExpand.addEventListener("click", (e)=>{
		if (!document.global.ui.chat) {
			document.global.ui.profile = 0;
			document.global.ui.chat = 1;
		}
	})
}