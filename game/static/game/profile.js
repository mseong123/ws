import { global } from './global.js';
import { windowResize } from './main.js';

export function keyBindingProfile() {
	const profileExpand = document.querySelector(".profile-expand");
	profileExpand.addEventListener("click", (e)=>{
		if (!global.ui.profile) {
			global.ui.profile = 1;
			global.ui.chat = 0;
			windowResize();
		}	
	})
}
