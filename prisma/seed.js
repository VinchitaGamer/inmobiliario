require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sampleProperties = [
  {
    title: "Hermosa Casa de Lujo en Urubó",
    description: "Espectacular casa de 2 plantas en condominio cerrado en Urubó. Cuenta con amplios jardines, piscina privada, acabados de primera calidad, churrasquera, 4 dormitorios en suite, dependencia de servicios y parqueo para 3 vehículos. Seguridad las 24 horas.",
    operationType: "VENTA",
    propertyType: "Casa",
    price: 420000,
    currency: "USD",
    locationCity: "Santa Cruz",
    locationZone: "Urubó",
    bedrooms: 4,
    bathrooms: 5,
    area: 450,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Piscina", "Churrasquera", "Seguridad 24h", "Jardín", "Condominio Cerrado", "Garaje"],
    contactPhone: "+59170000000",
    isFeatured: true
  },
  {
    title: "Departamento Amoblado en Equipetrol",
    description: "Moderno departamento de 2 dormitorios en el corazón de Equipetrol. Totalmente amoblado y equipado con aire acondicionado, cocina encimera, extractor, horno. Áreas comunes de lujo con piscina sin fin, churrasqueras y salón de eventos.",
    operationType: "ALQUILER",
    propertyType: "Departamento",
    price: 850,
    currency: "USD",
    locationCity: "Santa Cruz",
    locationZone: "Equipetrol",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Amoblado", "Piscina Común", "Churrasquera", "Aire Acondicionado", "Garaje", "Gimnasio"],
    contactPhone: "+59170000000",
    isFeatured: true
  },
  {
    title: "Departamento en Anticrético - Sopocachi",
    description: "Excelente departamento de 3 dormitorios en Sopocachi, a pasos de la plaza España. Muy iluminado y soleado, piso parquet, cocina con cajonería alta y baja. Ideal para familias. Papeles al día para registro de anticrético.",
    operationType: "ANTICRETICO",
    propertyType: "Departamento",
    price: 45000,
    currency: "USD",
    locationCity: "La Paz",
    locationZone: "Sopocachi",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Gas Domiciliario", "Ascensor", "Piso Parquet", "Seguridad"],
    contactPhone: "+59170000000",
    isFeatured: false
  },
  {
    title: "Proyecto Condominio Residencial - Calacoto",
    description: "Lanzamiento en pre-venta. Departamentos de 1, 2 y 3 dormitorios en la zona más exclusiva de la Zona Sur de La Paz. Edificio sismorresistente, sistema de domótica integrado, calefacción central, áreas recreativas infantiles y coworking.",
    operationType: "PROYECTO",
    propertyType: "Departamento",
    price: 98000,
    currency: "USD",
    locationCity: "La Paz",
    locationZone: "Calacoto",
    bedrooms: 2,
    bathrooms: 2,
    area: 90,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["En Construcción", "Coworking", "Domótica", "Calefacción Central", "Garaje"],
    contactPhone: "+59170000000",
    isFeatured: true
  },
  {
    title: "Hermoso Departamento Zona Queru Queru",
    description: "Amplio departamento de 3 dormitorios en venta. Excelente ubicación en la zona norte de Cochabamba (Queru Queru). Suite principal con vestidor, cocina cerrada, balcón con hermosa vista a la ciudad y parque nacional Tunari.",
    operationType: "VENTA",
    propertyType: "Departamento",
    price: 135000,
    currency: "USD",
    locationCity: "Cochabamba",
    locationZone: "Queru Queru",
    bedrooms: 3,
    bathrooms: 3,
    area: 145,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Balcón", "Churrasquera Común", "Garaje", "Baulera", "Gas Domiciliario"],
    contactPhone: "+59170000000",
    isFeatured: false
  },
  {
    title: "Casa de 3 Dormitorios en Anticrético - Cala Cala",
    description: "Hermosa casa independiente en anticrético en Cala Cala. Cuenta con un patio delantero pequeño, garaje para 2 vehículos, 3 dormitorios amplios, estar familiar, y terraza. Ubicación privilegiada residencial muy tranquila.",
    operationType: "ANTICRETICO",
    propertyType: "Casa",
    price: 55000,
    currency: "USD",
    locationCity: "Cochabamba",
    locationZone: "Cala Cala",
    bedrooms: 3,
    bathrooms: 3,
    area: 210,
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Patio", "Terraza", "Garaje Doble", "Depósito"],
    contactPhone: "+59170000000",
    isFeatured: false
  }
];

async function main() {
  console.log("Iniciando el seeding de propiedades...");
  
  // Limpiar base de datos antes de poblar (opcional, útil para pruebas locales)
  await prisma.property.deleteMany({});
  
  for (const property of sampleProperties) {
    const created = await prisma.property.create({
      data: property
    });
    console.log(`Propiedad creada: ${created.title} (${created.locationCity} - ${created.locationZone})`);
  }
  
  console.log("Seeding completado con éxito.");
}

main()
  .catch((e) => {
    console.error("Error durante el seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
