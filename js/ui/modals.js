export function showTutorialModal() {
	let overlay = document.getElementById('tutorial-overlay');
	if (overlay) return;
	
	overlay = document.createElement('div');
	overlay.id = 'tutorial-overlay';
	overlay.className = 'modal-overlay';
	document.body.appendChild(overlay);
	
	const tutorialModal = document.createElement('div');
	tutorialModal.id = 'tutorial-modal';
	
	const closeButton = document.createElement('button');
	closeButton.textContent = '✕';
	closeButton.className = 'tutorial-close-button';
	
	closeButton.addEventListener('click', () => {
		 overlay.parentNode.removeChild(overlay);
	});
	
	tutorialModal.appendChild(closeButton);
	
	const contentContainer = document.createElement('div');
	contentContainer.className = 'tutorial-content-container';
	
	const pages = [
		 {
			  title: 'Krok 1: Registrace na OpenRouter',
			  content: 'Nejprve přejděte na web OpenRouter a zaregistrujte se pro vytvoření účtu.',
			  link: 'https://openrouter.ai/sign-up',
			  linkText: 'openrouter.ai/sign-up',
			  image: './assets/rasters/openrouter_signup.png'
		 },
		 {
			  title: 'Krok 2: Vytvoření API klíče',
			  content: 'V nastavení vašeho OpenRouter účtu vytvořte nový API klíč.',
			  link: 'https://openrouter.ai/settings/keys',
			  linkText: 'openrouter.ai/settings/keys',
			  image: './assets/rasters/openrouter_key.png'
		 },
		 {
			  title: 'Krok 3: Vložení API klíče do HejChat',
			  content: 'Zkopírujte vytvořený API klíč a vložte jej do HejChat v sekci API.',
			  image: './assets/rasters/hejchat_api.png'
		 }
	];
	
	let currentPage = 0;
	
	function renderPage(pageIndex) {
		 const page = pages[pageIndex];
		 contentContainer.innerHTML = '';
		 
		 const pageContent = document.createElement('div');
		 pageContent.className = 'tutorial-page';
		 
		 const titleEl = document.createElement('h2');
		 const titleText = page.title.replace(/^(Krok \d+:)/, '$1<br>');
		 titleEl.innerHTML = titleText;
		 titleEl.className = 'tutorial-title';
		 
		 const contentEl = document.createElement('p');
		 contentEl.textContent = page.content;
		 contentEl.className = 'tutorial-description';

		 const contentArea = document.createElement('div');
		 contentArea.className = 'tutorial-content-area';
		 
		 contentArea.appendChild(titleEl);
		 contentArea.appendChild(contentEl);
		 
		 if (page.image) {
			  const imageContainer = document.createElement('div');
			  imageContainer.className = 'tutorial-image-container';
			  
			  const imageEl = document.createElement('img');
			  imageEl.src = page.image;
			  imageEl.alt = `Ilustrace ke kroku ${pageIndex + 1}`;
			  imageEl.className = 'tutorial-image';
			  imageEl.loading = 'eager';

			  imageContainer.appendChild(imageEl);
			  contentArea.appendChild(imageContainer);
		 }
		 
		 pageContent.appendChild(contentArea);
		 
		 const footerContainer = document.createElement('div');
		 footerContainer.className = 'tutorial-footer';

		 const buttonsContainer = document.createElement('div');
		 buttonsContainer.className = 'tutorial-buttons-container';

		 if (page.link) {
			  const linkBtn = document.createElement('a');
			  
			  let linkText = '';
			  if (pageIndex === 0) {
					linkText = 'Registrovat';
			  } else if (pageIndex === 1) {
					linkText = 'Vytvořit klíč';
			  }
			  
			  const linkTextSpan = document.createElement('span');
			  linkTextSpan.textContent = linkText;

			const svgIcon = `
				<img loading="eager" src="./assets/vectors/link.svg" alt="Link" class="tutorial-link-icon" width="20" height="20">
			`;
			  
			  linkBtn.href = page.link;
			  linkBtn.target = '_blank';
			  linkBtn.className = 'tutorial-external-link';

			  linkBtn.appendChild(linkTextSpan);
			  linkBtn.innerHTML += svgIcon;
			  
			  buttonsContainer.appendChild(linkBtn);
		 }

		 const navButton = document.createElement('button');
		 navButton.className = 'tutorial-nav-button';

		 if (pageIndex < pages.length - 1) {
			  navButton.innerHTML = `
			  	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30" fill="none">
					<path d="M38.7359 1.02394C39.4585 1.70707 39.8803 2.6492 39.9084 3.64319C39.9365 4.63718 39.5688 5.60165 38.8859 6.32455L17.6335 28.8272C17.2891 29.1912 16.8751 29.4825 16.4162 29.6839C15.9573 29.8853 15.4626 29.9926 14.9615 29.9996C14.4604 30.0066 13.963 29.9131 13.4986 29.7246C13.0342 29.5361 12.6123 29.2565 12.2579 28.9022L1.00658 17.6509C0.344099 16.9399 -0.0165588 15.9996 0.000584302 15.0279C0.0177274 14.0563 0.411333 13.1293 1.09848 12.4422C1.78562 11.755 2.71265 11.3614 3.68427 11.3443C4.65589 11.3271 5.59623 11.6878 6.30719 12.3502L14.8332 20.8712L33.4353 1.17396C34.1184 0.451362 35.0606 0.0296347 36.0546 0.00150289C37.0486 -0.0266289 38.013 0.341138 38.7359 1.02394Z" fill="white"/>
				</svg>
			  `;
			  navButton.title = 'Další';
			  navButton.addEventListener('click', () => {
					currentPage++;
					renderPage(currentPage);
			  });
		 } else {
			  navButton.innerHTML = `
			 	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30" fill="none">
					<path d="M38.7359 1.02394C39.4585 1.70707 39.8803 2.6492 39.9084 3.64319C39.9365 4.63718 39.5688 5.60165 38.8859 6.32455L17.6335 28.8272C17.2891 29.1912 16.8751 29.4825 16.4162 29.6839C15.9573 29.8853 15.4626 29.9926 14.9615 29.9996C14.4604 30.0066 13.963 29.9131 13.4986 29.7246C13.0342 29.5361 12.6123 29.2565 12.2579 28.9022L1.00658 17.6509C0.344099 16.9399 -0.0165588 15.9996 0.000584302 15.0279C0.0177274 14.0563 0.411333 13.1293 1.09848 12.4422C1.78562 11.755 2.71265 11.3614 3.68427 11.3443C4.65589 11.3271 5.59623 11.6878 6.30719 12.3502L14.8332 20.8712L33.4353 1.17396C34.1184 0.451362 35.0606 0.0296347 36.0546 0.00150289C37.0486 -0.0266289 38.013 0.341138 38.7359 1.02394Z" fill="white"/>
				</svg> 
			  `;
			  navButton.title = 'Dokončit';
			  navButton.addEventListener('click', () => {
					overlay.parentNode.removeChild(overlay);
			  });
		 }
		 
		 buttonsContainer.appendChild(navButton);
		 
		 footerContainer.appendChild(buttonsContainer);
		 pageContent.appendChild(footerContainer);
		 
		 contentContainer.appendChild(pageContent);
	}
	
	renderPage(currentPage);
	
	tutorialModal.appendChild(contentContainer);
	overlay.appendChild(tutorialModal);
	
	overlay.addEventListener('click', (event) => {
		 if (event.target === overlay) {
			  overlay.parentNode.removeChild(overlay);
		 }
	});
}