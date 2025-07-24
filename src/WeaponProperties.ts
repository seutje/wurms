export const weaponProperties: {
  [key: string]: {
    radius: number;
    damage: number;
    explosionRadius: number;
    fuse: number;
    cluster: number;
  };
} = {
  bazooka: { radius: 5, damage: 10, explosionRadius: 20, fuse: 0, cluster: 0 },
  grenade: { radius: 5, damage: 15, explosionRadius: 20, fuse: 180, cluster: 0 },
  mortar: { radius: 5, damage: 10, explosionRadius: 20, fuse: 0, cluster: 3 },
  nuke: { radius: 10, damage: 25, explosionRadius: 50, fuse: 0, cluster: 0 },
  clusterGrenade: {
    radius: 5,
    damage: 7.5,
    explosionRadius: 20,
    fuse: 180,
    cluster: 3,
  },
};
