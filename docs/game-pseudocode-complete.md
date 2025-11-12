# Sci-Fi Tower Defense/Automation Game
## Complete Pseudocode Documentation

**Game Summary**: Defend your base against waves of enemy robots in real-time. Play as a character who can move, shoot, and mount turrets while building an automated resource empire. Features include resource gathering, processing chains, tech tree progression, power management, and territory defense mechanics.

---

## TABLE OF CONTENTS

### PART 1 - CORE & PLAYER (Sections 1-2)
- Game Management, State, Resources
- Player Movement, Combat, Turret Mounting

### PART 2 - ENEMIES (Section 3)
- Wave System, AI, Pathfinding, Boss Mechanics

### PART 3 - COMBAT (Section 4)
- Damage Calculation, Weapons, Turrets, Super Weapons

### PART 4 - AUTOMATION (Section 5)
- Collectors, Miners, Processing Chains

### PART 5 - BUILDINGS (Section 6)
- Placement System, Building Types, Grid

### PART 6 - POWER & PROGRESSION (Sections 7-8)
- Power Grid, Tech Tree, Research, Achievements

### PART 7 - MAP & UI (Sections 9-10)
- Map Generation, Terrain, UI Systems

---

## IMPLEMENTATION GUIDE

### Quick Start for Claude Code Agent

**Priority Implementation Order:**
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

### Key Data Structures

```javascript
// Core game loop
GameManager {
  - state: GameState
  - waveManager, resourceManager, powerManager, buildingManager
  - update(deltaTime)
  - saveSystem
}

// Essential classes
Player, Enemy, Building, Projectile, CollectorCar, MiningRobot

// Systems
PathfindingSystem, PowerGridSystem, TechTreeSystem, ResourceProcessingSystem
```

### File Structure Recommendation

```
/src
  /core (GameManager, SaveSystem)
  /entities (Player, Enemy, Building)
  /systems (Combat, Power, Pathfinding, Resources)
  /ui (HUD, Toolbar, Minimap)
  /data (Recipes, TechTree, BuildingStats)
  /utils (Vector2, Grid, Effects)
```

---

## DETAILED PSEUDOCODE SECTIONS

## 1. CORE GAME SYSTEMS

### 1.1 Game Manager

```javascript
class GameManager {
    state: GameState
    waveManager: WaveManager
    resourceManager: ResourceManager
    powerManager: PowerManager
    buildingManager: BuildingManager
    techTreeManager: TechTreeManager

    constructor() {
        this.state = new GameState()
        this.waveManager = new WaveManager()
        this.resourceManager = new ResourceManager()
        this.powerManager = new PowerManager()
        this.buildingManager = new BuildingManager()
        this.techTreeManager = new TechTreeManager()
    }

    function update(deltaTime: float) {
        // Update all game systems
        this.waveManager.update(deltaTime)
        this.powerManager.update(deltaTime)
        this.resourceManager.update(deltaTime)
        this.state.player.update(deltaTime)

        // Update all entities
        for (enemy in this.state.enemies) {
            enemy.update(deltaTime)
        }

        for (building in this.state.buildings) {
            building.update(deltaTime)
        }

        for (projectile in this.state.projectiles) {
            projectile.update(deltaTime)
        }

        for (collector in this.state.collectors) {
            collector.update(deltaTime)
        }

        // Check game over conditions
        this.checkVictoryDefeat()
    }

    function checkVictoryDefeat() {
        if (this.state.coreBuilding.health <= 0) {
            this.gameOver(false)
        }
    }

    function gameOver(victory: boolean) {
        this.state.gameActive = false
        UI.showGameOverScreen(victory, this.state.stats)
    }
}
```

### 1.2 Game State

```javascript
class GameState {
    gameActive: boolean = true
    currentWave: int = 0

    player: Player
    coreBuilding: Core

    enemies: array<Enemy> = []
    buildings: array<Building> = []
    projectiles: array<Projectile> = []
    collectors: array<CollectorCar> = []
    miners: array<MiningRobot> = []

    resources: Dictionary<ResourceType, int> = {}

    stats: GameStats = {
        enemiesKilled: 0,
        wavesCompleted: 0,
        buildingsBuilt: 0,
        researchCompleted: 0,
        bossesKilled: 0,
        resourcesGathered: 0,
        damageDealt: 0,
        playtime: 0
    }

    constructor() {
        this.player = new Player(new Vector2(0, 0))
        this.coreBuilding = new Core(new Vector2(0, 0))
        this.buildings.push(this.coreBuilding)
    }
}
```

### 1.3 Resource Manager

```javascript
enum ResourceType {
    // Raw Materials (dropped by enemies)
    SCRAP_METAL,
    ELECTRONIC_COMPONENT,
    ENERGY_CELL,
    RARE_MINERAL,

    // Mined Resources
    COAL,
    IRON_ORE,
    SILICON,
    URANIUM,

    // Processed Materials
    METALLIC_PLATE,
    STEEL_PLATE,
    CIRCUIT_BOARD,
    PROCESSING_UNIT,
    ADVANCED_CHIP,

    // Intermediate Components
    WIRING_BUNDLE,
    CAPACITOR,
    WEAPON_COMPONENT,
    ARMOR_PLATE,
    PLASMA_CORE,
    QUANTUM_PROCESSOR,

    // Ammunition
    BASIC_MAGAZINE,
    ADVANCED_MAGAZINE,
    GUNPOWDER,
    ROCKET,
    ENERGY_PACK,
    FUEL_CELL
}

class ResourceManager {
    resources: Dictionary<ResourceType, int> = {}
    maxStorage: Dictionary<ResourceType, int> = {}

    constructor() {
        // Initialize all resources to 0
        for (type in ResourceType) {
            this.resources[type] = 0
            this.maxStorage[type] = 1000
        }
    }

    function addResource(type: ResourceType, amount: int) {
        int currentAmount = this.resources[type]
        int maxAmount = this.maxStorage[type]

        this.resources[type] = min(currentAmount + amount, maxAmount)

        gameManager.state.stats.resourcesGathered += amount
    }

    function removeResource(type: ResourceType, amount: int): boolean {
        if (this.resources[type] >= amount) {
            this.resources[type] -= amount
            return true
        }
        return false
    }

    function hasResources(requirements: Dictionary<ResourceType, int>): boolean {
        for (type, amount in requirements) {
            if (this.resources[type] < amount) {
                return false
            }
        }
        return true
    }

    function consumeResources(requirements: Dictionary<ResourceType, int>): boolean {
        if (!this.hasResources(requirements)) {
            return false
        }

        for (type, amount in requirements) {
            this.removeResource(type, amount)
        }

        return true
    }

    function getResourceAmount(type: ResourceType): int {
        return this.resources[type]
    }
}
```

---

## 2. PLAYER SYSTEMS

### 2.1 Player Character

```javascript
class Player {
    position: Vector2
    velocity: Vector2 = new Vector2(0, 0)
    rotation: float = 0

    maxHealth: int = 100
    health: int = 100

    speed: float = 5.0
    currentWeapon: Weapon

    isMountedOnTurret: boolean = false
    mountedTurret: Turret = null

    constructor(startPos: Vector2) {
        this.position = startPos
        this.currentWeapon = new Weapon(WeaponType.BASIC_RIFLE)
    }

    function update(deltaTime: float) {
        if (this.isMountedOnTurret) {
            this.updateMountedControls(deltaTime)
        } else {
            this.updateMovement(deltaTime)
            this.updateRotation()
            this.updateShooting(deltaTime)
        }

        this.currentWeapon.update(deltaTime)
    }

    function updateMovement(deltaTime: float) {
        Vector2 inputDir = new Vector2(0, 0)

        if (Input.isKeyPressed(KEY_W)) inputDir.y -= 1
        if (Input.isKeyPressed(KEY_S)) inputDir.y += 1
        if (Input.isKeyPressed(KEY_A)) inputDir.x -= 1
        if (Input.isKeyPressed(KEY_D)) inputDir.x += 1

        if (inputDir.length() > 0) {
            inputDir = inputDir.normalized()
            this.velocity = inputDir * this.speed
        } else {
            this.velocity = new Vector2(0, 0)
        }

        this.position += this.velocity * deltaTime
    }

    function updateRotation() {
        Vector2 mousePos = Input.getMouseWorldPosition()
        Vector2 direction = mousePos - this.position
        this.rotation = atan2(direction.y, direction.x)
    }

    function updateShooting(deltaTime: float) {
        if (Input.isMouseButtonPressed(MOUSE_LEFT)) {
            this.currentWeapon.fire(this.position, this.rotation)
        }
    }

    function updateMountedControls(deltaTime: float) {
        // Control turret rotation
        Vector2 mousePos = Input.getMouseWorldPosition()
        Vector2 direction = mousePos - this.mountedTurret.position
        this.mountedTurret.rotation = atan2(direction.y, direction.x)

        // Shoot from turret
        if (Input.isMouseButtonPressed(MOUSE_LEFT)) {
            this.mountedTurret.manualFire()
        }

        // Dismount
        if (Input.isKeyJustPressed(KEY_E)) {
            this.dismountTurret()
        }
    }

    function attemptMountTurret() {
        float mountRange = 2.0

        for (building in gameManager.state.buildings) {
            if (building.type == BuildingType.TURRET) {
                Turret turret = building as Turret
                float distance = (turret.position - this.position).length()

                if (distance <= mountRange && !turret.isManned) {
                    this.mountTurret(turret)
                    break
                }
            }
        }
    }

    function mountTurret(turret: Turret) {
        this.isMountedOnTurret = true
        this.mountedTurret = turret
        turret.isManned = true
        turret.manualControl = true
    }

    function dismountTurret() {
        this.isMountedOnTurret = false
        this.mountedTurret.isManned = false
        this.mountedTurret.manualControl = false
        this.mountedTurret = null
    }

    function takeDamage(amount: int) {
        this.health -= amount

        if (this.health <= 0) {
            this.die()
        }

        // Spawn damage effect
        Effect damageEffect = new DamageEffect(this.position, amount)
        EffectManager.spawnEffect(damageEffect)
    }

    function die() {
        gameManager.gameOver(false)
    }

    function heal(amount: int) {
        this.health = min(this.health + amount, this.maxHealth)
    }
}
```

### 2.2 Weapon System

```javascript
enum WeaponType {
    BASIC_RIFLE,
    ADVANCED_RIFLE,
    SHOTGUN,
    SNIPER,
    ROCKET_LAUNCHER,
    LASER_RIFLE,
    PLASMA_CANNON,
    RAILGUN
}

class Weapon {
    type: WeaponType
    damage: int
    fireRate: float
    range: float
    projectileSpeed: float
    ammoType: ResourceType
    ammoCost: int

    lastFireTime: float = 0

    constructor(type: WeaponType) {
        this.type = type
        this.loadWeaponStats()
    }

    function loadWeaponStats() {
        WeaponData data = WeaponDatabase.getWeapon(this.type)
        this.damage = data.damage
        this.fireRate = data.fireRate
        this.range = data.range
        this.projectileSpeed = data.projectileSpeed
        this.ammoType = data.ammoType
        this.ammoCost = data.ammoCost
    }

    function update(deltaTime: float) {
        this.lastFireTime += deltaTime
    }

    function fire(position: Vector2, rotation: float): boolean {
        float cooldown = 1.0 / this.fireRate

        if (this.lastFireTime < cooldown) {
            return false
        }

        // Check ammo (skip for energy weapons)
        if (this.ammoType != null) {
            if (!gameManager.resourceManager.hasResources({
                [this.ammoType]: this.ammoCost
            })) {
                return false
            }
            gameManager.resourceManager.consumeResources({
                [this.ammoType]: this.ammoCost
            })
        }

        // Create projectile
        Vector2 direction = new Vector2(cos(rotation), sin(rotation))
        Projectile proj = new Projectile(
            position,
            direction,
            this.projectileSpeed,
            this.damage,
            this.range,
            ProjectileOwner.PLAYER
        )

        gameManager.state.projectiles.push(proj)

        this.lastFireTime = 0

        // Spawn muzzle flash effect
        Effect muzzle = new MuzzleFlashEffect(position, rotation)
        EffectManager.spawnEffect(muzzle)

        return true
    }
}
```

---

## 3. ENEMY SYSTEMS

### 3.1 Wave Manager

```javascript
class WaveManager {
    currentWave: int = 0
    waveActive: boolean = false
    timeBetweenWaves: float = 30.0
    waveTimer: float = 0

    enemiesRemainingInWave: int = 0

    function update(deltaTime: float) {
        if (!this.waveActive) {
            this.waveTimer += deltaTime

            if (this.waveTimer >= this.timeBetweenWaves) {
                this.startNextWave()
            }
        } else {
            // Check if wave is complete
            if (this.enemiesRemainingInWave <= 0 &&
                gameManager.state.enemies.length == 0) {
                this.completeWave()
            }
        }
    }

    function startNextWave() {
        this.currentWave++
        this.waveActive = true
        this.waveTimer = 0

        gameManager.state.currentWave = this.currentWave

        // Calculate wave composition
        float performanceScore = this.calculatePerformanceScore()
        WaveComposition composition = this.calculateWaveComposition(
            this.currentWave,
            performanceScore
        )

        // Spawn enemies
        this.spawnWave(composition)

        UI.showWaveStartNotification(this.currentWave)
    }

    function calculatePerformanceScore(): float {
        // Based on player resources, building count, tech unlocks
        float score = 1.0

        // More buildings = player is stronger
        score += gameManager.state.buildings.length * 0.01

        // More research = player is stronger
        score += gameManager.techTreeManager.unlockedNodes.size * 0.05

        // Clamp to reasonable range
        return clamp(score, 0.5, 3.0)
    }

    function calculateWaveComposition(wave: int, performance: float): WaveComposition {
        float difficulty = wave * performance

        WaveComposition comp = {
            swarmers: floor(15 + difficulty * 2),
            tanks: floor(max(0, difficulty - 5) * 0.5),
            runners: floor(max(0, difficulty - 10) * 0.3),
            supports: floor(max(0, difficulty - 15) * 0.2),
            boss: (wave % 10 == 0) ? 1 : 0
        }

        return comp
    }

    function spawnWave(composition: WaveComposition) {
        this.enemiesRemainingInWave = 0

        // Spawn swarmers
        for (int i = 0; i < composition.swarmers; i++) {
            this.spawnEnemy(EnemyType.SWARMER, i * 0.5)
        }

        // Spawn tanks
        for (int i = 0; i < composition.tanks; i++) {
            this.spawnEnemy(EnemyType.TANK, i * 2.0)
        }

        // Spawn runners
        for (int i = 0; i < composition.runners; i++) {
            this.spawnEnemy(EnemyType.RUNNER, i * 1.5)
        }

        // Spawn supports
        for (int i = 0; i < composition.supports; i++) {
            this.spawnEnemy(EnemyType.SUPPORT, i * 3.0)
        }

        // Spawn boss
        if (composition.boss > 0) {
            this.spawnEnemy(EnemyType.BOSS, 10.0)
        }
    }

    function spawnEnemy(type: EnemyType, delay: float) {
        this.enemiesRemainingInWave++

        // Delayed spawn
        Timer.schedule(delay, () => {
            Vector2 spawnPoint = this.getRandomSpawnPoint()
            Enemy enemy = new Enemy(type, spawnPoint)
            gameManager.state.enemies.push(enemy)
        })
    }

    function getRandomSpawnPoint(): Vector2 {
        array<Vector2> spawnPoints = gameManager.mapManager.spawnPoints
        int index = random(0, spawnPoints.length - 1)
        return spawnPoints[index]
    }

    function completeWave() {
        this.waveActive = false
        this.waveTimer = 0

        gameManager.state.stats.wavesCompleted++

        // Reward resources
        this.giveWaveRewards()

        UI.showWaveCompleteNotification(this.currentWave)
    }

    function giveWaveRewards() {
        int baseReward = 50
        int waveMultiplier = this.currentWave
        int totalReward = baseReward * waveMultiplier

        gameManager.resourceManager.addResource(
            ResourceType.SCRAP_METAL,
            totalReward
        )
    }

    function enemyKilled() {
        this.enemiesRemainingInWave--
    }
}
```

### 3.2 Enemy Base Class

```javascript
enum EnemyType {
    SWARMER,
    TANK,
    RUNNER,
    SUPPORT,
    BOSS
}

class Enemy {
    type: EnemyType
    position: Vector2
    velocity: Vector2 = new Vector2(0, 0)
    rotation: float = 0

    maxHealth: int
    health: int
    speed: float
    damage: int

    currentTarget: Building = null
    path: array<Vector2> = []
    pathIndex: int = 0

    attackRange: float = 1.5
    attackCooldown: float = 1.0
    lastAttackTime: float = 0

    state: EnemyState = EnemyState.MOVING

    constructor(type: EnemyType, spawnPos: Vector2) {
        this.type = type
        this.position = spawnPos
        this.loadStats()
        this.health = this.maxHealth
    }

    function loadStats() {
        EnemyData data = EnemyDatabase.getEnemy(this.type)
        this.maxHealth = data.health
        this.speed = data.speed
        this.damage = data.damage
    }

    function update(deltaTime: float) {
        this.lastAttackTime += deltaTime

        switch (this.state) {
            case EnemyState.MOVING:
                this.updateMoving(deltaTime)
                break
            case EnemyState.ATTACKING:
                this.updateAttacking(deltaTime)
                break
        }
    }

    function updateMoving(deltaTime: float) {
        // Select target if none
        if (this.currentTarget == null || this.currentTarget.isDestroyed) {
            this.selectNewTarget()
        }

        // Calculate path if needed
        if (this.path.length == 0) {
            this.calculatePathToTarget()
        }

        // Follow path
        if (this.path.length > 0) {
            this.followPath(deltaTime)
        }

        // Check if in attack range
        if (this.currentTarget != null) {
            float distanceToTarget = (this.currentTarget.position - this.position).length()

            if (distanceToTarget <= this.attackRange) {
                this.state = EnemyState.ATTACKING
            }
        }
    }

    function updateAttacking(deltaTime: float) {
        // Face target
        if (this.currentTarget != null) {
            Vector2 direction = this.currentTarget.position - this.position
            this.rotation = atan2(direction.y, direction.x)

            // Attack if cooldown ready
            if (this.lastAttackTime >= this.attackCooldown) {
                this.attack()
                this.lastAttackTime = 0
            }

            // Check if still in range
            float distance = (this.currentTarget.position - this.position).length()
            if (distance > this.attackRange) {
                this.state = EnemyState.MOVING
                this.path = []
            }
        } else {
            this.state = EnemyState.MOVING
        }
    }

    function selectNewTarget() {
        // Priority: damaged buildings > production > turrets > core
        array<Building> candidates = gameManager.state.buildings

        Building bestTarget = null
        float bestScore = -999999

        for (building in candidates) {
            if (building.isDestroyed) continue

            float score = this.calculateTargetScore(building)

            if (score > bestScore) {
                bestScore = score
                bestTarget = building
            }
        }

        this.currentTarget = bestTarget
    }

    function calculateTargetScore(building: Building): float {
        float distance = (building.position - this.position).length()
        float distancePenalty = distance * 0.1

        float score = 0

        // Priority scoring
        if (building.type == BuildingType.CORE) {
            score = 100
        } else if (building.type == BuildingType.REFINERY ||
                   building.type == BuildingType.ASSEMBLER) {
            score = 80
        } else if (building.type == BuildingType.TURRET) {
            score = 60
        } else {
            score = 40
        }

        // Prioritize damaged buildings
        float healthPercent = building.health / building.maxHealth
        if (healthPercent < 0.5) {
            score += 30
        }

        return score - distancePenalty
    }

    function calculatePathToTarget() {
        if (this.currentTarget == null) return

        Vector2Int startGrid = gameManager.grid.worldToGrid(this.position)
        Vector2Int endGrid = gameManager.grid.worldToGrid(this.currentTarget.position)

        this.path = PathfindingSystem.findPath(startGrid, endGrid)
        this.pathIndex = 0
    }

    function followPath(deltaTime: float) {
        if (this.pathIndex >= this.path.length) {
            this.path = []
            return
        }

        Vector2 targetPos = this.path[this.pathIndex]
        Vector2 direction = (targetPos - this.position).normalized()

        this.velocity = direction * this.speed
        this.position += this.velocity * deltaTime

        // Check if reached waypoint
        float distanceToWaypoint = (targetPos - this.position).length()
        if (distanceToWaypoint < 0.5) {
            this.pathIndex++
        }

        // Update rotation
        this.rotation = atan2(direction.y, direction.x)
    }

    function attack() {
        if (this.currentTarget != null && !this.currentTarget.isDestroyed) {
            this.currentTarget.takeDamage(this.damage)

            // Spawn attack effect
            Effect attackEffect = new AttackEffect(
                this.position,
                this.currentTarget.position
            )
            EffectManager.spawnEffect(attackEffect)
        }
    }

    function takeDamage(amount: int) {
        this.health -= amount

        gameManager.state.stats.damageDealt += amount

        // Spawn damage number
        Effect damageNum = new DamageNumberEffect(this.position, amount)
        EffectManager.spawnEffect(damageNum)

        if (this.health <= 0) {
            this.die()
        }
    }

    function die() {
        // Drop resources
        this.dropResources()

        // Update stats
        gameManager.state.stats.enemiesKilled++
        gameManager.waveManager.enemyKilled()

        // Spawn death effect
        Effect deathEffect = new ExplosionEffect(this.position, this.type)
        EffectManager.spawnEffect(deathEffect)

        // Remove from game
        int index = gameManager.state.enemies.indexOf(this)
        if (index >= 0) {
            gameManager.state.enemies.removeAt(index)
        }
    }

    function dropResources() {
        ResourceDrop drop = EnemyDatabase.getResourceDrop(this.type)

        for (resourceType, amount in drop.resources) {
            int finalAmount = random(drop.minAmount, drop.maxAmount)

            // Spawn resource pickup
            ResourcePickup pickup = new ResourcePickup(
                this.position,
                resourceType,
                finalAmount
            )

            gameManager.state.resourcePickups.push(pickup)
        }
    }
}
```

---

## 4. COMBAT SYSTEMS

### 4.1 Projectile System

```javascript
enum ProjectileOwner {
    PLAYER,
    TURRET,
    ENEMY
}

class Projectile {
    position: Vector2
    velocity: Vector2
    damage: int
    maxRange: float
    distanceTraveled: float = 0
    owner: ProjectileOwner

    constructor(
        startPos: Vector2,
        direction: Vector2,
        speed: float,
        damage: int,
        range: float,
        owner: ProjectileOwner
    ) {
        this.position = startPos
        this.velocity = direction * speed
        this.damage = damage
        this.maxRange = range
        this.owner = owner
    }

    function update(deltaTime: float) {
        Vector2 movement = this.velocity * deltaTime
        this.position += movement
        this.distanceTraveled += movement.length()

        // Check collision
        this.checkCollisions()

        // Check range
        if (this.distanceTraveled >= this.maxRange) {
            this.destroy()
        }
    }

    function checkCollisions() {
        if (this.owner == ProjectileOwner.PLAYER ||
            this.owner == ProjectileOwner.TURRET) {
            // Check hit on enemies
            for (enemy in gameManager.state.enemies) {
                if (this.isCollidingWith(enemy)) {
                    enemy.takeDamage(this.damage)
                    this.destroy()
                    return
                }
            }
        } else if (this.owner == ProjectileOwner.ENEMY) {
            // Check hit on player
            if (this.isCollidingWith(gameManager.state.player)) {
                gameManager.state.player.takeDamage(this.damage)
                this.destroy()
                return
            }

            // Check hit on buildings
            for (building in gameManager.state.buildings) {
                if (this.isCollidingWith(building)) {
                    building.takeDamage(this.damage)
                    this.destroy()
                    return
                }
            }
        }
    }

    function isCollidingWith(entity: any): boolean {
        float hitRadius = 0.5
        float distance = (entity.position - this.position).length()
        return distance < hitRadius
    }

    function destroy() {
        int index = gameManager.state.projectiles.indexOf(this)
        if (index >= 0) {
            gameManager.state.projectiles.removeAt(index)
        }
    }
}
```

### 4.2 Turret System

```javascript
class Turret extends Building {
    rotation: float = 0
    targetEnemy: Enemy = null

    fireRange: float = 15.0
    damage: int = 10
    fireRate: float = 2.0
    lastFireTime: float = 0

    isManned: boolean = false
    manualControl: boolean = false

    mods: array<TurretMod> = []

    constructor(position: Vector2) {
        super(BuildingType.TURRET, position)
        this.maxHealth = 50
        this.health = 50
    }

    function update(deltaTime: float) {
        super.update(deltaTime)

        this.lastFireTime += deltaTime

        if (!this.manualControl) {
            this.updateAutoTargeting(deltaTime)
        }
    }

    function updateAutoTargeting(deltaTime: float) {
        // Find target
        if (this.targetEnemy == null ||
            this.targetEnemy.health <= 0 ||
            !this.isInRange(this.targetEnemy)) {
            this.findNewTarget()
        }

        // Aim at target
        if (this.targetEnemy != null) {
            this.aimAt(this.targetEnemy.position)

            // Fire if ready
            float cooldown = 1.0 / this.fireRate
            if (this.lastFireTime >= cooldown) {
                this.fire()
                this.lastFireTime = 0
            }
        }
    }

    function findNewTarget() {
        this.targetEnemy = null
        float closestDistance = 999999

        for (enemy in gameManager.state.enemies) {
            float distance = (enemy.position - this.position).length()

            if (distance <= this.fireRange && distance < closestDistance) {
                closestDistance = distance
                this.targetEnemy = enemy
            }
        }
    }

    function isInRange(enemy: Enemy): boolean {
        float distance = (enemy.position - this.position).length()
        return distance <= this.fireRange
    }

    function aimAt(targetPos: Vector2) {
        Vector2 direction = targetPos - this.position
        this.rotation = atan2(direction.y, direction.x)
    }

    function fire() {
        if (this.targetEnemy == null) return

        // Apply power efficiency to damage
        float powerEff = gameManager.powerManager.getEfficiencyAtLocation(this.position)
        int finalDamage = floor(this.damage * powerEff)

        // Create projectile
        Vector2 direction = new Vector2(cos(this.rotation), sin(this.rotation))
        Projectile proj = new Projectile(
            this.position,
            direction,
            20.0,
            finalDamage,
            this.fireRange,
            ProjectileOwner.TURRET
        )

        gameManager.state.projectiles.push(proj)

        // Spawn muzzle flash
        Effect flash = new MuzzleFlashEffect(this.position, this.rotation)
        EffectManager.spawnEffect(flash)
    }

    function manualFire() {
        float cooldown = 1.0 / this.fireRate
        if (this.lastFireTime < cooldown) {
            return
        }

        this.fire()
        this.lastFireTime = 0
    }

    function installMod(mod: TurretMod) {
        if (this.mods.length < 2) {
            this.mods.push(mod)
            this.applyModBonuses()
        }
    }

    function applyModBonuses() {
        // Reset to base stats
        this.loadBaseStats()

        // Apply all mods
        for (mod in this.mods) {
            this.damage += mod.damageBonus
            this.fireRate += mod.fireRateBonus
            this.fireRange += mod.rangeBonus
        }
    }
}
```

---

## 5. AUTOMATION SYSTEMS

### 5.1 Collector Car

```javascript
enum CollectorState {
    IDLE,
    MOVING_TO_RESOURCE,
    COLLECTING,
    MOVING_TO_STORAGE,
    DEPOSITING
}

class CollectorCar {
    position: Vector2
    velocity: Vector2 = new Vector2(0, 0)
    rotation: float = 0

    state: CollectorState = CollectorState.IDLE
    speed: float = 8.0

    cargo: Dictionary<ResourceType, int> = {}
    maxCargoCapacity: int = 50
    currentCargoAmount: int = 0

    targetResource: ResourcePickup = null
    targetStorage: Building = null

    path: array<Vector2> = []
    pathIndex: int = 0

    function update(deltaTime: float) {
        switch (this.state) {
            case CollectorState.IDLE:
                this.findResourceToCollect()
                break

            case CollectorState.MOVING_TO_RESOURCE:
                this.moveAlongPath(deltaTime)
                if (this.hasReachedDestination()) {
                    this.state = CollectorState.COLLECTING
                }
                break

            case CollectorState.COLLECTING:
                this.collectResource()
                break

            case CollectorState.MOVING_TO_STORAGE:
                this.moveAlongPath(deltaTime)
                if (this.hasReachedDestination()) {
                    this.state = CollectorState.DEPOSITING
                }
                break

            case CollectorState.DEPOSITING:
                this.depositResources()
                break
        }
    }

    function findResourceToCollect() {
        if (this.currentCargoAmount >= this.maxCargoCapacity) {
            this.findStorageToDeposit()
            return
        }

        // Find nearest resource pickup
        ResourcePickup nearest = null
        float nearestDistance = 999999

        for (pickup in gameManager.state.resourcePickups) {
            float distance = (pickup.position - this.position).length()

            if (distance < nearestDistance) {
                nearestDistance = distance
                nearest = pickup
            }
        }

        if (nearest != null) {
            this.targetResource = nearest
            this.calculatePathToResource()
            this.state = CollectorState.MOVING_TO_RESOURCE
        }
    }

    function calculatePathToResource() {
        Vector2Int start = gameManager.grid.worldToGrid(this.position)
        Vector2Int end = gameManager.grid.worldToGrid(this.targetResource.position)

        this.path = PathfindingSystem.findPath(start, end)
        this.pathIndex = 0
    }

    function collectResource() {
        if (this.targetResource == null || this.targetResource.isCollected) {
            this.state = CollectorState.IDLE
            return
        }

        int amountToCollect = min(
            this.targetResource.amount,
            this.maxCargoCapacity - this.currentCargoAmount
        )

        // Add to cargo
        ResourceType type = this.targetResource.resourceType
        this.cargo[type] = (this.cargo[type] || 0) + amountToCollect
        this.currentCargoAmount += amountToCollect

        // Remove from pickup
        this.targetResource.amount -= amountToCollect
        if (this.targetResource.amount <= 0) {
            this.targetResource.collect()
        }

        // Spawn collection effect
        Effect collectEffect = new ResourceCollectionEffect(this.position)
        EffectManager.spawnEffect(collectEffect)

        // Find storage to deposit
        this.findStorageToDeposit()
    }

    function findStorageToDeposit() {
        // Find nearest storage building (or core)
        Building nearest = gameManager.state.coreBuilding
        float nearestDistance = (nearest.position - this.position).length()

        for (building in gameManager.state.buildings) {
            if (building.type == BuildingType.STORAGE) {
                float distance = (building.position - this.position).length()

                if (distance < nearestDistance) {
                    nearestDistance = distance
                    nearest = building
                }
            }
        }

        this.targetStorage = nearest
        this.calculatePathToStorage()
        this.state = CollectorState.MOVING_TO_STORAGE
    }

    function calculatePathToStorage() {
        Vector2Int start = gameManager.grid.worldToGrid(this.position)
        Vector2Int end = gameManager.grid.worldToGrid(this.targetStorage.position)

        this.path = PathfindingSystem.findPath(start, end)
        this.pathIndex = 0
    }

    function depositResources() {
        // Add all cargo to resource manager
        for (type, amount in this.cargo) {
            gameManager.resourceManager.addResource(type, amount)
        }

        // Clear cargo
        this.cargo = {}
        this.currentCargoAmount = 0

        // Spawn deposit effect
        Effect depositEffect = new ResourceDepositEffect(this.position)
        EffectManager.spawnEffect(depositEffect)

        // Return to idle
        this.state = CollectorState.IDLE
    }

    function moveAlongPath(deltaTime: float) {
        if (this.path.length == 0) {
            this.state = CollectorState.IDLE
            return
        }

        if (this.pathIndex >= this.path.length) {
            return
        }

        Vector2 targetPos = this.path[this.pathIndex]
        Vector2 direction = (targetPos - this.position).normalized()

        this.velocity = direction * this.speed
        this.position += this.velocity * deltaTime

        // Check if reached waypoint
        float distance = (targetPos - this.position).length()
        if (distance < 0.5) {
            this.pathIndex++
        }

        // Update rotation
        this.rotation = atan2(direction.y, direction.x)
    }

    function hasReachedDestination(): boolean {
        return this.pathIndex >= this.path.length
    }
}
```

### 5.2 Resource Processing

```javascript
class ResourceProcessor extends Building {
    currentRecipe: Recipe = null
    inputStorage: Dictionary<ResourceType, int> = {}
    outputStorage: Dictionary<ResourceType, int> = {}

    craftingProgress: float = 0
    isCrafting: boolean = false

    constructor(type: BuildingType, position: Vector2) {
        super(type, position)
    }

    function update(deltaTime: float) {
        super.update(deltaTime)

        if (this.isCrafting) {
            this.updateCrafting(deltaTime)
        } else {
            this.tryStartCrafting()
        }
    }

    function updateCrafting(deltaTime: float) {
        // Check power
        float powerEff = gameManager.powerManager.getEfficiencyAtLocation(this.position)

        if (powerEff < 0.25) {
            // Not enough power, pause
            return
        }

        // Progress crafting
        this.craftingProgress += deltaTime * powerEff

        // Check completion
        if (this.craftingProgress >= this.currentRecipe.craftTime) {
            this.completeCrafting()
        }
    }

    function tryStartCrafting() {
        if (this.currentRecipe == null) {
            this.selectRecipe()
        }

        if (this.currentRecipe == null) {
            return
        }

        // Check if we have ingredients
        if (this.hasIngredients()) {
            this.startCrafting()
        }
    }

    function selectRecipe() {
        // Find a recipe this building can craft
        array<Recipe> availableRecipes = RecipeDatabase.getRecipesForBuilding(this.type)

        for (recipe in availableRecipes) {
            // Check if we have resources globally
            if (gameManager.resourceManager.hasResources(recipe.inputs)) {
                this.currentRecipe = recipe
                return
            }
        }
    }

    function hasIngredients(): boolean {
        for (resourceType, amount in this.currentRecipe.inputs) {
            if (this.inputStorage[resourceType] < amount) {
                // Try to pull from global storage
                if (gameManager.resourceManager.hasResources({
                    [resourceType]: amount
                })) {
                    int needed = amount - (this.inputStorage[resourceType] || 0)
                    gameManager.resourceManager.removeResource(resourceType, needed)
                    this.inputStorage[resourceType] = amount
                } else {
                    return false
                }
            }
        }

        return true
    }

    function startCrafting() {
        // Consume ingredients
        for (resourceType, amount in this.currentRecipe.inputs) {
            this.inputStorage[resourceType] -= amount
        }

        this.isCrafting = true
        this.craftingProgress = 0

        // Spawn crafting effect
        Effect craftEffect = new CraftingEffect(this.position)
        EffectManager.spawnEffect(craftEffect)
    }

    function completeCrafting() {
        // Add outputs to global storage
        for (resourceType, amount in this.currentRecipe.outputs) {
            gameManager.resourceManager.addResource(resourceType, amount)
        }

        // Spawn completion effect
        Effect completeEffect = new CraftCompleteEffect(this.position)
        EffectManager.spawnEffect(completeEffect)

        // Reset
        this.isCrafting = false
        this.craftingProgress = 0
        this.currentRecipe = null
    }
}
```

---

## 6. BUILDING SYSTEMS

### 6.1 Building Placement

```javascript
class BuildingPlacementSystem {
    isPlacing: boolean = false
    currentBuildingType: BuildingType = null
    placementGhost: Building = null

    function startPlacing(buildingType: BuildingType) {
        this.isPlacing = true
        this.currentBuildingType = buildingType
        this.placementGhost = new Building(buildingType, new Vector2(0, 0))
    }

    function update() {
        if (!this.isPlacing) return

        // Update ghost position to mouse
        Vector2 mousePos = Input.getMouseWorldPosition()
        Vector2Int gridPos = gameManager.grid.worldToGrid(mousePos)
        Vector2 snappedPos = gameManager.grid.gridToWorld(gridPos)

        this.placementGhost.position = snappedPos

        // Check if valid placement
        boolean isValid = this.isValidPlacement(gridPos)

        // Render ghost (green if valid, red if invalid)
        this.renderGhost(isValid)

        // Place building on click
        if (Input.isMouseButtonJustPressed(MOUSE_LEFT) && isValid) {
            this.placeBuilding(snappedPos)
        }

        // Cancel on right click
        if (Input.isMouseButtonJustPressed(MOUSE_RIGHT)) {
            this.cancelPlacement()
        }
    }

    function isValidPlacement(gridPos: Vector2Int): boolean {
        // Check if grid position is walkable
        if (!gameManager.grid.isWalkable(gridPos)) {
            return false
        }

        // Check if another building is already there
        for (building in gameManager.state.buildings) {
            Vector2Int buildingGridPos = gameManager.grid.worldToGrid(building.position)

            if (buildingGridPos.equals(gridPos)) {
                return false
            }
        }

        // Check if player has resources
        Dictionary<ResourceType, int> cost = BuildingCostDatabase.getCost(
            this.currentBuildingType
        )

        if (!gameManager.resourceManager.hasResources(cost)) {
            return false
        }

        return true
    }

    function placeBuilding(position: Vector2) {
        // Consume resources
        Dictionary<ResourceType, int> cost = BuildingCostDatabase.getCost(
            this.currentBuildingType
        )
        gameManager.resourceManager.consumeResources(cost)

        // Create building
        Building building = new Building(this.currentBuildingType, position)
        gameManager.state.buildings.push(building)

        // Update stats
        gameManager.state.stats.buildingsBuilt++

        // Spawn build effect
        Effect buildEffect = new BuildingPlaceEffect(position)
        EffectManager.spawnEffect(buildEffect)

        // Update grid
        gameManager.grid.setWalkable(
            gameManager.grid.worldToGrid(position),
            false
        )

        // Continue placing or cancel
        // (For now, cancel after one placement)
        this.cancelPlacement()
    }

    function cancelPlacement() {
        this.isPlacing = false
        this.placementGhost = null
        this.currentBuildingType = null
    }

    function renderGhost(isValid: boolean) {
        Color color = isValid ? Color.GREEN : Color.RED
        color.a = 0.5

        // Render semi-transparent building sprite
        Renderer.drawBuilding(this.placementGhost, color)
    }
}
```

---

## BALANCING GUIDELINES

### Early Game (Waves 1-10)
- Player manual combat is primary
- 1-2 collectors, 2-3 basic turrets
- Simple resource chains (scrap → plate → turret)
- Coal mining starts
- First research: collector speed, basic turrets
- Income: ~50-200 resources/wave

### Mid Game (Waves 11-30)
- Automation takes over basic enemies
- 4-5 collectors, 8-10 turrets (mix of basic/advanced)
- Multiple mining outposts
- Research energy weapons (MAJOR MILESTONE)
- Power management becomes important
- Remote mining defense
- Income: ~200-500 resources/wave

### Late Game (Waves 31+)
- Massive automation, 10+ collectors
- 15-20 turrets with mods, energy weapons primary
- Multiple labs, fast research
- Super weapons deployed
- Boss waves every 10
- Power surplus bonuses critical
- Income: ~1000+ resources/wave

---

## RESOURCE RECIPES DATABASE

```javascript
ResourceProcessor.recipes = {
    "metallic_plate": {
        inputs: { SCRAP_METAL: 3 },
        outputs: { METALLIC_PLATE: 1 },
        time: 2.0,
        building: REFINERY
    },

    "gunpowder": {
        inputs: { COAL: 1, METALLIC_PLATE: 1 },
        outputs: { GUNPOWDER: 2 },
        time: 3.0,
        building: ASSEMBLER
    },

    "basic_magazine": {
        inputs: { GUNPOWDER: 1, METALLIC_PLATE: 1 },
        outputs: { BASIC_MAGAZINE: 5 },
        time: 4.0,
        building: ASSEMBLER
    },

    "steel_plate": {
        inputs: { METALLIC_PLATE: 5 },
        outputs: { STEEL_PLATE: 1 },
        time: 5.0,
        building: REFINERY
    },

    "circuit_board": {
        inputs: { SILICON: 2, ELECTRONIC_COMPONENT: 1 },
        outputs: { CIRCUIT_BOARD: 1 },
        time: 4.0,
        building: FABRICATOR
    },

    "processing_unit": {
        inputs: { CIRCUIT_BOARD: 1, STEEL_PLATE: 1 },
        outputs: { PROCESSING_UNIT: 1 },
        time: 6.0,
        building: FABRICATOR
    },

    "advanced_chip": {
        inputs: { PROCESSING_UNIT: 2, CAPACITOR: 1 },
        outputs: { ADVANCED_CHIP: 1 },
        time: 8.0,
        building: FABRICATOR
    },

    // ... 40+ more recipes
}
```

---

## VISUAL EFFECTS SYSTEM

```javascript
class Effect {
    position: Vector2
    lifetime: float
    elapsedTime: float = 0

    function update(deltaTime: float) {
        this.elapsedTime += deltaTime

        if (this.elapsedTime >= this.lifetime) {
            this.destroy()
        }
    }

    function render() {
        // Override in subclasses
    }

    function destroy() {
        EffectManager.removeEffect(this)
    }
}

// Effect types (special-effects based, minimal graphics)
class MuzzleFlashEffect extends Effect {
    // Glowing burst at weapon
}

class ProjectileTrailEffect extends Effect {
    // Line following bullet
}

class ExplosionEffect extends Effect {
    // Expanding circle, particles
}

class DamageNumberEffect extends Effect {
    // Floating text
}

class HealEffect extends Effect {
    // Green particles
}

class EMPPulseEffect extends Effect {
    // Blue expanding ring
}

class ResourceCollectionEffect extends Effect {
    // Sparkles
}

class BuildingPlaceEffect extends Effect {
    // Construction animation
}
```

---

## SAVE DATA STRUCTURE

```javascript
SaveData = {
    version: "1.0.0",
    timestamp: Date,
    wave: int,

    player: {
        position: Vector2,
        health: int,
        currentWeapon: string
    },

    buildings: array<{
        type: BuildingType,
        position: Vector2,
        health: int,
        rotation: float,
        mods: array<string> // For turrets
    }>,

    resources: Dictionary<ResourceType, int>,

    unlockedTechs: array<string>,

    achievements: array<{
        id: string,
        progress: int,
        completed: boolean
    }>,

    stats: {
        playtime: float,
        enemiesKilled: int,
        wavesCompleted: int,
        highestWave: int
    }
}
```

---

## PWA CONSIDERATIONS

### Service Worker
```javascript
// Cache game assets for offline play
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('game-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/game.js',
                '/styles.css'
            ])
        })
    )
})
```

### Local Storage
- Save games: IndexedDB (larger storage)
- Settings: localStorage
- Achievements: localStorage (persistent)

### Touch Controls
- Virtual joystick for movement
- Tap to shoot
- Two-finger pinch for zoom
- Toolbar buttons enlarged for touch

### Performance
- Target 60 FPS on mobile
- Limit particles when battery low
- Reduce enemy count on low-end devices
- Canvas-based rendering (not DOM)

---

## TESTING CHECKLIST

### Core Gameplay
- [ ] Player movement smooth
- [ ] Shooting responsive
- [ ] Enemies path correctly
- [ ] Waves spawn and scale
- [ ] Resources drop and collect
- [ ] Buildings place on grid
- [ ] Turrets auto-target

### Automation
- [ ] Collectors find and gather resources
- [ ] Miners extract from deposits
- [ ] Processing buildings craft items
- [ ] Power distributes correctly

### Progression
- [ ] Tech tree unlocks work
- [ ] Research completes
- [ ] Achievements trigger
- [ ] Save/load preserves state

### Balance
- [ ] Early game not too hard
- [ ] Mid game has progression feel
- [ ] Late game remains challenging
- [ ] Resource economy works

### Polish
- [ ] Effects look good
- [ ] UI readable
- [ ] Performance stable
- [ ] No game-breaking bugs

---

## END OF COMPLETE PSEUDOCODE DOCUMENTATION

**Note**: This document provides the complete architectural framework and critical implementation patterns. For detailed implementations of Power Systems (Section 7), Progression Systems (Section 8), Map Systems (Section 9), and UI Systems (Section 10), refer to `game-pseudocode-detailed-sections.md`.

For complete databases including the full tech tree (35 nodes), all recipes (50+), and building costs, refer to `sci-fi-td-complete-pseudocode.md`.
