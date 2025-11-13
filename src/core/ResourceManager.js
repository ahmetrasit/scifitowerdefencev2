/**
 * ResourceType - Enum for all resource types
 */
const ResourceType = {
    // Raw Materials (dropped by enemies)
    SCRAP_METAL: 'SCRAP_METAL',
    ELECTRONIC_COMPONENT: 'ELECTRONIC_COMPONENT',
    ENERGY_CELL: 'ENERGY_CELL',
    RARE_MINERAL: 'RARE_MINERAL',

    // Mined Resources
    COAL: 'COAL',
    IRON_ORE: 'IRON_ORE',
    SILICON: 'SILICON',
    URANIUM: 'URANIUM',

    // Processed Materials
    METALLIC_PLATE: 'METALLIC_PLATE',
    STEEL_PLATE: 'STEEL_PLATE',
    CIRCUIT_BOARD: 'CIRCUIT_BOARD',
    PROCESSING_UNIT: 'PROCESSING_UNIT',
    ADVANCED_CHIP: 'ADVANCED_CHIP',

    // Intermediate Components
    WIRING_BUNDLE: 'WIRING_BUNDLE',
    CAPACITOR: 'CAPACITOR',
    WEAPON_COMPONENT: 'WEAPON_COMPONENT',
    ARMOR_PLATE: 'ARMOR_PLATE',
    PLASMA_CORE: 'PLASMA_CORE',
    QUANTUM_PROCESSOR: 'QUANTUM_PROCESSOR',

    // Ammunition
    BASIC_MAGAZINE: 'BASIC_MAGAZINE',
    ADVANCED_MAGAZINE: 'ADVANCED_MAGAZINE',
    GUNPOWDER: 'GUNPOWDER',
    ROCKET: 'ROCKET',
    ENERGY_PACK: 'ENERGY_PACK',
    FUEL_CELL: 'FUEL_CELL'
};

/**
 * ResourceManager - Manages all game resources
 */
class ResourceManager {
    constructor() {
        this.resources = {};
        this.maxStorage = {};

        // Initialize all resources to 0
        for (const type in ResourceType) {
            this.resources[ResourceType[type]] = 0;
            this.maxStorage[ResourceType[type]] = 1000;
        }

        // Give starting resources
        this.resources[ResourceType.SCRAP_METAL] = 50;
        this.resources[ResourceType.METALLIC_PLATE] = 10;
    }

    addResource(type, amount) {
        const currentAmount = this.resources[type] || 0;
        const maxAmount = this.maxStorage[type] || 1000;

        this.resources[type] = Math.min(currentAmount + amount, maxAmount);

        return this.resources[type] - currentAmount; // Return actual amount added
    }

    removeResource(type, amount) {
        if (this.hasResource(type, amount)) {
            this.resources[type] -= amount;
            return true;
        }
        return false;
    }

    hasResource(type, amount) {
        return (this.resources[type] || 0) >= amount;
    }

    hasResources(requirements) {
        for (const type in requirements) {
            if (!this.hasResource(type, requirements[type])) {
                return false;
            }
        }
        return true;
    }

    consumeResources(requirements) {
        if (!this.hasResources(requirements)) {
            return false;
        }

        for (const type in requirements) {
            this.removeResource(type, requirements[type]);
        }

        return true;
    }

    getResourceAmount(type) {
        return this.resources[type] || 0;
    }

    getMaxStorage(type) {
        return this.maxStorage[type] || 1000;
    }

    setMaxStorage(type, amount) {
        this.maxStorage[type] = amount;
    }

    increaseMaxStorage(type, amount) {
        this.maxStorage[type] = (this.maxStorage[type] || 1000) + amount;
    }

    // Get resource name for display
    getResourceName(type) {
        return type.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    // Get short name for display
    getResourceShortName(type) {
        const shortNames = {
            [ResourceType.SCRAP_METAL]: 'Scrap',
            [ResourceType.ELECTRONIC_COMPONENT]: 'Electronics',
            [ResourceType.METALLIC_PLATE]: 'Metal Plate',
            [ResourceType.STEEL_PLATE]: 'Steel',
            [ResourceType.PROCESSING_UNIT]: 'CPU',
            [ResourceType.ADVANCED_CHIP]: 'Adv Chip',
            [ResourceType.WIRING_BUNDLE]: 'Wiring',
            [ResourceType.WEAPON_COMPONENT]: 'Weapon Part'
        };

        return shortNames[type] || this.getResourceName(type);
    }
}
