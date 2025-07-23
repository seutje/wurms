# Wurms: Game Development Plan

## 1. Project Overview

"Wurms" is a 2D turn-based artillery game, a clone of the classic "Worms". It will feature two players (one human, one AI) controlling "wurms" on a destructible, randomly generated terrain. The core of the project is the AI controller, which will be powered by a Reinforcement Learning (RL) model trained to play the game effectively. The game will be built using web technologies.

## 2. Core Gameplay Mechanics

### 2.1. Turn Structure
The game is turn-based in a 1v1 format. However, it follows a "simultaneous execution" model.
1.  **Planning Phase:** Both the player and the AI controller select their weapon, aim angle, and shot power for their respective wurm.
2.  **Lock-in:** Once choices are made, they are locked in.
3.  **Execution Phase:** Both wurms fire their projectiles simultaneously.
4.  **Resolution Phase:** The game state is updated based on the results of the shots (damage, terrain destruction, etc.).
5.  The cycle repeats until a win condition is met.

### 2.2. Player/AI Controls
Each wurm has three primary controls per turn:
*   **Weapon Selection:** A choice from a list of available weapons.
*   **Angle:** The launch angle of the projectile (e.g., 0-180 degrees).
*   **Power:** The launch power of the projectile (e.g., 0-100%).

### 2.3. Physics Engine
A simple 2D physics engine will be implemented to handle:
*   **Projectile Motion:** Standard parabolic trajectory (`x = v*t*cos(a)`, `y = v*t*sin(a) - 0.5*g*t^2`).
*   **Collisions:** Detection between projectiles and terrain, and projectiles and wurms.
*   **Wurm Movement:** Basic physics for falling if the ground beneath a wurm is destroyed.

### 2.4. Destructible Terrain
*   **Generation:** The terrain will be generated using a seeded noise algorithm (e.g., Perlin noise) to create interesting and varied landscapes. The seed will allow for reproducible maps.
*   **Representation:** The terrain can be represented by a 2D array or a bitmap. A bitmap would be easier for pixel-perfect destruction.
*   **Destruction:** When a projectile explodes, it will remove a circular area of the terrain at the point of impact. The size of the circle depends on the weapon.

### 2.5. Weapons
A variety of weapons will be available, each with different properties:
*   **Bazooka:** Standard projectile with a medium-sized explosion.
*   **Grenade:** Bouncing projectile with a timed fuse.
*   **Mortar:** Projectile that splits into multiple smaller projectiles on impact.
*   **Nuke:** A powerful, single-use weapon with a very large explosion radius.

### 2.6. Winning/Losing Conditions
*   The game ends when one wurm's health is reduced to zero.
*   The wurm with remaining health is the winner.
*   A draw can occur if both wurms are eliminated in the same turn.

## 3. AI (RL Controller)

The AI will be trained using Reinforcement Learning to learn how to play the game.

### 3.1. Model
We will use a library like TensorFlow.js. A policy-based method like Proximal Policy Optimization (PPO) is a good candidate, but we could start with a simpler value-based method like Deep Q-Network (DQN).

### 3.2. Observation Space (State)
The input to the RL model at each step. This needs to represent the game state concisely. It could include:
*   Position of the AI's wurm.
*   Position of the enemy wurm.
*   Health of both wurms.
*   A simplified representation of the terrain (e.g., a down-sampled grid around the wurms).
*   Available weapons.

### 3.3. Action Space
The output of the RL model. This will be a set of continuous or discretized values for the controls:
*   **Weapon Choice:** A discrete value (e.g., 0 for Bazooka, 1 for Grenade).
*   **Angle:** A continuous value (0-180) or discretized into bins.
*   **Power:** A continuous value (0-100) or discretized into bins.

### 3.4. Reward Function
The reward function is crucial for training. It will guide the AI's learning process.
*   **Positive Rewards:**
    *   Large reward for winning the game.
    *   Medium reward for hitting the enemy wurm.
    *   Small reward for getting closer to the enemy.
*   **Negative Rewards:**
    *   Large negative reward for losing the game.
    *   Medium negative reward for taking damage.
    *   Small negative reward for self-damage.
    *   Small negative reward for missing a shot.

### 3.5. Training Process
*   A script will be created, runnable via `npm run train <num_generations>`.
*   This script will run the game in a headless mode (or a very fast, non-rendered mode).
*   It will pit two AI agents against each other for a specified number of generations/episodes.
*   The agents will explore different strategies and learn from the outcomes based on the reward function.
*   The model with the best performance (e.g., highest average reward or win rate) will be saved.

### 3.6. Model Management
*   The trained models will be saved to the `/src/models/` directory.
*   The game will load the latest/best model from this directory to use for the AI opponent in the main game.

## 4. Technical Stack

*   **Language:** TypeScript (for type safety and better code organization).
*   **Rendering:** HTML5 `<canvas>` API. We can use a lightweight library like `p5.js` or `kontra.js` to simplify rendering and game loop management, or write it from scratch for more control.
*   **AI/ML:** `TensorFlow.js`.
*   **Build Tool:** `Vite` or `Webpack` for bundling and development server.
*   **Package Manager:** `npm`.

## 5. Game Structure & UI Flow

### 5.1. Start Screen
*   Displays the game title "Wurms".
*   Features a "Start Game" button.
*   In the background, two AI agents will continuously play against each other on a randomly generated map. This serves as a dynamic background and a demonstration of the game. The game will reset every time a match ends.

### 5.2. Game Screen
*   The main game view.
*   Displays the terrain, wurms, health bars, and current weapon selection.
*   UI elements for the player to select weapon, angle, and power.
*   A "Fire!" button to lock in the choices for the turn.

### 5.3. Game Over Screen
*   Appears when the game ends.
*   Displays "You Win!", "You Lose!", or "Draw!".
*   A "Play Again" button to return to the Start Screen.

### 5.4. Sound Design
*   Simple sound effects will be implemented using the Web Audio API.
*   Sounds for:
    *   Weapon firing.
    *   Projectile explosion.
    *   Wurm taking damage.
    *   UI button clicks.

## 6. Development Roadmap

### Milestone 1: Basic Game Engine (1-2 weeks)
*   [ ] Setup project with TypeScript, Vite/Webpack.
*   [ ] Implement the main game loop.
*   [ ] Create the terrain generation and rendering system.
*   [ ] Implement the terrain destruction logic.
*   [ ] Implement the physics for projectile motion.

### Milestone 2: Core Gameplay (1 week)
*   [ ] Implement player controls for weapon, angle, and power.
*   [ ] Implement the turn-based structure (planning, execution, resolution).
*   [ ] Add wurm entities with health.
*   [ ] Implement damage calculation and win/loss conditions.
*   [ ] Add multiple weapon types.

### Milestone 3: AI Implementation (2-3 weeks)
*   [ ] Create a simple "random" AI that chooses actions randomly.
*   [ ] Define the observation and action spaces for the RL model.
*   [ ] Integrate TensorFlow.js into the project.
*   [ ] Build the RL model (DQN or PPO).
*   [ ] Implement the reward function.
*   [ ] Create the training script (`npm run train`).
*   [ ] Implement model saving and loading.

### Milestone 4: UI/UX and Polish (1 week)
*   [ ] Design and implement the Start Screen with the AI vs AI demo.
*   [ ] Design and implement the Game Over Screen.
*   [ ] Add sound effects using the Web Audio API.
*   [ ] Refine UI elements and overall presentation.

### Milestone 5: Testing and Deployment (1 week)
*   [ ] Thoroughly test the game for bugs.
*   [ ] Balance weapons and gameplay.
*   [ ] Refine the AI model through more training.
*   [ ] Prepare for deployment (e.g., to GitHub Pages).
