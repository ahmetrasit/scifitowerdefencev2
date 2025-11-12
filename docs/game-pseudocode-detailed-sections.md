# Detailed Pseudocode - Remaining Systems
## Sections 7-10: Power, Progression, Map, UI

This document contains the detailed implementation pseudocode for the remaining game systems. Use in conjunction with the main pseudocode document.

---

## 7. POWER SYSTEMS

### 7.1 Power Grid Manager

```javascript
class PowerManager {
    totalGeneration: int = 0
    totalConsumption: int = 0
    powerEfficiency: float = 1.0

    generators: array<PowerGenerator> = []
    consumers: array<Building> = []
    powerLines: array<PowerLine> = []

    // Power network graph
    powerNetwork: Dictionary<Building, array<Building>> = {}

    function update(deltaTime: float) {
        this.calculateTotalPower()
        this.updatePowerEfficiency()
        this.distributePower()
    }

    function calculateTotalPower() {
        this.totalGeneration = 0
        this.totalConsumption = 0

        // Calculate generation
        for (generator in this.generators) {
            if (!generator.isDestroyed) {
                this.totalGeneration += generator.getPowerOutput()
            }
        }

        // Calculate consumption
        for (consumer in this.consumers) {
            if (!consumer.isDestroyed && !consumer.isStunned) {
                this.totalConsumption += consumer.powerConsumption
            }
        }
    }

    function updatePowerEfficiency() {
        if (this.totalConsumption == 0) {
            this.powerEfficiency = 1.0
            return
        }

        // Calculate efficiency ratio
        this.powerEfficiency = this.totalGeneration / this.totalConsumption

        // Clamp to reasonable range
        this.powerEfficiency = clamp(this.powerEfficiency, 0.0, 2.0)
    }

    function distributePower() {
        // Build power network connections
        this.buildPowerNetwork()

        // Calculate efficiency for each building based on network connection
        for (building in gameManager.state.buildings) {
            float localEfficiency = this.calculateLocalEfficiency(building)
            building.powerEfficiency = localEfficiency
        }
    }

    function buildPowerNetwork() {
        this.powerNetwork = {}

        // Connect buildings that are adjacent
        for (building in gameManager.state.buildings) {
            array<Building> connections = this.findConnectedBuildings(building)
            this.powerNetwork[building] = connections
        }
    }

    function findConnectedBuildings(building: Building): array<Building> {
        array<Building> connected = []
        float connectionRange = 3.0 // Adjacent buildings within 3 units

        for (other in gameManager.state.buildings) {
            if (other == building) continue

            float distance = (building.position - other.position).length()

            if (distance <= connectionRange) {
                connected.push(other)
            }
        }

        // Check power lines
        for (line in this.powerLines) {
            if (line.isConnectedTo(building)) {
                connected.push(line.getOtherEnd(building))
            }
        }

        return connected
    }

    function calculateLocalEfficiency(building: Building): float {
        // Check if connected to a generator
        boolean connectedToPower = this.isConnectedToPowerSource(building)

        if (!connectedToPower) {
            // Isolated building - distance penalty
            float distanceToNearest = this.getDistanceToNearestGenerator(building)
            float distancePenalty = clamp(1.0 - (distanceToNearest / 20.0), 0.1, 1.0)
            return this.powerEfficiency * distancePenalty
        }

        // Connected to network - check for generator boost
        float generatorBoost = this.getGeneratorBoost(building)

        return this.powerEfficiency * (1.0 + generatorBoost)
    }

    function isConnectedToPowerSource(building: Building): boolean {
        // BFS to find if connected to any generator
        Set<Building> visited = new Set()
        Queue<Building> queue = new Queue()
        queue.enqueue(building)
        visited.add(building)

        while (!queue.isEmpty()) {
            Building current = queue.dequeue()

            // Check if this is a generator
            if (current.type == BuildingType.POWER_GENERATOR ||
                current.type == BuildingType.SOLAR_PANEL ||
                current.type == BuildingType.REACTOR) {
                return true
            }

            // Add connected buildings to queue
            array<Building> connections = this.powerNetwork[current] || []
            for (connected in connections) {
                if (!visited.contains(connected)) {
                    visited.add(connected)
                    queue.enqueue(connected)
                }
            }
        }

        return false
    }

    function getGeneratorBoost(building: Building): float {
        // Check if within direct range of any generator
        float boost = 0.0
        float boostRange = 5.0

        for (generator in this.generators) {
            float distance = (building.position - generator.position).length()

            if (distance <= boostRange) {
                // Closer = stronger boost
                float distanceFactor = 1.0 - (distance / boostRange)
                boost = max(boost, 0.2 * distanceFactor) // Up to +20% boost
            }
        }

        return boost
    }

    function getDistanceToNearestGenerator(building: Building): float {
        float nearest = 99999.0

        for (generator in this.generators) {
            float distance = (building.position - generator.position).length()
            nearest = min(nearest, distance)
        }

        return nearest
    }

    function getEfficiencyAtLocation(position: Vector2): float {
        // Used by buildings to check power before acting
        // Find nearest building to get its efficiency
        Building nearestBuilding = this.findNearestBuilding(position)

        if (nearestBuilding != null) {
            return nearestBuilding.powerEfficiency || this.powerEfficiency
        }

        return this.powerEfficiency
    }

    function hasAvailablePower(amount: int): boolean {
        return this.totalGeneration >= amount
    }

    function consumePower(amount: int) {
        // Instant power consumption (for super weapons)
        // Creates temporary spike in consumption
    }

    function registerGenerator(generator: PowerGenerator) {
        this.generators.push(generator)
    }

    function unregisterGenerator(generator: PowerGenerator) {
        int index = this.generators.indexOf(generator)
        if (index >= 0) {
            this.generators.removeAt(index)
        }
    }

    function registerConsumer(consumer: Building) {
        this.consumers.push(consumer)
    }

    function unregisterConsumer(consumer: Building) {
        int index = this.consumers.indexOf(consumer)
        if (index >= 0) {
            this.consumers.removeAt(index)
        }
    }
}
```

### 7.2 Power Generation

```javascript
enum GeneratorType {
    COAL,
    SOLAR,
    REACTOR,
    FUEL_CELL
}

class PowerGenerator extends Building {
    generatorType: GeneratorType
    baseOutput: int
    currentOutput: int

    // Fuel system (for coal/fuel cell)
    usesFuel: boolean = false
    fuelType: ResourceType
    fuelConsumptionRate: float = 0
    fuelRemaining: float = 0

    constructor(type: GeneratorType, position: Vector2) {
        super(BuildingType.POWER_GENERATOR, position)
        this.generatorType = type

        this.initializeStats()
        gameManager.powerManager.registerGenerator(this)
    }

    function initializeStats() {
        switch (this.generatorType) {
            case GeneratorType.COAL:
                this.baseOutput = 20
                this.usesFuel = true
                this.fuelType = ResourceType.COAL
                this.fuelConsumptionRate = 0.1 // 1 coal per 10 seconds
                break

            case GeneratorType.SOLAR:
                this.baseOutput = 15
                this.usesFuel = false
                break

            case GeneratorType.REACTOR:
                this.baseOutput = 100
                this.usesFuel = true
                this.fuelType = ResourceType.URANIUM
                this.fuelConsumptionRate = 0.01 // 1 uranium per 100 seconds
                break

            case GeneratorType.FUEL_CELL:
                this.baseOutput = 30
                this.usesFuel = true
                this.fuelType = ResourceType.FUEL_CELL
                this.fuelConsumptionRate = 0.2
                break
        }

        this.currentOutput = this.baseOutput
    }

    function update(deltaTime: float) {
        super.update(deltaTime)

        if (this.usesFuel) {
            this.updateFuelConsumption(deltaTime)
        }

        if (this.generatorType == GeneratorType.SOLAR) {
            this.updateSolarOutput()
        }

        this.currentOutput = this.calculateOutput()
    }

    function updateFuelConsumption(deltaTime: float) {
        if (this.fuelRemaining <= 0) {
            // Try to get more fuel
            this.refuel()
        }

        if (this.fuelRemaining > 0) {
            this.fuelRemaining -= this.fuelConsumptionRate * deltaTime

            if (this.fuelRemaining < 0) {
                this.fuelRemaining = 0
            }
        }
    }

    function refuel() {
        // Try to consume fuel from resources
        if (gameManager.resourceManager.hasResources({ [this.fuelType]: 1 })) {
            gameManager.resourceManager.removeResource(this.fuelType, 1)
            this.fuelRemaining += 1.0
        }
    }

    function updateSolarOutput() {
        // Solar panels affected by day/night cycle
        float timeOfDay = gameManager.getTimeOfDay() // 0.0 to 1.0

        // Peak at noon (0.5), zero at night (0.0, 1.0)
        if (timeOfDay < 0.25 || timeOfDay > 0.75) {
            // Night
            this.currentOutput = 0
        } else {
            // Day - gradual ramp up/down
            float dayFactor = 1.0
            if (timeOfDay < 0.35) {
                // Morning ramp
                dayFactor = (timeOfDay - 0.25) / 0.1
            } else if (timeOfDay > 0.65) {
                // Evening ramp
                dayFactor = (0.75 - timeOfDay) / 0.1
            }

            this.currentOutput = floor(this.baseOutput * dayFactor)
        }
    }

    function calculateOutput(): int {
        if (this.usesFuel && this.fuelRemaining <= 0) {
            // No fuel, no power
            return 0
        }

        return this.currentOutput
    }

    function getPowerOutput(): int {
        return this.currentOutput
    }

    function destroy() {
        gameManager.powerManager.unregisterGenerator(this)
        super.destroy()
    }
}

class Accumulator extends Building {
    maxStorage: int = 1000
    currentStorage: int = 0
    chargeRate: int = 50 // Per second
    dischargeRate: int = 50 // Per second

    constructor(position: Vector2) {
        super(BuildingType.ACCUMULATOR, position)
    }

    function update(deltaTime: float) {
        super.update(deltaTime)

        // Check if we have power surplus or deficit
        PowerManager pm = gameManager.powerManager

        if (pm.powerEfficiency > 1.0) {
            // Surplus - charge accumulator
            this.charge(deltaTime)
        } else if (pm.powerEfficiency < 1.0) {
            // Deficit - discharge accumulator
            this.discharge(deltaTime)
        }
    }

    function charge(deltaTime: float) {
        int chargeAmount = floor(this.chargeRate * deltaTime)
        this.currentStorage = min(this.currentStorage + chargeAmount, this.maxStorage)
    }

    function discharge(deltaTime: float) {
        if (this.currentStorage <= 0) {
            return
        }

        int dischargeAmount = floor(this.dischargeRate * deltaTime)
        this.currentStorage = max(this.currentStorage - dischargeAmount, 0)

        // Add to power generation temporarily
        gameManager.powerManager.totalGeneration += dischargeAmount
    }

    function getStoragePercent(): float {
        return this.currentStorage / this.maxStorage
    }
}
```

---

## 8. PROGRESSION SYSTEMS

### 8.1 Tech Tree Manager

```javascript
class TechTreeManager {
    allNodes: Dictionary<string, TechNode>
    unlockedNodes: Set<string>
    availableNodes: Set<string>
    currentResearch: string = null

    constructor() {
        this.allNodes = {}
        this.unlockedNodes = new Set()
        this.availableNodes = new Set()

        this.loadTechTree()
        this.updateAvailableNodes()
    }

    function loadTechTree() {
        // Load all tech nodes from database
        this.allNodes = TechTreeDatabase.getAllNodes()
    }

    function updateAvailableNodes() {
        this.availableNodes.clear()

        for (nodeId, node in this.allNodes) {
            if (this.unlockedNodes.contains(nodeId)) {
                continue // Already unlocked
            }

            if (this.arePrerequisitesMet(node)) {
                this.availableNodes.add(nodeId)
            }
        }
    }

    function arePrerequisitesMet(node: TechNode): boolean {
        // Check tech prerequisites
        for (prereqId in node.prerequisites) {
            if (!this.unlockedNodes.contains(prereqId)) {
                return false
            }
        }

        // Check task prerequisites
        for (taskId, required in node.taskRequirements) {
            int current = gameManager.state.stats.getTaskProgress(taskId)
            if (current < required) {
                return false
            }
        }

        return true
    }

    function canResearch(nodeId: string): boolean {
        if (!this.availableNodes.contains(nodeId)) {
            return false
        }

        TechNode node = this.allNodes[nodeId]

        // Check resources
        if (!gameManager.resourceManager.hasResources(node.cost)) {
            return false
        }

        return true
    }

    function startResearch(nodeId: string, lab: ResearchLab): boolean {
        if (!this.canResearch(nodeId)) {
            return false
        }

        TechNode node = this.allNodes[nodeId]

        // Consume resources
        gameManager.resourceManager.consumeResources(node.cost)

        // Start research at lab
        lab.startResearch(nodeId, node)
        this.currentResearch = nodeId

        return true
    }

    function completeResearch(nodeId: string) {
        this.unlockedNodes.add(nodeId)
        this.currentResearch = null

        TechNode node = this.allNodes[nodeId]

        // Apply unlocks
        this.applyTechEffects(node)

        // Update available nodes
        this.updateAvailableNodes()

        // Spawn notification
        UI.showNotification(`Research Complete: ${node.name}`)
    }

    function applyTechEffects(node: TechNode) {
        // Unlock new buildings/weapons
        for (unlockId in node.unlocks) {
            gameManager.unlockFeature(unlockId)
        }

        // Apply stat bonuses
        for (statType, bonus in node.statBonuses) {
            gameManager.applyStatBonus(statType, bonus)
        }
    }

    function isUnlocked(nodeId: string): boolean {
        return this.unlockedNodes.contains(nodeId)
    }

    function getProgress(nodeId: string): float {
        if (this.currentResearch != nodeId) {
            return 0.0
        }

        // Get progress from active lab
        for (building in gameManager.state.buildings) {
            if (building.type == BuildingType.LAB) {
                ResearchLab lab = building as ResearchLab
                if (lab.currentResearch == nodeId) {
                    return lab.researchProgress / lab.currentTech.researchTime
                }
            }
        }

        return 0.0
    }
}

class TechNode {
    id: string
    name: string
    description: string

    // Requirements
    prerequisites: array<string> // Other tech IDs
    taskRequirements: Dictionary<string, int> // Task ID -> required amount
    cost: Dictionary<ResourceType, int>
    researchTime: float

    // Effects
    unlocks: array<string> // Feature IDs to unlock
    statBonuses: Dictionary<string, float> // Stat type -> bonus amount

    constructor(data: object) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.prerequisites = data.prerequisites || []
        this.taskRequirements = data.taskRequirements || {}
        this.cost = data.cost
        this.researchTime = data.researchTime
        this.unlocks = data.unlocks || []
        this.statBonuses = data.statBonuses || {}
    }
}
```

### 8.2 Research System

```javascript
class ResearchLab extends Building {
    currentResearch: string = null
    currentTech: TechNode = null
    researchProgress: float = 0
    researchSpeed: float = 1.0 // Affected by number of labs

    constructor(position: Vector2) {
        super(BuildingType.LAB, position)
    }

    function update(deltaTime: float) {
        super.update(deltaTime)

        if (this.currentResearch == null) {
            return
        }

        // Check power
        float powerEfficiency = gameManager.powerManager.getEfficiencyAtLocation(this.position)

        if (powerEfficiency < 0.25) {
            // Not enough power, pause research
            return
        }

        // Calculate research speed
        int totalLabs = gameManager.getTotalLabs()
        float speedMultiplier = this.calculateSpeedMultiplier(totalLabs)
        float effectiveSpeed = this.researchSpeed * speedMultiplier * powerEfficiency

        // Progress research
        this.researchProgress += effectiveSpeed * deltaTime

        // Check completion
        if (this.researchProgress >= this.currentTech.researchTime) {
            this.completeResearch()
        }
    }

    function calculateSpeedMultiplier(labCount: int): float {
        // Diminishing returns for multiple labs
        // 1 lab = 1.0x, 2 labs = 1.75x, 3 labs = 2.25x
        if (labCount <= 0) return 0.0
        if (labCount == 1) return 1.0
        if (labCount == 2) return 1.75
        if (labCount == 3) return 2.25

        // 4+ labs: 2.25 + 0.25 per additional lab
        return 2.25 + (labCount - 3) * 0.25
    }

    function startResearch(techId: string, tech: TechNode) {
        this.currentResearch = techId
        this.currentTech = tech
        this.researchProgress = 0

        // Spawn research start effect
        Effect start = new ResearchStartEffect(this.position)
        EffectManager.spawnEffect(start)
    }

    function completeResearch() {
        // Notify tech tree manager
        gameManager.techTreeManager.completeResearch(this.currentResearch)

        // Spawn completion effect
        Effect complete = new ResearchCompleteEffect(this.position)
        EffectManager.spawnEffect(complete)

        // Reset
        this.currentResearch = null
        this.currentTech = null
        this.researchProgress = 0
    }

    function getResearchPercent(): float {
        if (this.currentTech == null) {
            return 0.0
        }

        return this.researchProgress / this.currentTech.researchTime
    }
}
```

### 8.3 Achievement System

```javascript
class AchievementManager {
    achievements: array<Achievement>

    constructor() {
        this.achievements = []
        this.loadAchievements()
    }

    function loadAchievements() {
        this.achievements = AchievementDatabase.getAllAchievements()
    }

    function update() {
        for (achievement in this.achievements) {
            if (!achievement.completed) {
                achievement.checkCompletion(gameManager.state.stats)
            }
        }
    }

    function unlockAchievement(achievementId: string) {
        for (achievement in this.achievements) {
            if (achievement.id == achievementId && !achievement.completed) {
                achievement.complete()

                // Unlock rewards
                this.applyRewards(achievement)

                // Show notification
                UI.showAchievementUnlocked(achievement)
            }
        }
    }

    function applyRewards(achievement: Achievement) {
        // Unlock cosmetics
        for (cosmetic in achievement.cosmeticRewards) {
            gameManager.unlockCosmetic(cosmetic)
        }

        // Apply bonuses
        for (bonus in achievement.bonuses) {
            gameManager.applyPermanentBonus(bonus)
        }
    }

    function saveProgress() {
        // Save achievement states to persistent storage
        array<object> achievementData = []

        for (achievement in this.achievements) {
            achievementData.push({
                id: achievement.id,
                progress: achievement.progress,
                completed: achievement.completed
            })
        }

        localStorage.setItem("achievements", JSON.stringify(achievementData))
    }

    function loadProgress() {
        string data = localStorage.getItem("achievements")

        if (data == null) {
            return
        }

        array<object> achievementData = JSON.parse(data)

        for (data in achievementData) {
            Achievement achievement = this.findAchievementById(data.id)
            if (achievement != null) {
                achievement.progress = data.progress
                achievement.completed = data.completed
            }
        }
    }
}

class Achievement {
    id: string
    name: string
    description: string

    // Requirements
    requirementType: string // "enemies_killed", "waves_survived", etc.
    requirementAmount: int

    // State
    progress: int = 0
    completed: boolean = false

    // Rewards
    cosmeticRewards: array<string>
    bonuses: array<StatBonus>

    constructor(data: object) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.requirementType = data.requirementType
        this.requirementAmount = data.requirementAmount
        this.cosmeticRewards = data.cosmeticRewards || []
        this.bonuses = data.bonuses || []
    }

    function checkCompletion(stats: GameStats) {
        if (this.completed) {
            return
        }

        // Get current progress from stats
        int currentValue = stats.getStatValue(this.requirementType)
        this.progress = currentValue

        // Check if requirement met
        if (this.progress >= this.requirementAmount) {
            this.complete()
        }
    }

    function complete() {
        this.completed = true
        this.progress = this.requirementAmount

        gameManager.achievementManager.unlockAchievement(this.id)
    }

    function getProgressPercent(): float {
        return min(this.progress / this.requirementAmount, 1.0)
    }
}
```

---

## 9. MAP SYSTEMS

### 9.1 Map Generation

```javascript
class MapGenerator {
    width: int = 400
    height: int = 400

    function generate(): Map {
        let map = new Map(this.width, this.height)

        // Place ore deposits
        this.placeOreDeposits(map)

        // Place spawn points around edges
        this.placeSpawnPoints(map)

        // Add terrain features (optional)
        this.addTerrain(map)

        return map
    }

    function placeOreDeposits(map: Map) {
        let deposits = [
            { type: ResourceType.COAL, count: 5, amount: 500 },
            { type: ResourceType.IRON_ORE, count: 4, amount: 400 },
            { type: ResourceType.SILICON, count: 3, amount: 300 },
            { type: ResourceType.URANIUM, count: 2, amount: 200 }
        ]

        for (let depositConfig of deposits) {
            for (let i = 0; i < depositConfig.count; i++) {
                // Random position, but not too close to center
                let angle = random(0, Math.PI * 2)
                let distance = random(50, 150)
                let x = Math.cos(angle) * distance
                let y = Math.sin(angle) * distance

                let deposit = new OreDeposit(
                    new Vector2(x, y),
                    depositConfig.type,
                    depositConfig.amount
                )

                map.oreDeposits.push(deposit)
            }
        }
    }

    function placeSpawnPoints(map: Map) {
        // 8 spawn points around the edges
        for (let i = 0; i < 8; i++) {
            let angle = (i / 8) * Math.PI * 2
            let x = Math.cos(angle) * 180
            let y = Math.sin(angle) * 180

            map.spawnPoints.push(new Vector2(x, y))
        }
    }

    function addTerrain(map: Map) {
        // Optional: Add hills, obstacles, etc.
        // For simplicity, keep flat for now
    }
}

class Map {
    width: int
    height: int
    grid: Grid
    oreDeposits: array<OreDeposit> = []
    spawnPoints: array<Vector2> = []

    constructor(w: int, h: int) {
        this.width = w
        this.height = h
        this.grid = new Grid(w, h)
    }
}
```

### 9.2 Map Editor (Optional)

```javascript
class MapEditor {
    currentTool: string = "place_ore"
    selectedOreType: ResourceType = ResourceType.COAL

    function update() {
        if (Input.isMouseButtonPressed(MOUSE_LEFT)) {
            let pos = Input.getMouseWorldPosition()

            switch (this.currentTool) {
                case "place_ore":
                    this.placeOreDeposit(pos)
                    break
                case "place_spawn":
                    this.placeSpawnPoint(pos)
                    break
                case "remove":
                    this.removeObject(pos)
                    break
            }
        }
    }

    function placeOreDeposit(position: Vector2) {
        let deposit = new OreDeposit(position, this.selectedOreType, 500)
        gameManager.mapManager.map.oreDeposits.push(deposit)
    }

    function placeSpawnPoint(position: Vector2) {
        gameManager.mapManager.map.spawnPoints.push(position)
    }

    function saveMap(filename: string) {
        let mapData = {
            width: gameManager.mapManager.map.width,
            height: gameManager.mapManager.map.height,
            oreDeposits: gameManager.mapManager.map.oreDeposits.map(d => ({
                position: d.position,
                type: d.resourceType,
                amount: d.totalAmount
            })),
            spawnPoints: gameManager.mapManager.map.spawnPoints
        }

        localStorage.setItem(`custom_map_${filename}`, JSON.stringify(mapData))
    }

    function loadMap(filename: string) {
        let data = localStorage.getItem(`custom_map_${filename}`)
        if (!data) return null

        let mapData = JSON.parse(data)
        let map = new Map(mapData.width, mapData.height)

        for (let depositData of mapData.oreDeposits) {
            let deposit = new OreDeposit(
                depositData.position,
                depositData.type,
                depositData.amount
            )
            map.oreDeposits.push(deposit)
        }

        map.spawnPoints = mapData.spawnPoints

        return map
    }
}
```

---

## 10. UI SYSTEMS

### 10.1 HUD Manager

```javascript
class HUD {
    function render() {
        this.renderHealthBar()
        this.renderWaveInfo()
        this.renderResources()
        this.renderPowerStatus()
        this.renderMinimap()
    }

    function renderHealthBar() {
        Player player = gameManager.state.player
        float healthPercent = player.health / player.maxHealth

        // Draw background bar
        UI.drawRect(10, 10, 200, 20, Color.DARK_GRAY)

        // Draw health bar (red/yellow/green based on health)
        Color healthColor = this.getHealthColor(healthPercent)
        UI.drawRect(10, 10, 200 * healthPercent, 20, healthColor)

        // Draw text
        UI.drawText(
            `HP: ${player.health}/${player.maxHealth}`,
            15, 25,
            Color.WHITE
        )
    }

    function getHealthColor(percent: float): Color {
        if (percent > 0.6) return Color.GREEN
        if (percent > 0.3) return Color.YELLOW
        return Color.RED
    }

    function renderWaveInfo() {
        WaveManager wm = gameManager.waveManager

        string waveText = `Wave: ${wm.currentWave}`

        if (wm.waveActive) {
            int enemiesLeft = gameManager.state.enemies.length + wm.enemiesRemainingInWave
            waveText += ` | Enemies: ${enemiesLeft}`
        } else {
            int timeUntilNext = ceil(wm.timeBetweenWaves - wm.waveTimer)
            waveText += ` | Next in: ${timeUntilNext}s`
        }

        UI.drawText(waveText, 10, 50, Color.WHITE)
    }

    function renderResources() {
        int y = 80

        // Show key resources
        array<ResourceType> keyResources = [
            ResourceType.SCRAP_METAL,
            ResourceType.METALLIC_PLATE,
            ResourceType.STEEL_PLATE,
            ResourceType.PROCESSING_UNIT
        ]

        for (resourceType in keyResources) {
            int amount = gameManager.resourceManager.getResourceAmount(resourceType)
            string name = this.getResourceName(resourceType)

            UI.drawText(`${name}: ${amount}`, 10, y, Color.WHITE)
            y += 20
        }
    }

    function renderPowerStatus() {
        PowerManager pm = gameManager.powerManager

        string powerText = `Power: ${pm.totalGeneration}/${pm.totalConsumption}`
        Color powerColor = this.getPowerColor(pm.powerEfficiency)

        UI.drawText(powerText, 10, 180, powerColor)

        // Draw efficiency bar
        float effPercent = clamp(pm.powerEfficiency, 0, 1)
        UI.drawRect(10, 200, 200, 10, Color.DARK_GRAY)
        UI.drawRect(10, 200, 200 * effPercent, 10, powerColor)
    }

    function getPowerColor(efficiency: float): Color {
        if (efficiency >= 1.0) return Color.GREEN
        if (efficiency >= 0.5) return Color.YELLOW
        return Color.RED
    }

    function renderMinimap() {
        // Minimap in top-right corner
        int mapSize = 200
        int mapX = ScreenWidth - mapSize - 10
        int mapY = 10

        // Background
        UI.drawRect(mapX, mapY, mapSize, mapSize, Color.BLACK)

        // Scale factor
        float scale = mapSize / gameManager.mapManager.map.width

        // Draw buildings
        for (building in gameManager.state.buildings) {
            Vector2 mapPos = this.worldToMinimapPos(building.position, mapX, mapY, scale)
            Color buildingColor = this.getBuildingMinimapColor(building.type)
            UI.drawCircle(mapPos.x, mapPos.y, 2, buildingColor)
        }

        // Draw enemies
        for (enemy in gameManager.state.enemies) {
            Vector2 mapPos = this.worldToMinimapPos(enemy.position, mapX, mapY, scale)
            UI.drawCircle(mapPos.x, mapPos.y, 1, Color.RED)
        }

        // Draw player
        Player player = gameManager.state.player
        Vector2 playerMapPos = this.worldToMinimapPos(player.position, mapX, mapY, scale)
        UI.drawCircle(playerMapPos.x, playerMapPos.y, 3, Color.CYAN)

        // Border
        UI.drawRectOutline(mapX, mapY, mapSize, mapSize, Color.WHITE)
    }

    function worldToMinimapPos(worldPos: Vector2, mapX: int, mapY: int, scale: float): Vector2 {
        Vector2 centered = worldPos + new Vector2(
            gameManager.mapManager.map.width / 2,
            gameManager.mapManager.map.height / 2
        )

        return new Vector2(
            mapX + centered.x * scale,
            mapY + centered.y * scale
        )
    }

    function getBuildingMinimapColor(type: BuildingType): Color {
        switch (type) {
            case BuildingType.CORE: return Color.BLUE
            case BuildingType.TURRET: return Color.YELLOW
            case BuildingType.POWER_GENERATOR: return Color.PURPLE
            default: return Color.GRAY
        }
    }
}
```

### 10.2 Building Toolbar

```javascript
class BuildingToolbar {
    buildings: array<BuildingType> = []
    selectedIndex: int = -1

    constructor() {
        this.loadAvailableBuildings()
    }

    function loadAvailableBuildings() {
        // Add buildings that are unlocked
        this.buildings = [
            BuildingType.TURRET,
            BuildingType.REFINERY,
            BuildingType.POWER_GENERATOR
        ]

        // Add more based on tech unlocks
        if (gameManager.techTreeManager.isUnlocked("solar_power")) {
            this.buildings.push(BuildingType.SOLAR_PANEL)
        }

        // ... more unlocks
    }

    function render() {
        int buttonSize = 64
        int padding = 10
        int startX = (ScreenWidth / 2) - ((this.buildings.length * (buttonSize + padding)) / 2)
        int y = ScreenHeight - buttonSize - 20

        for (int i = 0; i < this.buildings.length; i++) {
            int x = startX + i * (buttonSize + padding)
            BuildingType type = this.buildings[i]

            // Draw button background
            Color bgColor = (i == this.selectedIndex) ? Color.YELLOW : Color.GRAY
            UI.drawRect(x, y, buttonSize, buttonSize, bgColor)

            // Draw building icon
            this.drawBuildingIcon(type, x, y, buttonSize)

            // Draw cost
            this.drawCost(type, x, y + buttonSize + 5)

            // Check for click
            if (Input.isMouseButtonJustPressed(MOUSE_LEFT)) {
                Vector2 mousePos = Input.getMousePosition()
                if (this.isPointInRect(mousePos, x, y, buttonSize, buttonSize)) {
                    this.selectBuilding(i)
                }
            }
        }

        // Hotkeys (1-9)
        for (int i = 0; i < min(9, this.buildings.length); i++) {
            if (Input.isKeyJustPressed(KEY_1 + i)) {
                this.selectBuilding(i)
            }
        }
    }

    function selectBuilding(index: int) {
        this.selectedIndex = index
        BuildingType type = this.buildings[index]

        gameManager.buildingPlacementSystem.startPlacing(type)
    }

    function drawBuildingIcon(type: BuildingType, x: int, y: int, size: int) {
        // Draw simple representation of building
        // This would use actual sprites in real implementation
        UI.drawText(this.getBuildingName(type), x + 5, y + size/2, Color.WHITE)
    }

    function drawCost(type: BuildingType, x: int, y: int) {
        Dictionary<ResourceType, int> cost = BuildingCostDatabase.getCost(type)

        string costText = ""
        for (resourceType, amount in cost) {
            costText += `${this.getResourceShortName(resourceType)}: ${amount} `
        }

        UI.drawText(costText, x, y, Color.WHITE, 10)
    }

    function isPointInRect(point: Vector2, x: int, y: int, w: int, h: int): boolean {
        return point.x >= x && point.x <= x + w &&
               point.y >= y && point.y <= y + h
    }
}
```

### 10.3 Tech Tree UI

```javascript
class TechTreeUI {
    isVisible: boolean = false
    nodes: Dictionary<string, TechNodeUI> = {}

    function toggle() {
        this.isVisible = !this.isVisible
    }

    function render() {
        if (!this.isVisible) return

        // Background overlay
        UI.drawRect(0, 0, ScreenWidth, ScreenHeight, Color.BLACK_TRANSPARENT)

        // Tech tree panel
        int panelWidth = 800
        int panelHeight = 600
        int panelX = (ScreenWidth - panelWidth) / 2
        int panelY = (ScreenHeight - panelHeight) / 2

        UI.drawRect(panelX, panelY, panelWidth, panelHeight, Color.DARK_GRAY)

        // Title
        UI.drawText("Tech Tree", panelX + 20, panelY + 30, Color.WHITE, 24)

        // Render tech nodes
        this.renderTechNodes(panelX, panelY, panelWidth, panelHeight)

        // Close button
        if (Input.isKeyJustPressed(KEY_ESCAPE)) {
            this.toggle()
        }
    }

    function renderTechNodes(panelX: int, panelY: int, panelWidth: int, panelHeight: int) {
        TechTreeManager ttm = gameManager.techTreeManager

        // Organize nodes by tier
        array<array<string>> tiers = this.organizeTechNodesByTier()

        int nodeSize = 80
        int tierSpacing = 120
        int nodeSpacing = 100

        for (int tierIndex = 0; tierIndex < tiers.length; tierIndex++) {
            array<string> tierNodes = tiers[tierIndex]
            int tierX = panelX + 50 + tierIndex * tierSpacing

            for (int nodeIndex = 0; nodeIndex < tierNodes.length; nodeIndex++) {
                string nodeId = tierNodes[nodeIndex]
                TechNode node = ttm.allNodes[nodeId]

                int nodeY = panelY + 100 + nodeIndex * nodeSpacing

                // Determine node state
                boolean unlocked = ttm.isUnlocked(nodeId)
                boolean available = ttm.availableNodes.contains(nodeId)
                boolean canResearch = ttm.canResearch(nodeId)

                // Draw node
                Color nodeColor = this.getNodeColor(unlocked, available, canResearch)
                UI.drawRect(tierX, nodeY, nodeSize, nodeSize, nodeColor)

                // Draw node name
                UI.drawText(node.name, tierX + 5, nodeY + 20, Color.WHITE, 12)

                // Draw research progress if active
                if (ttm.currentResearch == nodeId) {
                    float progress = ttm.getProgress(nodeId)
                    UI.drawRect(tierX, nodeY + nodeSize - 5, nodeSize * progress, 5, Color.CYAN)
                }

                // Check for click
                if (Input.isMouseButtonJustPressed(MOUSE_LEFT)) {
                    Vector2 mousePos = Input.getMousePosition()
                    if (this.isPointInRect(mousePos, tierX, nodeY, nodeSize, nodeSize)) {
                        this.onNodeClicked(nodeId)
                    }
                }

                // Draw connections to prerequisites
                this.drawPrerequisiteConnections(node, tierX, nodeY, nodeSize)
            }
        }
    }

    function getNodeColor(unlocked: boolean, available: boolean, canResearch: boolean): Color {
        if (unlocked) return Color.GREEN
        if (canResearch) return Color.YELLOW
        if (available) return Color.LIGHT_GRAY
        return Color.DARK_GRAY
    }

    function onNodeClicked(nodeId: string) {
        TechTreeManager ttm = gameManager.techTreeManager

        if (ttm.canResearch(nodeId)) {
            // Find available research lab
            for (building in gameManager.state.buildings) {
                if (building.type == BuildingType.LAB) {
                    ResearchLab lab = building as ResearchLab
                    if (lab.currentResearch == null) {
                        ttm.startResearch(nodeId, lab)
                        break
                    }
                }
            }
        } else {
            // Show why can't research (missing prereqs/resources)
            this.showNodeTooltip(nodeId)
        }
    }

    function organizeTechNodesByTier(): array<array<string>> {
        // This would organize nodes by their prerequisite depth
        // Tier 0 = no prereqs, Tier 1 = depends on Tier 0, etc.
        array<array<string>> tiers = []

        // Placeholder implementation
        tiers[0] = ["basic_automation", "basic_turrets", "power_management"]
        tiers[1] = ["collector_speed", "mining_robots", "solar_power"]
        tiers[2] = ["energy_weapons_1", "advanced_turrets"]
        tiers[3] = ["energy_weapons_2", "reactor_technology"]
        tiers[4] = ["super_weapons", "quantum_computing"]

        return tiers
    }
}
```

---

## END OF DETAILED SECTIONS DOCUMENT

This document provides complete implementation details for:
- **Section 7**: Power Grid, Generators, Accumulators
- **Section 8**: Tech Tree, Research Labs, Achievements
- **Section 9**: Map Generation, Map Editor
- **Section 10**: HUD, Building Toolbar, Tech Tree UI

Combined with `game-pseudocode-complete.md` (Sections 1-6) and `sci-fi-td-complete-pseudocode.md` (complete databases), you have all the pseudocode needed to implement the entire game.
