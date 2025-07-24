import { describe, it, expect } from 'vitest';
import { setupKeyboardControls } from './KeyboardControls.js';

function createInputs() {
  const angle = document.createElement('input');
  angle.type = 'range';
  angle.min = '0';
  angle.max = '180';
  angle.step = '1';
  angle.value = '90';

  const power = document.createElement('input');
  power.type = 'range';
  power.min = '0';
  power.max = '100';
  power.step = '1';
  power.value = '50';

  const button = document.createElement('button');

  return { angle, power, button };
}

describe('setupKeyboardControls', () => {
  it('adjusts inputs and fires on key presses', () => {
    const { angle, power, button } = createInputs();
    let fired = false;
    button.addEventListener('click', () => {
      fired = true;
    });

    const remove = setupKeyboardControls({
      angleInput: angle,
      powerInput: power,
      fireButton: button,
      isPlanning: () => true,
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    expect(angle.value).toBe('89');
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    expect(angle.value).toBe('90');
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
    expect(power.value).toBe('51');
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
    expect(power.value).toBe('50');
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(fired).toBe(true);

    remove();
  });
});
