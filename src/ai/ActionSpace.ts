export interface Action {
  weaponChoice: number; // Index of the weapon
  angle: number;        // 0-180 degrees
  power: number;        // 0-100%
}

export const WEAPON_CHOICES = [
  'bazooka',
  'grenade',
  'mortar',
  'nuke',
];
