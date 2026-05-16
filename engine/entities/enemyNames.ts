import { randomPick } from "@/shared/lib/math"

const ADJECTIVES = [
    "Podrido", "Putrefacto", "Sombrío", "Espectral", "Abismal", "Oscuro",
    "Sangriento", "Maldito", "Olvidado", "Profano", "Marchito", "Ácido",
    "Corrosivo", "Letal", "Veneno", "Fétido", "Mustio", "Pálido",
    "Tenebroso", "Hueco", "Cenagoso", "Ígneo", "Gélido", "Tormentoso",
    "Baldío", "Yermo", "Ruinoso", "Quebrado", "Avernal", "Infernal",
    "Siniestro", "Lóbrego", "Macabro", "Fúnebre", "Nefasto", "Ominoso",
    "Horrendo", "Monstruoso", "Fantasmal", "Viscoso", "Vil", "Arcano",
    "Vetusto", "Desolado", "Lívido", "Impío", "Cruel", "Voraz",
    "Sigiloso", "Furtivo", "Ávido", "Lúgubre", "Hambriento", "Incógnito",
]

const BASE_NAMES: Record<string, string[]> = {
    slime: [
        "Gota", "Baba", "Moco", "Viscosidad", "Gelatina", "Pus", "Limo",
        "Humor", "Secreción", "Ameba", "Mucílago", "Savia Negra",
        "Cieno", "Légamo", "Fango", "Lodo", "Brea", "Melaza",
        "Burbuja", "Espuma", "Pringue", "Flema", "Ichor", "Baba",
    ],
    skeleton: [
        "Esqueleto", "Huesos", "Calaca", "Osamenta", "Calavera",
        "Fémur", "Costillar", "Tibia", "Cráneo", "Húmero",
        "Pelvis", "Falange", "Mandíbula", "Polvo", "Momia",
        "Cadáver", "Esquirla", "Ceniza", "Restos", "Tórax",
    ],
    bat: [
        "Murciélago", "Quiróptero", "Vespertilio", "Nocturna", "Rata Alada",
        "Ecolocalizador", "Sombra Volante", "Nicticorax", "Desgarro",
        "Gruta", "Caverna", "Chillido", "Enjambre", "Sangre",
        "Susurro", "Lechuza", "Sombra", "Zumbido", "Lamento",
    ],
    goblin: [
        "Goblin", "Trasgo", "Duende", "Trolín", "Engendro", "Gnomo Oscuro",
        "Gremlin", "Uruk", "Pícaro", "Lacayo", "Ruín", "Chirriante",
        "Orco", "Coco", "Bribón", "Travieso", "Pesadilla", "Bellaco",
        "Truhán", "Malandrín", "Esbirro", "Jorobado", "Verruga",
    ],
    golem: [
        "Gólem", "Autómata", "Coloso", "Estatua", "Gigante de Roca",
        "Titán de Piedra", "Monolito", "Guardian", "Centinela", "Forjado",
        "Armadura", "Mole", "Coraza", "Granito", "Basalto", "Mármol",
        "Arcilla", "Hierro", "Bronce", "Yunque", "Martillo",
    ],
}

const SUFFIXES = [
    "de la Cripta", "del Abismo", "del Pantano", "de las Sombras",
    "del Inframundo", "del Oscuro", "de la Noche Eterna", "del Vacío",
    "de las Profundidades", "del Lodo", "de la Ruina", "del Averno",
    "de la Putrefacción", "del Olvido", "del Valle Muerto", "del Sepulcro",
    "de la Bruma", "del Yermo", "del Crepúsculo", "de la Ceniza",
    "de la Tumba", "del Osario", "de las Catacumbas", "de la Mazmorra",
    "de las Tinieblas", "del Panteón", "del Páramo", "del Caos",
    "de la Sangre", "del Hueso", "de los Lamentos", "de la Mortaja",
    "de la Pestilencia", "del Foso", "del Moho", "del Óxido",
]

const TITLES: Record<string, string[]> = {
    slime: ["el Viscoso", "el Ácido", "el Disolvente", "la Masa", "el Informe"],
    skeleton: ["el Quebrado", "el Rutilante", "el Descarnado", "el Silente", "el Huesudo"],
    bat: ["el Nocturno", "el Silencioso", "el Susurrante", "el Ciego", "el Sediento"],
    goblin: ["el Astuto", "el Tramposo", "el Ruín", "el Chillon", "el Pequeño", "el Furtivo"],
    golem: ["el Imparable", "el Eterno", "el Silente", "el Colosal", "el Inquebrantable", "el Primigenio"],
}

export function generateEnemyName(enemyType: string): string {
    const pattern = Math.random()

    const baseList = BASE_NAMES[enemyType]
    if (!baseList) return "Criatura"

    const base = randomPick(baseList)

    if (pattern < 0.3) {
        const adj = randomPick(ADJECTIVES)
        const suffix = randomPick(SUFFIXES)
        return `${adj} ${base} ${suffix}`
    }

    if (pattern < 0.55) {
        const adj = randomPick(ADJECTIVES)
        return `${adj} ${base}`
    }

    if (pattern < 0.75) {
        const titleList = TITLES[enemyType]
        const title = titleList ? randomPick(titleList) : ""
        return `${base} ${title}`
    }

    if (pattern < 0.9) {
        const suffix = randomPick(SUFFIXES)
        return `${base} ${suffix}`
    }

    const adj = randomPick(ADJECTIVES)
    const titleList = TITLES[enemyType]
    const title = titleList ? randomPick(titleList) : ""
    return `${adj} ${base} ${title}`
}
