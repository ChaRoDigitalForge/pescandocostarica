// Tours de ejemplo para desarrollo local
export const mockTours = [
  // Tours Premium de Alta Mar
  {
    id: '1',
    slug: 'pesca-marlin-azul-quepos-premium',
    title: 'Pesca de Marlín Azul Premium',
    short_description: 'Experiencia exclusiva de pesca de marlín en Quepos',
    description: 'Vive la emoción de pescar marlín azul y pez vela en las aguas cristalinas del Pacífico. Incluye capitán experimentado, equipo profesional Penn y Shimano, almuerzo gourmet y bebidas premium. Salida a las 6:00 AM para aprovechar las mejores horas de pesca.',
    fishing_type: 'altaMar',
    provincia_code: 'puntarenas',
    provincia_name: 'Puntarenas',
    location_name: 'Quepos',
    duration_hours: 8,
    duration_display: '8 Horas',
    capacity: 6,
    price: 1250.00,
    original_price: 1450.00,
    main_image_url: '/tour-detail-02.webp',
    image_gallery: ['/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-10.webp'],
    is_featured: true,
    difficulty_level: 5,
    average_rating: 4.9,
    total_reviews: 28,
    status: 'active'
  },
  {
    id: '2',
    slug: 'pesca-pez-vela-flamingo',
    title: 'Aventura de Pez Vela en Flamingo',
    short_description: 'Pesca deportiva de pez vela en Playa Flamingo',
    description: 'Flamingo es reconocido mundialmente por su pesca de pez vela. Tour de día completo con todas las comodidades incluidas. Nuestro equipo de primera clase y capitanes con más de 20 años de experiencia garantizan una aventura inolvidable.',
    fishing_type: 'altaMar',
    provincia_code: 'guanacaste',
    provincia_name: 'Guanacaste',
    location_name: 'Flamingo',
    duration_hours: 8,
    duration_display: '1 Día',
    capacity: 5,
    price: 1100.00,
    original_price: null,
    main_image_url: '/tour-detail-10.webp',
    image_gallery: ['/tour-detail-10.webp', '/tour-detail-02.webp', '/tour-detail-05.webp'],
    is_featured: true,
    difficulty_level: 4,
    average_rating: 4.8,
    total_reviews: 35,
    status: 'active'
  },
  {
    id: '3',
    slug: 'pesca-dorado-golfito',
    title: 'Pesca de Dorado en Golfito',
    short_description: 'Expedición de dorado en el sur del Pacífico',
    description: 'Golfito ofrece excelentes condiciones para la pesca de dorado. Tour completo con equipo de pesca profesional, refrigerios y guía experto. Ideal para pescadores experimentados que buscan el desafío del dorado del Pacífico.',
    fishing_type: 'altaMar',
    provincia_code: 'puntarenas',
    provincia_name: 'Puntarenas',
    location_name: 'Golfito',
    duration_hours: 10,
    duration_display: '10 Horas',
    capacity: 6,
    price: 950.00,
    original_price: 1100.00,
    main_image_url: '/tour-detail-02.webp',
    image_gallery: ['/tour-detail-02.webp', '/tour-detail-10.webp', '/tour-detail-05.webp'],
    is_featured: true,
    difficulty_level: 4,
    average_rating: 4.7,
    total_reviews: 22,
    status: 'active'
  },

  // Tours Costeros - Precio Medio
  {
    id: '4',
    slug: 'pesca-costera-tamarindo',
    title: 'Pesca Costera Familiar - Tamarindo',
    short_description: 'Pesca relajante para toda la familia',
    description: 'Experiencia perfecta para familias y principiantes. Pesca de róbalo, pargo y otros peces costeros en las hermosas aguas de Tamarindo. Incluye equipo básico, snacks y capitán bilingüe.',
    fishing_type: 'costera',
    provincia_code: 'guanacaste',
    provincia_name: 'Guanacaste',
    location_name: 'Tamarindo',
    duration_hours: 4,
    duration_display: '4 Horas',
    capacity: 4,
    price: 380.00,
    original_price: null,
    main_image_url: '/tour-detail-05.webp',
    image_gallery: ['/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-02.webp'],
    is_featured: false,
    difficulty_level: 1,
    average_rating: 4.6,
    total_reviews: 45,
    status: 'active'
  },
  {
    id: '5',
    slug: 'atardecer-pesca-coco',
    title: 'Pesca al Atardecer - Playa del Coco',
    short_description: 'Pesca con vista al atardecer del Pacífico',
    description: 'Disfruta de una tarde mágica pescando mientras contemplas el espectacular atardecer del Pacífico. Perfecto para parejas y grupos pequeños. Incluye bebidas, snacks y equipo completo.',
    fishing_type: 'costera',
    provincia_code: 'guanacaste',
    provincia_name: 'Guanacaste',
    location_name: 'Playa del Coco',
    duration_hours: 5,
    duration_display: '5 Horas',
    capacity: 4,
    price: 420.00,
    original_price: null,
    main_image_url: '/tour-detail-05.webp',
    image_gallery: ['/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-10.webp'],
    is_featured: false,
    difficulty_level: 2,
    average_rating: 4.8,
    total_reviews: 38,
    status: 'active'
  },
  {
    id: '6',
    slug: 'pesca-pargo-herradura',
    title: 'Pesca de Pargo - Playa Herradura',
    short_description: 'Pesca costera de pargo cerca de Jacó',
    description: 'Tour de medio día especializado en pesca de pargo rojo y cubera. Zona de pesca cerca de la costa con excelentes resultados. Perfecto para grupos y principiantes.',
    fishing_type: 'costera',
    provincia_code: 'puntarenas',
    provincia_name: 'Puntarenas',
    location_name: 'Playa Herradura',
    duration_hours: 6,
    duration_display: '6 Horas',
    capacity: 5,
    price: 550.00,
    original_price: 650.00,
    main_image_url: '/tour-detail-03.webp',
    image_gallery: ['/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-02.webp'],
    is_featured: false,
    difficulty_level: 2,
    average_rating: 4.5,
    total_reviews: 31,
    status: 'active'
  },

  // Tours de Río y Manglar
  {
    id: '7',
    slug: 'pesca-robalo-manglar-sierpe',
    title: 'Pesca de Róbalo en Manglar Sierpe',
    short_description: 'Aventura en manglares de Sierpe',
    description: 'Explora los manglares de Sierpe mientras pescas róbalo, sábalo y snook. Experiencia única navegando por canales naturales rodeado de vida silvestre. Incluye guía naturalista.',
    fishing_type: 'rio',
    provincia_code: 'puntarenas',
    provincia_name: 'Puntarenas',
    location_name: 'Sierpe',
    duration_hours: 6,
    duration_display: '6 Horas',
    capacity: 4,
    price: 480.00,
    original_price: null,
    main_image_url: '/tour-detail-03.webp',
    image_gallery: ['/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-10.webp'],
    is_featured: true,
    difficulty_level: 2,
    average_rating: 4.9,
    total_reviews: 42,
    status: 'active'
  },
  {
    id: '8',
    slug: 'pesca-tarpon-tortuguero',
    title: 'Pesca de Tarpón - Tortuguero',
    short_description: 'Pesca de tarpón en canales del Caribe',
    description: 'Los canales de Tortuguero son famosos por sus tarpones gigantes. Tour completo con equipo especializado para pesca de tarpón. Una de las experiencias de pesca más emocionantes de Costa Rica.',
    fishing_type: 'rio',
    provincia_code: 'limon',
    provincia_name: 'Limón',
    location_name: 'Tortuguero',
    duration_hours: 8,
    duration_display: '1 Día',
    capacity: 3,
    price: 680.00,
    original_price: null,
    main_image_url: '/tour-detail-02.webp',
    image_gallery: ['/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-05.webp'],
    is_featured: true,
    difficulty_level: 4,
    average_rating: 5.0,
    total_reviews: 19,
    status: 'active'
  },
  {
    id: '9',
    slug: 'pesca-sabalo-puerto-viejo',
    title: 'Pesca Caribeña - Puerto Viejo',
    short_description: 'Pesca en el Caribe de Costa Rica',
    description: 'Experiencia única de pesca en el Caribe costarricense. Pesca de sábalo, róbalo y tarpon en aguas cristalinas. Ambiente relajado tipo caribeño con capitán local.',
    fishing_type: 'costera',
    provincia_code: 'limon',
    provincia_name: 'Limón',
    location_name: 'Puerto Viejo',
    duration_hours: 5,
    duration_display: '5 Horas',
    capacity: 4,
    price: 390.00,
    original_price: null,
    main_image_url: '/tour-detail-03.webp',
    image_gallery: ['/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-02.webp'],
    is_featured: false,
    difficulty_level: 2,
    average_rating: 4.7,
    total_reviews: 26,
    status: 'active'
  },
  {
    id: '10',
    slug: 'pesca-rio-sarapiqui',
    title: 'Pesca en Río Sarapiquí',
    short_description: 'Pesca en medio de la selva tropical',
    description: 'Pesca en el río Sarapiquí rodeado de selva virgen. Combina pesca deportiva con observación de fauna. Ideal para amantes de la naturaleza y la aventura.',
    fishing_type: 'rio',
    provincia_code: 'heredia',
    provincia_name: 'Heredia',
    location_name: 'La Virgen de Sarapiquí',
    duration_hours: 6,
    duration_display: '6 Horas',
    capacity: 4,
    price: 420.00,
    original_price: null,
    main_image_url: '/tour-detail-03.webp',
    image_gallery: ['/tour-detail-03.webp', '/tour-detail-10.webp', '/tour-detail-05.webp'],
    is_featured: false,
    difficulty_level: 3,
    average_rating: 4.6,
    total_reviews: 18,
    status: 'active'
  },

  // Tours de Lago
  {
    id: '11',
    slug: 'pesca-guapote-arenal',
    title: 'Pesca de Guapote - Lago Arenal',
    short_description: 'El famoso guapote del Lago Arenal',
    description: 'El guapote es una de las especies más buscadas de Costa Rica. Pesca en el hermoso Lago Arenal con vistas al volcán. Equipo especializado y guía experto incluidos.',
    fishing_type: 'lago',
    provincia_code: 'alajuela',
    provincia_name: 'Alajuela',
    location_name: 'Nuevo Arenal',
    duration_hours: 7,
    duration_display: '7 Horas',
    capacity: 4,
    price: 520.00,
    original_price: null,
    main_image_url: '/tour-detail-10.webp',
    image_gallery: ['/tour-detail-10.webp', '/tour-detail-02.webp', '/tour-detail-05.webp'],
    is_featured: true,
    difficulty_level: 3,
    average_rating: 4.8,
    total_reviews: 33,
    status: 'active'
  },
  {
    id: '12',
    slug: 'pesca-embalse-cachi',
    title: 'Pesca en Embalse Cachí',
    short_description: 'Pesca tranquila cerca de San José',
    description: 'Escapa de la ciudad y disfruta de un día de pesca en el embalse Cachí. Perfecto para principiantes y familias. Paisajes hermosos del Valle de Orosi.',
    fishing_type: 'lago',
    provincia_code: 'cartago',
    provincia_name: 'Cartago',
    location_name: 'Cachí',
    duration_hours: 5,
    duration_display: '5 Horas',
    capacity: 4,
    price: 320.00,
    original_price: null,
    main_image_url: '/tour-detail-05.webp',
    image_gallery: ['/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-02.webp'],
    is_featured: false,
    difficulty_level: 1,
    average_rating: 4.4,
    total_reviews: 24,
    status: 'active'
  },
  {
    id: '13',
    slug: 'pesca-lago-cote',
    title: 'Tour de Pesca - Lago Cote',
    short_description: 'Día completo en el Lago de Cote',
    description: 'Pesca de tilapia y guapote en el Lago de Cote. Incluye almuerzo típico, equipo completo y transporte desde San José. Ideal para grupos corporativos.',
    fishing_type: 'lago',
    provincia_code: 'alajuela',
    provincia_name: 'Alajuela',
    location_name: 'Cote',
    duration_hours: 8,
    duration_display: '1 Día',
    capacity: 6,
    price: 450.00,
    original_price: null,
    main_image_url: '/tour-detail-02.webp',
    image_gallery: ['/tour-detail-02.webp', '/tour-detail-05.webp', '/tour-detail-03.webp'],
    is_featured: false,
    difficulty_level: 2,
    average_rating: 4.5,
    total_reviews: 29,
    status: 'active'
  },

  // Tours Económicos
  {
    id: '14',
    slug: 'pesca-medio-dia-jaco',
    title: 'Medio Día de Pesca - Jacó',
    short_description: 'Pesca económica en Jacó',
    description: 'Tour económico de medio día perfecto para probar la pesca deportiva. Incluye equipo básico y capitán experimentado. Salidas por la mañana y tarde.',
    fishing_type: 'costera',
    provincia_code: 'puntarenas',
    provincia_name: 'Puntarenas',
    location_name: 'Jacó',
    duration_hours: 4,
    duration_display: '4 Horas',
    capacity: 4,
    price: 280.00,
    original_price: null,
    main_image_url: '/tour-detail-05.webp',
    image_gallery: ['/tour-detail-05.webp', '/tour-detail-03.webp'],
    is_featured: false,
    difficulty_level: 1,
    average_rating: 4.3,
    total_reviews: 52,
    status: 'active'
  },
  {
    id: '15',
    slug: 'pesca-trucha-rio-virilla',
    title: 'Pesca de Trucha - Río Virilla',
    short_description: 'Pesca de trucha cerca de San José',
    description: 'Pesca de trucha arcoíris en el río Virilla. Perfecto para una escapada rápida desde San José. Tour de 3 horas ideal para principiantes.',
    fishing_type: 'rio',
    provincia_code: 'sanJose',
    provincia_name: 'San José',
    location_name: 'San Isidro de Heredia',
    duration_hours: 3,
    duration_display: '3 Horas',
    capacity: 3,
    price: 250.00,
    original_price: null,
    main_image_url: '/tour-detail-03.webp',
    image_gallery: ['/tour-detail-03.webp', '/tour-detail-05.webp'],
    is_featured: false,
    difficulty_level: 1,
    average_rating: 4.2,
    total_reviews: 41,
    status: 'active'
  },
  {
    id: '16',
    slug: 'pesca-basica-playas-del-coco',
    title: 'Tour Básico de Pesca - Coco',
    short_description: 'Introducción a la pesca deportiva',
    description: 'Tour introductorio perfecto para quienes nunca han pescado. Capitán paciente y experimentado. Todo el equipo incluido.',
    fishing_type: 'costera',
    provincia_code: 'guanacaste',
    provincia_name: 'Guanacaste',
    location_name: 'Playas del Coco',
    duration_hours: 3,
    duration_display: '3 Horas',
    capacity: 4,
    price: 240.00,
    original_price: null,
    main_image_url: '/tour-detail-05.webp',
    image_gallery: ['/tour-detail-05.webp', '/tour-detail-03.webp'],
    is_featured: false,
    difficulty_level: 1,
    average_rating: 4.4,
    total_reviews: 67,
    status: 'active'
  },

  // Tours de Lujo
  {
    id: '17',
    slug: 'pesca-lujo-2-dias-flamingo',
    title: 'Expedición de Lujo 2 Días - Flamingo',
    short_description: 'Paquete premium de 2 días con alojamiento',
    description: 'Experiencia de pesca de lujo de 2 días. Incluye alojamiento en hotel 4 estrellas, todas las comidas, equipo premium, bote privado y capitán dedicado. Pesca de alta mar y costera.',
    fishing_type: 'altaMar',
    provincia_code: 'guanacaste',
    provincia_name: 'Guanacaste',
    location_name: 'Flamingo',
    duration_hours: 16,
    duration_display: '2 Días',
    capacity: 4,
    price: 2400.00,
    original_price: null,
    main_image_url: '/tour-detail-10.webp',
    image_gallery: ['/tour-detail-10.webp', '/tour-detail-02.webp', '/tour-detail-05.webp', '/tour-detail-03.webp'],
    is_featured: true,
    difficulty_level: 4,
    average_rating: 5.0,
    total_reviews: 12,
    status: 'active'
  },
  {
    id: '18',
    slug: 'pesca-vip-marlim-papagayo',
    title: 'VIP Marlín Experience - Papagayo',
    short_description: 'Experiencia VIP en Península Papagayo',
    description: 'Lo mejor de lo mejor. Bote de lujo, equipo premium, chef a bordo, bebidas ilimitadas y servicio 5 estrellas. Pesca de marlín en las mejores aguas de Guanacaste.',
    fishing_type: 'altaMar',
    provincia_code: 'guanacaste',
    provincia_name: 'Guanacaste',
    location_name: 'Península Papagayo',
    duration_hours: 8,
    duration_display: '8 Horas',
    capacity: 6,
    price: 1800.00,
    original_price: 2000.00,
    main_image_url: '/tour-detail-02.webp',
    image_gallery: ['/tour-detail-02.webp', '/tour-detail-10.webp', '/tour-detail-05.webp', '/tour-detail-03.webp'],
    is_featured: true,
    difficulty_level: 5,
    average_rating: 5.0,
    total_reviews: 8,
    status: 'active'
  },

  // Tours Especializados
  {
    id: '19',
    slug: 'pesca-nocturna-quepos',
    title: 'Pesca Nocturna - Quepos',
    short_description: 'Aventura de pesca bajo las estrellas',
    description: 'Experiencia única de pesca nocturna. Pesca de pargo, cubera y otras especies que se alimentan de noche. Equipo con luces especiales incluido.',
    fishing_type: 'costera',
    provincia_code: 'puntarenas',
    provincia_name: 'Puntarenas',
    location_name: 'Quepos',
    duration_hours: 6,
    duration_display: '6 Horas',
    capacity: 4,
    price: 620.00,
    original_price: null,
    main_image_url: '/tour-detail-03.webp',
    image_gallery: ['/tour-detail-03.webp', '/tour-detail-02.webp', '/tour-detail-05.webp'],
    is_featured: false,
    difficulty_level: 3,
    average_rating: 4.7,
    total_reviews: 15,
    status: 'active'
  },
  {
    id: '20',
    slug: 'pesca-fly-fishing-montaña',
    title: 'Fly Fishing de Montaña',
    short_description: 'Pesca con mosca en ríos de montaña',
    description: 'Pesca con mosca en ríos cristalinos de montaña. Para puristas de la pesca. Guía experto en fly fishing incluido. Paisajes espectaculares de la zona norte.',
    fishing_type: 'rio',
    provincia_code: 'alajuela',
    provincia_name: 'Alajuela',
    location_name: 'San Carlos',
    duration_hours: 6,
    duration_display: '6 Horas',
    capacity: 3,
    price: 580.00,
    original_price: null,
    main_image_url: '/tour-detail-03.webp',
    image_gallery: ['/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-02.webp'],
    is_featured: false,
    difficulty_level: 4,
    average_rating: 4.9,
    total_reviews: 11,
    status: 'active'
  },
  {
    id: '21',
    slug: 'pesca-kayak-golfo-nicoya',
    title: 'Pesca en Kayak - Golfo de Nicoya',
    short_description: 'Pesca eco-friendly en kayak',
    description: 'Experiencia única de pesca en kayak. Perfecta para eco-turistas y amantes del deporte. Incluye kayak, equipo de pesca y guía certificado.',
    fishing_type: 'costera',
    provincia_code: 'puntarenas',
    provincia_name: 'Puntarenas',
    location_name: 'Puntarenas Centro',
    duration_hours: 4,
    duration_display: '4 Horas',
    capacity: 2,
    price: 340.00,
    original_price: null,
    main_image_url: '/tour-detail-05.webp',
    image_gallery: ['/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-10.webp'],
    is_featured: false,
    difficulty_level: 3,
    average_rating: 4.6,
    total_reviews: 22,
    status: 'active'
  },
  {
    id: '22',
    slug: 'pesca-snorkeling-combo-carrillo',
    title: 'Pesca + Snorkeling - Playa Carrillo',
    short_description: 'Combo de pesca y snorkeling',
    description: 'Combina pesca deportiva con snorkeling en arrecifes. Perfecto para grupos mixtos donde no todos pescan. Incluye equipo de snorkeling y almuerzo.',
    fishing_type: 'costera',
    provincia_code: 'guanacaste',
    provincia_name: 'Guanacaste',
    location_name: 'Playa Carrillo',
    duration_hours: 6,
    duration_display: '6 Horas',
    capacity: 6,
    price: 480.00,
    original_price: 550.00,
    main_image_url: '/tour-detail-05.webp',
    image_gallery: ['/tour-detail-05.webp', '/tour-detail-10.webp', '/tour-detail-03.webp', '/tour-detail-02.webp'],
    is_featured: false,
    difficulty_level: 2,
    average_rating: 4.7,
    total_reviews: 36,
    status: 'active'
  }
];

// Función helper para obtener tours con filtros
export const getMockTours = (filters = {}) => {
  let filteredTours = [...mockTours];

  // Filtrar por provincia
  if (filters.provincia && filters.provincia !== 'all') {
    filteredTours = filteredTours.filter(tour => tour.provincia_code === filters.provincia);
  }

  // Filtrar por tipo de pesca
  if (filters.fishing_type) {
    filteredTours = filteredTours.filter(tour => tour.fishing_type === filters.fishing_type);
  }

  // Filtrar por rango de precio
  if (filters.min_price) {
    filteredTours = filteredTours.filter(tour => tour.price >= filters.min_price);
  }
  if (filters.max_price) {
    filteredTours = filteredTours.filter(tour => tour.price <= filters.max_price);
  }

  // Filtrar por featured
  if (filters.featured === 'true' || filters.featured === true) {
    filteredTours = filteredTours.filter(tour => tour.is_featured);
  }

  // Ordenar
  const sortField = filters.sort || 'created_at';
  const sortOrder = filters.order || 'DESC';

  if (sortField === 'price') {
    filteredTours.sort((a, b) => sortOrder === 'ASC' ? a.price - b.price : b.price - a.price);
  } else if (sortField === 'average_rating') {
    filteredTours.sort((a, b) => sortOrder === 'ASC' ? a.average_rating - b.average_rating : b.average_rating - a.average_rating);
  }

  // Paginación
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedTours = filteredTours.slice(startIndex, endIndex);

  return {
    success: true,
    data: paginatedTours,
    pagination: {
      page,
      limit,
      total: filteredTours.length,
      totalPages: Math.ceil(filteredTours.length / limit),
      hasMore: endIndex < filteredTours.length
    }
  };
};

// Función para obtener un tour por slug
export const getMockTourBySlug = (slug) => {
  const tour = mockTours.find(t => t.slug === slug);

  if (!tour) {
    return {
      success: false,
      message: 'Tour not found'
    };
  }

  return {
    success: true,
    data: {
      ...tour,
      boats: [],
      target_species: [],
      inclusions: [],
      requirements: [],
      services: []
    }
  };
};
