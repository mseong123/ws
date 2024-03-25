import {global} from './global.js';
import {windowResize} from './main.js'

export function keyBindingChat() {
	const chatExpand = document.querySelector(".chat-expand");
	chatExpand.addEventListener("click", (e)=>{
		if (!global.ui.chat) {
			global.ui.profile = 0;
			global.ui.chat = 1;
			windowResize();
		}
	})
}