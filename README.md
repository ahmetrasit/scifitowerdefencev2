# Sci-Fi Tower Defense v2

A real-time tower defense/automation game with resource management, tech progression, and automated defense systems.

## Game Overview

Defend your base against waves of enemy robots while building an automated resource empire. Features:

- **Real-time Combat**: Play as a character who can move, shoot, and mount turrets
- **Automation Systems**: Collector vehicles and mining robots for resource gathering
- **Resource Processing**: Complex crafting chains with 50+ recipes
- **Tech Tree**: 35+ research nodes unlocking new weapons, buildings, and upgrades
- **Power Management**: Grid-based power system with multiple generator types
- **Wave Defense**: Progressive difficulty with boss waves every 10 rounds
- **Progressive Web App**: Playable offline with mobile support

## Documentation

This repository contains comprehensive pseudocode documentation for implementing the complete game:

- **[docs/README-PSEUDOCODE.md](docs/README-PSEUDOCODE.md)**: Quick start guide and implementation overview
- **[docs/game-pseudocode-complete.md](docs/game-pseudocode-complete.md)**: Complete game documentation with all systems
- **[docs/game-pseudocode-detailed-sections.md](docs/game-pseudocode-detailed-sections.md)**: Detailed sections 7-10 (Power, Progression, Map, UI)
- **[docs/sci-fi-td-complete-pseudocode.md](docs/sci-fi-td-complete-pseudocode.md)**: Full implementation pseudocode with databases

## Game Systems

### Core Systems (Sections 1-2)
- Game Management & State
- Resource Manager
- Player Movement & Combat
- Turret Mounting

### Enemy Systems (Section 3)
- Wave Manager with Dynamic Difficulty
- Enemy AI & Pathfinding
- Boss Mechanics
- 5 Enemy Types (Swarm, Tank, Runner, Support, Boss)

### Combat Systems (Section 4)
- Damage Calculation
- Weapon Systems (10+ weapon types)
- Automated Turrets
- Super Weapons (Artillery, Plasma Accelerator, Black Hole Generator, EMP)

### Automation Systems (Section 5)
- Collector Vehicles
- Mining Robots
- Processing Chains (50+ recipes)
- Resource Transportation

### Building Systems (Section 6)
- Grid-based Placement
- 15+ Building Types
- Building Health & Repair
- Territory Control

### Power Systems (Section 7)
- Power Grid Network
- Multiple Generator Types (Coal, Solar, Nuclear, Fuel Cell)
- Power Distribution & Efficiency
- Accumulator Storage

### Progression Systems (Section 8)
- Tech Tree (35 nodes across 5 tiers)
- Research Labs
- Achievement System (10+ achievements)
- Cosmetic Unlocks

### Map Systems (Section 9)
- Procedural Map Generation
- Ore Deposit Placement
- Spawn Point System
- Map Editor (optional)

### UI Systems (Section 10)
- HUD (Health, Resources, Wave Info)
- Building Toolbar
- Minimap
- Tech Tree UI
- Achievement Notifications

## Technology Stack

- **Language**: JavaScript/TypeScript
- **Rendering**: HTML5 Canvas
- **Architecture**: Entity-Component System
- **Storage**: LocalStorage + IndexedDB
- **PWA**: Service Worker for offline play

## Implementation Priority

1. Core Systems (Game Manager, Resource Manager)
2. Grid & Map (Pathfinding foundation)
3. Player (Movement, shooting)
4. Enemies (Basic enemy, wave spawning)
5. Combat (Projectiles, damage)
6. Buildings (Placement, turrets)
7. Automation (Collectors)
8. Power (Grid system)
9. Processing (Resource chains)
10. Tech Tree (Research)
11. Polish (UI, effects, balance)

## Project Structure

```
/src
  /core        # GameManager, SaveSystem, ResourceManager
  /entities    # Player, Enemy, Building, Projectile
  /systems     # Combat, Power, Pathfinding, Resources
  /ui          # HUD, Toolbar, Minimap, TechTree
  /data        # Recipes, TechTree, BuildingStats
  /utils       # Vector2, Grid, Effects
```

## Key Features

- **No Graphics Required**: Uses special effects, shapes, and colors for visuals
- **Mobile-Friendly**: Touch controls and responsive design
- **Offline Play**: Full PWA support with service worker
- **Save System**: Auto-save with manual save/load
- **Balanced Progression**: 100+ waves of content
- **Replayability**: Random map generation, achievement hunting

## Getting Started

See [docs/README-PSEUDOCODE.md](docs/README-PSEUDOCODE.md) for implementation instructions and architecture details.

## License

MIT License - See LICENSE file for details
