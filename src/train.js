"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
var tf = require("@tensorflow/tfjs-core");
require("@tensorflow/tfjs-node"); // Use tfjs-node for headless environment
var kontra_1 = require("kontra");
var Terrain_1 = require("./Terrain");
var Projectile_1 = require("./Projectile");
var Wurm_1 = require("./Wurm");
var DQNModel_1 = require("./ai/DQNModel");
var ObservationSpace_1 = require("./ai/ObservationSpace");
var ActionSpace_1 = require("./ai/ActionSpace");
var RewardFunction_1 = require("./ai/RewardFunction");
// Setup JSDOM for Kontra.js headless environment
var dom = new jsdom_1.JSDOM("<!DOCTYPE html><body><canvas id=\"game\"></canvas></body>");
global.window = dom.window;
global.document = dom.window.document;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.Image = dom.window.Image;
var canvas = dom.window.document.getElementById('game');
canvas.width = 800;
canvas.height = 600;
(0, kontra_1.init)(canvas);
// Game setup (similar to main.ts)
var terrain = new Terrain_1.Terrain(canvas.width, canvas.height);
var playerWurm = new Wurm_1.Wurm(100, 100, 100, 'blue');
var aiWurm = new Wurm_1.Wurm(canvas.width - 100, 100, 100, 'green');
var projectiles = [];
// DQN Model setup
var observationSpaceSize = 6 + (canvas.width / 20); // 6 for wurm data + terrain heights
var actionSpaceSize = ActionSpace_1.WEAPON_CHOICES.length * 10 * 10; // weapon * angle_bins * power_bins (simplified)
var dqnModel = new DQNModel_1.DQNModel([observationSpaceSize], actionSpaceSize);
// Training parameters
var numEpisodes = 100;
var epsilonDecay = 0.995;
var epsilon = 1.0; // Exploration-exploitation trade-off
function train() {
    return __awaiter(this, void 0, void 0, function () {
        var episode, done, totalReward, observation, actionIndex, prediction, weaponIdx, angleBin, powerBin, angle, power, weaponProperties, weaponName, _a, radius, damage, startX, startY, radians, velX, velY, projectile, allProjectilesResolved, i, p, hitEnemy, hitSelf, gameEnded, playerWon, aiWon, reward, target;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    episode = 0;
                    _b.label = 1;
                case 1:
                    if (!(episode < numEpisodes)) return [3 /*break*/, 6];
                    // Reset game state for new episode
                    playerWurm.health = 100;
                    aiWurm.health = 100;
                    projectiles.length = 0;
                    done = false;
                    totalReward = 0;
                    _b.label = 2;
                case 2:
                    if (!!done) return [3 /*break*/, 4];
                    observation = (0, ObservationSpace_1.getObservation)(playerWurm, aiWurm, terrain);
                    actionIndex = void 0;
                    if (Math.random() < epsilon) {
                        // Explore: choose random action
                        actionIndex = Math.floor(Math.random() * actionSpaceSize);
                    }
                    else {
                        prediction = dqnModel.predict(observation);
                        actionIndex = tf.argMax(prediction).dataSync()[0];
                    }
                    weaponIdx = Math.floor(actionIndex / (10 * 10));
                    angleBin = Math.floor((actionIndex % 100) / 10);
                    powerBin = actionIndex % 10;
                    angle = angleBin * 18;
                    power = powerBin * 10;
                    weaponProperties = {
                        bazooka: { radius: 10, damage: 30 },
                        grenade: { radius: 20, damage: 40 },
                        mortar: { radius: 15, damage: 35 },
                        nuke: { radius: 50, damage: 100 },
                    };
                    weaponName = ActionSpace_1.WEAPON_CHOICES[weaponIdx];
                    _a = weaponProperties[weaponName], radius = _a.radius, damage = _a.damage;
                    startX = playerWurm.x;
                    startY = playerWurm.y;
                    radians = angle * Math.PI / 180;
                    velX = power * Math.cos(radians) * 0.1;
                    velY = power * Math.sin(radians) * -0.1;
                    projectile = new Projectile_1.Projectile(startX, startY, velX, velY, radius, damage);
                    projectiles.push(projectile);
                    allProjectilesResolved = false;
                    while (!allProjectilesResolved) {
                        allProjectilesResolved = true;
                        for (i = projectiles.length - 1; i >= 0; i--) {
                            p = projectiles[i];
                            p.update();
                            if (terrain.isColliding(p.x, p.y)) {
                                terrain.destroy(p.x, p.y, p.radius);
                                projectiles.splice(i, 1);
                                // Apply damage to wurms
                                if (playerWurm.collidesWith(p)) {
                                    playerWurm.takeDamage(p.damage);
                                }
                                if (aiWurm.collidesWith(p)) {
                                    aiWurm.takeDamage(p.damage);
                                }
                            }
                            else if (p.x < 0 || p.x > canvas.width || p.y > canvas.height) {
                                projectiles.splice(i, 1);
                            }
                            else {
                                allProjectilesResolved = false;
                            }
                        }
                    }
                    hitEnemy = aiWurm.health < 100;
                    hitSelf = playerWurm.health < 100;
                    gameEnded = playerWurm.health <= 0 || aiWurm.health <= 0;
                    playerWon = aiWurm.health <= 0 && playerWurm.health > 0;
                    aiWon = playerWurm.health <= 0 && aiWurm.health > 0;
                    reward = (0, RewardFunction_1.calculateReward)(playerWurm, aiWurm, hitEnemy, hitSelf, gameEnded, playerWon, aiWon);
                    totalReward += reward;
                    target = tf.tensor1d([reward]);
                    return [4 /*yield*/, dqnModel.train(dqnModel.predict(observation), target)];
                case 3:
                    _b.sent();
                    if (gameEnded) {
                        done = true;
                    }
                    return [3 /*break*/, 2];
                case 4:
                    epsilon *= epsilonDecay;
                    console.log("Episode ".concat(episode + 1, ": Total Reward = ").concat(totalReward, ", Epsilon = ").concat(epsilon.toFixed(2)));
                    _b.label = 5;
                case 5:
                    episode++;
                    return [3 /*break*/, 1];
                case 6: 
                // Save the trained model
                return [4 /*yield*/, dqnModel.save('file://./src/models/dqn-model')];
                case 7:
                    // Save the trained model
                    _b.sent();
                    console.log('Model trained and saved.');
                    return [2 /*return*/];
            }
        });
    });
}
train();
