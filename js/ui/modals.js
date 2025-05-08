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
			  
			  const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			  svgIcon.classList.add('tutorial-link-icon');
			  svgIcon.setAttribute('width', '20');
			  svgIcon.setAttribute('height', '20');
			  svgIcon.setAttribute('viewBox', '0 0 20 20');
			  svgIcon.setAttribute('fill', 'none');
			  svgIcon.innerHTML = `
					<path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" stroke-width="1.25" stroke-miterlimit="10"></path>
					<path d="M8.4375 7.97925H12.1875V11.7292" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
					<path d="M7.5 12.875L11.875 8.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
			  `;
			  
			  linkBtn.href = page.link;
			  linkBtn.target = '_blank';
			  linkBtn.className = 'tutorial-external-link';

			  linkBtn.appendChild(linkTextSpan);
			  linkBtn.appendChild(svgIcon);
			  
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