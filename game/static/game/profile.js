export function keyBindingProfile() {
	const profileExpandMobile = document.querySelector(".profile-expand-mobile");
	profileExpandMobile.addEventListener("click", (e)=>{
		document.global.ui.profile? document.global.ui.profile = 0:document.global.ui.profile = 1;
	})
	const profileExpandDesktop = document.querySelector(".profile-expand-desktop");
	profileExpandDesktop.addEventListener("click", (e)=>{
		document.global.ui.profile? document.global.ui.profile = 0:document.global.ui.profile = 1;
	})
}
