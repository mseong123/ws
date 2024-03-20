export function keyBindingProfile() {
	const profileExpand = document.querySelector(".profile-expand");
	profileExpand.addEventListener("click", (e)=>{
		if (!document.global.ui.profile) {
			document.global.ui.profile = 1;
			document.global.ui.chat = 0;
		}	
	})
}
