export function keyBindingProfile() {
	const profileExpandPortrait = document.querySelector(".profile-expand-portrait");
	profileExpandPortrait.addEventListener("click", (e)=>{
		document.global.ui.profile? document.global.ui.profile = 0:document.global.ui.profile = 1;
	})
	const profileExpandLandscape = document.querySelector(".profile-expand-landscape");
	profileExpandLandscape.addEventListener("click", (e)=>{
		
		if (document.global.ui.profile) {
			document.global.ui.profile = 0;
			document.global.ui.chat = 1;
		}
		else {
			document.global.ui.chat = 0;
			document.global.ui.profile = 1;
		}
	})
}