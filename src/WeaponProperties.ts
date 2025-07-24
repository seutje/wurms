export const weaponProperties: {
  [key: string]: {
    radius: number;
    damage: number;
    explosionRadius: number;
    fuse: number;
  };
} = {
  bazooka: { radius: 5, damage: 10, explosionRadius: 20, fuse: 0 },
  grenade: { radius: 5, damage: 15, explosionRadius: 20, fuse: 180 },
  mortar: { radius: 5, damage: 10, explosionRadius: 20, fuse: 0 },
  nuke: { radius: 10, damage: 25, explosionRadius: 50, fuse: 0 },
};
