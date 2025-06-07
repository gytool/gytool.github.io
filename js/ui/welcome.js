import { showTutorialModal } from './modals.js';

export function createWelcomeScreen() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.classList.add('space-welcome');

	const logoSvg = `
		<img loading="eager" src="./assets/vectors/logo.svg" alt="HejChat" class="space-welcome-logo" width="250" height="206">
	`;

	welcomeDiv.innerHTML += logoSvg;

    const welcomeText = document.createElement('span');
    welcomeText.classList.add('space-welcome-text');
    welcomeText.textContent = 'S čím mohu pomoci?';
    welcomeDiv.appendChild(welcomeText);
    
    const tutorialBlock = document.createElement('div');
    tutorialBlock.classList.add('welcome-tutorial-block');

	const tutorialSvg = `
		<img loading="eager" src="./assets/vectors/study.svg" alt="Study" class="welcome-tutorial-icon" width="31" height="25">
	`;

    const tutorialText = document.createElement('span');
    tutorialText.textContent = 'Sledujte náš užitečný API návod.';
    tutorialText.classList.add('welcome-tutorial-text');

    tutorialBlock.innerHTML += tutorialSvg;
    tutorialBlock.appendChild(tutorialText);
    welcomeDiv.appendChild(tutorialBlock);

    tutorialBlock.onclick = () => {
        showTutorialModal();
    };

    return welcomeDiv;
}

export function updateWelcomeScreen(messageSpace) {
    if (!messageSpace) return;

    const welcomeScreen = messageSpace.querySelector('.space-welcome');
    const hasMessages = messageSpace.querySelectorAll('.space-request, .space-response').length > 0;

    if (!hasMessages) {
        if (!welcomeScreen) {
            messageSpace.appendChild(createWelcomeScreen());
        }
    } else {
        if (welcomeScreen) {
            welcomeScreen.remove();
        }
    }
}