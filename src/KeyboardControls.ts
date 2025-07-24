export interface KeyboardControlOptions {
  angleInput: HTMLInputElement;
  powerInput: HTMLInputElement;
  fireButton: HTMLButtonElement;
  isPlanning: () => boolean;
}

export function setupKeyboardControls({
  angleInput,
  powerInput,
  fireButton,
  isPlanning,
}: KeyboardControlOptions): () => void {
  const handler = (e: KeyboardEvent) => {
    if (!isPlanning()) return;
    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        angleInput.stepDown();
        angleInput.dispatchEvent(new Event('input'));
        break;
      case 'ArrowRight':
        e.preventDefault();
        angleInput.stepUp();
        angleInput.dispatchEvent(new Event('input'));
        break;
      case 'ArrowUp':
        e.preventDefault();
        powerInput.stepUp();
        powerInput.dispatchEvent(new Event('input'));
        break;
      case 'ArrowDown':
        e.preventDefault();
        powerInput.stepDown();
        powerInput.dispatchEvent(new Event('input'));
        break;
      case 'Space':
        e.preventDefault();
        fireButton.click();
        break;
    }
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}
