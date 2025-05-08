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
				<img src="./assets/vectors/link.svg" alt="Link" class="tutorial-link-icon" width="20" height="20">
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
			  navButton.innerHTML = '✓';
			  navButton.title = 'Další';
			  navButton.addEventListener('click', () => {
					currentPage++;
					renderPage(currentPage);
			  });
		 } else {
			  navButton.innerHTML = '✓';
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