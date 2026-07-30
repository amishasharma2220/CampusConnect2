// Clubs, Departments & Faculties data for MUJ

export interface Club {
  id: string;
  name: string;
  faculty: string;
  department: string;
  category: "Technical" | "Cultural" | "Sports" | "Literary" | "Social" | "Professional" | "Media" | "Wellness";
  description: string;
  logo: string;
  members?: number;
  /** Freshers' membership fee in INR. Falls back to 250 when unset. */
  fee?: number;
}

/** Default membership fee (INR) used when a club does not set its own. */
export const DEFAULT_CLUB_FEE = 250;

export interface Department {
  name: string;
  shortName: string;
  clubs: string[]; // club ids
}

export interface Faculty {
  name: string;
  shortName: string;
  description: string;
  departments: Department[];
}

// ─── Faculties with Departments ───────────────────

export const faculties: Faculty[] = [
  {
    name: "Faculty of Science, Technology & Architecture (FoSTA)",
    shortName: "FoSTA",
    description: "Engineering, Computer Science, IT, Architecture, and Sciences",
    departments: [
      {
        name: "Computer Science & Engineering",
        shortName: "CSE",
        clubs: ["acm", "acm-sigai", "aiml-community", "gdsc", "hash-define", "enigma", "microsoft-learn", "linux-community", "owasp", "cyber-space", "cypher-club", "blockchain-manipal", "web3-club", "the-product-space"],
      },
      {
        name: "Information Technology",
        shortName: "IT",
        clubs: ["ieee-cs", "wolframalpha", "vector-shield", "mujcet"],
      },
      {
        name: "Electronics & Communication Engineering",
        shortName: "ECE",
        clubs: ["ieee-muj", "ieee-wie", "electronics-society", "iste"],
      },
      {
        name: "Mechanical Engineering",
        shortName: "ME",
        clubs: ["asme", "ashrae", "sae", "cars", "robocon", "design-simulation-buro", "the-tinkering-lab"],
      },
      {
        name: "Internet of Things (IoT)",
        shortName: "IoT",
        clubs: ["iot-lab", "smart-campus-club"],
      },
      {
        name: "Computer & Communication Engineering",
        shortName: "CCE",
        clubs: ["cce-innovators", "signal-processing-club"],
      },
      {
        name: "Civil Engineering",
        shortName: "CE",
        clubs: ["nirmaan"],
      },
      {
        name: "Electrical Engineering",
        shortName: "EE",
        clubs: ["autonomous-initiative", "mist-robotics"],
      },
      {
        name: "Biotechnology",
        shortName: "BT",
        clubs: ["biotech-club", "eco-tech-empire"],
      },
      {
        name: "Architecture & Planning",
        shortName: "AP",
        clubs: ["de-artistry"],
      },
      {
        name: "Basic Sciences (Physics, Chemistry, Maths)",
        shortName: "BSc",
        clubs: ["cosmos", "abhigya"],
      },
      {
        name: "Cross-Department / General FoSTA",
        shortName: "FoSTA-General",
        clubs: ["aperture", "chess-society", "coreografia", "d-club", "foodoholics", "manipal-bikers-club", "muj-central", "prayatna", "tedx-muj", "volleyball-club-fosta"],
      },
    ],
  },
  {
    name: "Faculty of Management, Commerce & Arts (FoMCA)",
    shortName: "FoMCA",
    description: "Business Administration, Commerce, Economics, and Liberal Arts",
    departments: [
      {
        name: "Business Administration",
        shortName: "MBA",
        clubs: ["e-cell", "entrepreneurship-club-fomca", "finance-club", "marketing-club"],
      },
      {
        name: "Commerce & Economics",
        shortName: "BCom",
        clubs: ["enactus-muj", "rotaract-muj"],
      },
      {
        name: "Arts, Humanities & Social Sciences",
        shortName: "BA",
        clubs: ["mun-society", "litmus", "quizzing-club"],
      },
      {
        name: "Cross-Department / General FoMCA",
        shortName: "FoMCA-General",
        clubs: ["artistry-fomca", "media-club-fomca"],
      },
    ],
  },
  {
    name: "Faculty of Law (FoL)",
    shortName: "FoL",
    description: "Law and Legal Studies",
    departments: [
      {
        name: "Law & Legal Studies",
        shortName: "LLB",
        clubs: ["moot-court-society", "legal-aid-clinic", "parliamentary-debate-fol", "law-review"],
      },
    ],
  },
  {
    name: "Faculty of Health Sciences (FoHS)",
    shortName: "FoHS",
    description: "Pharmacy, Nursing, and Allied Health Sciences",
    departments: [
      {
        name: "Pharmacy",
        shortName: "Pharm",
        clubs: ["pharma-club"],
      },
      {
        name: "Nursing & Allied Health",
        shortName: "NAH",
        clubs: ["health-awareness-club", "yoga-wellness-club"],
      },
    ],
  },
  {
    name: "Directorate of Students' Welfare (DSW)",
    shortName: "DSW",
    description: "Central student clubs, cultural committees, and welfare bodies under Dr. Sanchit Anand",
    departments: [
      {
        name: "Cultural Activities",
        shortName: "Cultural",
        clubs: ["cultural-committee", "drama-club", "music-club", "dance-club", "fine-arts-club"],
      },
      {
        name: "Sports & Adventure",
        shortName: "Sports",
        clubs: ["sports-club", "adventure-club"],
      },
      {
        name: "Social Service & Outreach",
        shortName: "Service",
        clubs: ["nss-muj", "ncc-muj", "social-outreach", "eco-club"],
      },
      {
        name: "Media & Wellness",
        shortName: "MW",
        clubs: ["photography-club", "anti-ragging-committee"],
      },
    ],
  },
];

// ─── All Clubs ───────────────────────────────────

export const clubs: Club[] = [
  // FoSTA – CSE
  { id: "acm", name: "ACM MUJ Student Chapter", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Association for Computing Machinery — competitive programming, hackathons, and software development.", logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop", members: 320 },
  { id: "acm-sigai", name: "ACM SIGAI", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Special Interest Group on Artificial Intelligence under ACM, focusing on AI/ML research and projects.", logo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop", members: 85 },
  { id: "aiml-community", name: "AIML Community", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Community for AI and Machine Learning enthusiasts to learn, build, and collaborate on projects.", logo: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&fit=crop", members: 150 },
  { id: "gdsc", name: "Google Developer Student Club (GDSC) MUJ", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Learn Google technologies, build projects, and participate in Google Solution Challenges.", logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop", members: 400 },
  { id: "hash-define", name: "Hash Define", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Open-source contributions, coding bootcamps, and developer community events.", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop", members: 120 },
  { id: "enigma", name: "Enigma — The Coding Club", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Competitive programming contests, coding marathons, and algorithmic challenges.", logo: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=100&h=100&fit=crop", members: 200 },
  { id: "microsoft-learn", name: "Microsoft Learn Student Ambassadors", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Microsoft technologies, Azure cloud, and student developer community.", logo: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=100&h=100&fit=crop", members: 180 },
  { id: "linux-community", name: "Linux Community", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Open-source software, Linux OS, and free software advocacy.", logo: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=100&h=100&fit=crop", members: 90 },
  { id: "owasp", name: "OWASP MUJ", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Open Web Application Security Project — web security, vulnerability analysis, and CTFs.", logo: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop", members: 75 },
  { id: "cyber-space", name: "Cyber Space", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Cybersecurity awareness, CTF competitions, ethical hacking workshops.", logo: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop", members: 110 },
  { id: "cypher-club", name: "Cypher Club", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Cryptography, security research, and competitive cybersecurity events.", logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop", members: 60 },
  { id: "blockchain-manipal", name: "Blockchain@Manipal", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Blockchain technology, Web3, cryptocurrency education, and decentralized app development.", logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop", members: 95 },
  { id: "web3-club", name: "Web3 Club", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Decentralized web technologies, smart contracts, DeFi, and NFT development.", logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop", members: 70 },
  { id: "the-product-space", name: "The Product Space", faculty: "FoSTA", department: "CSE", category: "Technical", description: "Product management, UX design, and startup product strategy workshops.", logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop", members: 85 },

  // FoSTA – IT
  { id: "ieee-cs", name: "IEEE Computer Society MUJ", faculty: "FoSTA", department: "IT", category: "Professional", description: "Premier source for computer science events, coding challenges, and tech workshops.", logo: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=100&h=100&fit=crop", members: 200 },
  { id: "wolframalpha", name: "Wolfram Student Club", faculty: "FoSTA", department: "IT", category: "Technical", description: "Computational thinking, Mathematica, and Wolfram Language workshops.", logo: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=100&h=100&fit=crop", members: 40 },
  { id: "vector-shield", name: "Vector Shield", faculty: "FoSTA", department: "IT", category: "Technical", description: "Data science, analytics, and machine learning project development.", logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop", members: 65 },
  { id: "mujcet", name: "MUJCET", faculty: "FoSTA", department: "IT", category: "Technical", description: "Competitive exam preparation and mentoring community for engineering students.", logo: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop", members: 150 },

  // FoSTA – ECE
  { id: "ieee-muj", name: "IEEE MUJ Student Branch", faculty: "FoSTA", department: "ECE", category: "Professional", description: "IEEE technical paper presentations, project expos, and industry networking events.", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop", members: 250 },
  { id: "ieee-wie", name: "IEEE Women in Engineering", faculty: "FoSTA", department: "ECE", category: "Professional", description: "Empowering women in STEM through mentorship, workshops, and networking events.", logo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop", members: 120 },
  { id: "electronics-society", name: "Electronics Society", faculty: "FoSTA", department: "ECE", category: "Technical", description: "Electronics projects, IoT, embedded systems, and circuit design workshops.", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop", members: 100 },
  { id: "iste", name: "ISTE MUJ", faculty: "FoSTA", department: "ECE", category: "Professional", description: "Indian Society for Technical Education — bridging academia and industry.", logo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=100&fit=crop", members: 180 },

  // FoSTA – ME
  { id: "asme", name: "ASME MUJ", faculty: "FoSTA", department: "ME", category: "Professional", description: "American Society of Mechanical Engineers — workshops, competitions, and industry interactions.", logo: "https://images.unsplash.com/photo-1537462715-5dd35942df13?w=100&h=100&fit=crop", members: 150 },
  { id: "ashrae", name: "ASHRAE MUJ", faculty: "FoSTA", department: "ME", category: "Professional", description: "American Society of Heating, Refrigerating and Air-Conditioning Engineers student chapter.", logo: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=100&h=100&fit=crop", members: 60 },
  { id: "sae", name: "SAE MUJ (Society of Automotive Engineers)", faculty: "FoSTA", department: "ME", category: "Professional", description: "Formula-style race car building, BAJA competitions, and automotive engineering.", logo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop", members: 120 },
  { id: "cars", name: "CARS (Centre for Automotive Research)", faculty: "FoSTA", department: "ME", category: "Technical", description: "Automotive engineering — designing and building race cars for national competitions.", logo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop", members: 80 },
  { id: "robocon", name: "Robocon MUJ", faculty: "FoSTA", department: "ME", category: "Technical", description: "ABU Robocon team — building robots for the Asia-Pacific Robot Contest.", logo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop", members: 100 },
  { id: "design-simulation-buro", name: "Design & Simulation Buro", faculty: "FoSTA", department: "ME", category: "Technical", description: "CAD/CAM design, simulation software, and engineering design competitions.", logo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&h=100&fit=crop", members: 55 },
  { id: "the-tinkering-lab", name: "The Tinkering Lab", faculty: "FoSTA", department: "ME", category: "Technical", description: "Hands-on hardware projects, 3D printing, Arduino, and maker culture.", logo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&h=100&fit=crop", members: 90 },

  // FoSTA – IoT
  { id: "iot-lab", name: "IoT Innovation Lab", faculty: "FoSTA", department: "IoT", category: "Technical", description: "Internet of Things projects, smart home prototyping, sensor networks, and edge computing workshops.", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop", members: 75 },
  { id: "smart-campus-club", name: "Smart Campus Club", faculty: "FoSTA", department: "IoT", category: "Technical", description: "Building IoT solutions for campus automation — smart classrooms, energy monitoring, and connected infrastructure.", logo: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=100&h=100&fit=crop", members: 50 },

  // FoSTA – CCE
  { id: "cce-innovators", name: "CCE Innovators Club", faculty: "FoSTA", department: "CCE", category: "Technical", description: "Communication engineering projects, 5G research, signal processing, and networking competitions.", logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop", members: 65 },
  { id: "signal-processing-club", name: "Signal Processing Club", faculty: "FoSTA", department: "CCE", category: "Technical", description: "DSP algorithms, image processing, radar systems, and real-time signal analysis workshops.", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop", members: 40 },

  // FoSTA – CE
  { id: "nirmaan", name: "Nirmaan — The Civil Engineering Club", faculty: "FoSTA", department: "CE", category: "Technical", description: "Civil engineering projects, structural design competitions, and site visits.", logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop", members: 70 },

  // FoSTA – EE
  { id: "autonomous-initiative", name: "Autonomous Initiative", faculty: "FoSTA", department: "EE", category: "Technical", description: "Autonomous vehicles and self-driving technology research club.", logo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop", members: 45 },
  { id: "mist-robotics", name: "MIST Robotics", faculty: "FoSTA", department: "EE", category: "Technical", description: "Robotics research, drone building, and national robotics competitions.", logo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop", members: 80 },

  // FoSTA – BT
  { id: "biotech-club", name: "Biotech Club", faculty: "FoSTA", department: "BT", category: "Technical", description: "Biotechnology research, lab experiments, and bio-innovation projects.", logo: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=100&h=100&fit=crop", members: 55 },
  { id: "eco-tech-empire", name: "Eco-Tech Empire", faculty: "FoSTA", department: "BT", category: "Social", description: "Sustainable technology, green energy projects, and environmental awareness initiatives.", logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop", members: 65 },

  // FoSTA – AP
  { id: "de-artistry", name: "De Artistry Club", faculty: "FoSTA", department: "AP", category: "Cultural", description: "Visual arts, painting, sketching, digital art, and creative design workshops.", logo: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop", members: 75 },

  // FoSTA – BSc
  { id: "cosmos", name: "COSMOS — Astronomy Club", faculty: "FoSTA", department: "BSc", category: "Technical", description: "Stargazing events, astrophotography, telescope sessions, and astronomy lectures.", logo: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=100&h=100&fit=crop", members: 90 },
  { id: "abhigya", name: "Abhigya Club", faculty: "FoSTA", department: "BSc", category: "Technical", description: "Promotes innovation and technical knowledge among students through workshops and hackathons.", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop", members: 60 },

  // FoSTA – General
  { id: "aperture", name: "Aperture — The Photography Club", faculty: "FoSTA", department: "FoSTA-General", category: "Media", description: "Captures campus life through photo walks, exhibitions, and photography workshops.", logo: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=100&h=100&fit=crop", members: 130 },
  { id: "chess-society", name: "Chess Society", faculty: "FoSTA", department: "FoSTA-General", category: "Sports", description: "Chess tournaments, training sessions, and inter-college competitions.", logo: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=100&h=100&fit=crop", members: 80 },
  { id: "coreografia", name: "Coreografia", faculty: "FoSTA", department: "FoSTA-General", category: "Cultural", description: "The dance club of FoSTA — classical, contemporary, hip-hop, and fusion dance performances.", logo: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=100&h=100&fit=crop", members: 100 },
  { id: "d-club", name: "D-Club (Debating Club)", faculty: "FoSTA", department: "FoSTA-General", category: "Literary", description: "Parliamentary debates, extempore, JAM sessions, and public speaking workshops.", logo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=100&fit=crop", members: 75 },
  { id: "foodoholics", name: "Foodoholics", faculty: "FoSTA", department: "FoSTA-General", category: "Cultural", description: "Food reviews, cooking competitions, and campus food culture events.", logo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop", members: 120 },
  { id: "manipal-bikers-club", name: "Manipal Bikers Club", faculty: "FoSTA", department: "FoSTA-General", category: "Sports", description: "Motorcycle rides, road trips, and biking culture on campus.", logo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop", members: 50 },
  { id: "muj-central", name: "MUJ Central", faculty: "FoSTA", department: "FoSTA-General", category: "Media", description: "Campus media and content creation — news, videos, and social media coverage.", logo: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=100&h=100&fit=crop", members: 85 },
  { id: "prayatna", name: "Prayatna", faculty: "FoSTA", department: "FoSTA-General", category: "Social", description: "Social welfare initiatives, NGO collaborations, and community outreach programs.", logo: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop", members: 100 },
  { id: "tedx-muj", name: "TEDxMUJ", faculty: "FoSTA", department: "FoSTA-General", category: "Literary", description: "Independently organized TEDx events bringing inspiring speakers to campus.", logo: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop", members: 60 },
  { id: "volleyball-club-fosta", name: "Volleyball Club", faculty: "FoSTA", department: "FoSTA-General", category: "Sports", description: "Volleyball practice, tournaments, and inter-college championships.", logo: "https://images.unsplash.com/photo-1461896836934-bd45ba8c891c?w=100&h=100&fit=crop", members: 45 },

  // FoMCA – MBA
  { id: "e-cell", name: "E-Cell MUJ (Entrepreneurship Cell)", faculty: "FoMCA", department: "MBA", category: "Technical", description: "Startup culture, pitch competitions, speaker sessions, and founder meetups.", logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop", members: 250 },
  { id: "entrepreneurship-club-fomca", name: "Entrepreneurship Club", faculty: "FoMCA", department: "MBA", category: "Technical", description: "Business plan development, startup mentorship, and B-plan competitions.", logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop", members: 80 },
  { id: "finance-club", name: "Finance Club", faculty: "FoMCA", department: "MBA", category: "Professional", description: "Stock market sessions, financial literacy, investment workshops, and trading simulations.", logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop", members: 150 },
  { id: "marketing-club", name: "Marketing Club", faculty: "FoMCA", department: "MBA", category: "Professional", description: "Brand management case studies, marketing campaigns, and industry expert talks.", logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop", members: 100 },

  // FoMCA – BCom
  { id: "enactus-muj", name: "Enactus MUJ", faculty: "FoMCA", department: "BCom", category: "Social", description: "Social entrepreneurship projects creating positive impact in local communities.", logo: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop", members: 120 },
  { id: "rotaract-muj", name: "Rotaract Club MUJ", faculty: "FoMCA", department: "BCom", category: "Social", description: "Community service, leadership development, and international fellowship under Rotary.", logo: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop", members: 100 },

  // FoMCA – BA
  { id: "mun-society", name: "MUN Society", faculty: "FoMCA", department: "BA", category: "Literary", description: "Model United Nations conferences, diplomatic simulations, and policy debates.", logo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=100&fit=crop", members: 150 },
  { id: "litmus", name: "Litmus — Writing, Debating & MUN Society", faculty: "FoMCA", department: "BA", category: "Literary", description: "Debating, creative writing, MUN conferences, and literary discussions.", logo: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=100&h=100&fit=crop", members: 90 },
  { id: "quizzing-club", name: "Quizzing Club", faculty: "FoMCA", department: "BA", category: "Literary", description: "Inter-college quizzes, trivia nights, and knowledge competitions.", logo: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop", members: 70 },

  // FoMCA – General
  { id: "artistry-fomca", name: "Artistry Club (FoMCA)", faculty: "FoMCA", department: "FoMCA-General", category: "Cultural", description: "Creative arts, poster making, and cultural event decoration.", logo: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop", members: 60 },
  { id: "media-club-fomca", name: "Media Club", faculty: "FoMCA", department: "FoMCA-General", category: "Media", description: "Campus journalism, newsletters, blogs, and media production.", logo: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=100&h=100&fit=crop", members: 55 },

  // FoL
  { id: "moot-court-society", name: "Moot Court Society", faculty: "FoL", department: "LLB", category: "Professional", description: "Moot court competitions, mock trials, and legal argumentation training.", logo: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&h=100&fit=crop", members: 80 },
  { id: "legal-aid-clinic", name: "Legal Aid Clinic", faculty: "FoL", department: "LLB", category: "Social", description: "Free legal assistance to underprivileged communities and legal awareness camps.", logo: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&h=100&fit=crop", members: 40 },
  { id: "parliamentary-debate-fol", name: "Parliamentary Debate Society", faculty: "FoL", department: "LLB", category: "Literary", description: "Parliamentary-style debates, rhetoric workshops, and inter-college debate championships.", logo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=100&fit=crop", members: 55 },
  { id: "law-review", name: "MUJ Law Review", faculty: "FoL", department: "LLB", category: "Literary", description: "Student-run legal journal publishing research papers and case commentaries.", logo: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=100&h=100&fit=crop", members: 30 },

  // FoHS
  { id: "pharma-club", name: "Pharma Club", faculty: "FoHS", department: "Pharm", category: "Technical", description: "Pharmaceutical research projects, drug discovery workshops, and pharma industry visits.", logo: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=100&h=100&fit=crop", members: 60 },
  { id: "health-awareness-club", name: "Health Awareness Club", faculty: "FoHS", department: "NAH", category: "Wellness", description: "Health camps, mental wellness sessions, first-aid training, and blood donation drives.", logo: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop", members: 75 },
  { id: "yoga-wellness-club", name: "Yoga & Wellness Club", faculty: "FoHS", department: "NAH", category: "Wellness", description: "Daily yoga sessions, meditation workshops, and holistic wellness events.", logo: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=100&h=100&fit=crop", members: 90 },

  // DSW – Cultural
  { id: "cultural-committee", name: "Cultural Committee MUJ", faculty: "DSW", department: "Cultural", category: "Cultural", description: "Organizes Rang (annual cultural fest), concerts, dance competitions, and all cultural events on campus.", logo: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop", members: 200 },
  { id: "drama-club", name: "Dramatics Club — Rangmanch", faculty: "DSW", department: "Cultural", category: "Cultural", description: "Theatre, street plays (nukkad natak), mono-acts, improv comedy, and annual drama festivals.", logo: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=100&h=100&fit=crop", members: 80 },
  { id: "music-club", name: "Music Club — Sargam", faculty: "DSW", department: "Cultural", category: "Cultural", description: "Western and Indian music — band jams, open mics, classical recitals, and battle of bands.", logo: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop", members: 120 },
  { id: "dance-club", name: "Dance Club — Footloose", faculty: "DSW", department: "Cultural", category: "Cultural", description: "Classical, contemporary, Bollywood, hip-hop, and fusion dance performances and competitions.", logo: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=100&h=100&fit=crop", members: 100 },
  { id: "fine-arts-club", name: "Fine Arts Club", faculty: "DSW", department: "Cultural", category: "Cultural", description: "Painting, sculpture, pottery, rangoli, and visual arts exhibitions.", logo: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop", members: 65 },

  // DSW – Sports
  { id: "sports-club", name: "Sports Club MUJ", faculty: "DSW", department: "Sports", category: "Sports", description: "Manages all inter-department and inter-university sports tournaments.", logo: "https://images.unsplash.com/photo-1461896836934-bd45ba8c891c?w=100&h=100&fit=crop", members: 300 },
  { id: "adventure-club", name: "Adventure Club", faculty: "DSW", department: "Sports", category: "Sports", description: "Trekking, rock climbing, camping trips, and outdoor adventure expeditions.", logo: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop", members: 85 },

  // DSW – Service
  { id: "nss-muj", name: "NSS MUJ (National Service Scheme)", faculty: "DSW", department: "Service", category: "Social", description: "Community service, village adoption, blood donation drives, and social impact projects.", logo: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop", members: 250 },
  { id: "ncc-muj", name: "NCC MUJ (National Cadet Corps)", faculty: "DSW", department: "Service", category: "Social", description: "Military training, leadership camps, Republic Day parades, and adventure activities.", logo: "https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?w=100&h=100&fit=crop", members: 100 },
  { id: "social-outreach", name: "Social Outreach Cell", faculty: "DSW", department: "Service", category: "Social", description: "Campus drives for education, cleanliness, and environmental sustainability.", logo: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop", members: 80 },
  { id: "eco-club", name: "Eco Club — Green Campus", faculty: "DSW", department: "Service", category: "Social", description: "Tree plantation drives, plastic-free campaigns, sustainability workshops, and green audit.", logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop", members: 70 },

  // DSW – Media & Wellness
  { id: "photography-club", name: "Photography Club MUJ", faculty: "DSW", department: "MW", category: "Media", description: "Campus photography, photo walks through Jaipur heritage sites, exhibitions, and contests.", logo: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=100&h=100&fit=crop", members: 110 },
  { id: "anti-ragging-committee", name: "Anti-Ragging Committee", faculty: "DSW", department: "MW", category: "Wellness", description: "Student safety, anti-ragging helpline, awareness campaigns, and mentoring freshers.", logo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop", members: 40 },
];

// Helpers
export const getClubById = (id: string): Club | undefined => clubs.find((c) => c.id === id);

export const getClubsByFaculty = (shortName: string): Club[] =>
  clubs.filter((c) => c.faculty === shortName);

export const getClubsByDepartment = (deptShortName: string): Club[] =>
  clubs.filter((c) => c.department === deptShortName);

export const categoryConfig: Record<string, { color: string; label: string }> = {
  Technical: { color: "bg-primary/10 text-primary border-primary/20", label: "Technical" },
  Cultural: { color: "bg-accent/10 text-accent border-accent/20", label: "Cultural" },
  Sports: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Sports" },
  Literary: { color: "bg-violet-500/10 text-violet-600 border-violet-500/20", label: "Literary" },
  Social: { color: "bg-rose-500/10 text-rose-600 border-rose-500/20", label: "Social" },
  Professional: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Professional" },
  Media: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Media" },
  Wellness: { color: "bg-teal-500/10 text-teal-600 border-teal-500/20", label: "Wellness" },
};

// Academic Calendar
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: "academic" | "event" | "holiday" | "exam";
  club?: string;
}

export const academicCalendarEvents: CalendarEvent[] = [
  { id: "ac1", title: "Odd Semester Begins", date: "2025-07-14", type: "academic" },
  { id: "ac2", title: "Orientation Week", date: "2025-07-14", endDate: "2025-07-19", type: "academic" },
  { id: "ac3", title: "Independence Day", date: "2025-08-15", type: "holiday" },
  { id: "ac4", title: "Club Recruitment Drive", date: "2025-08-18", endDate: "2025-08-23", type: "event" },
  { id: "ac5", title: "Janmashtami", date: "2025-08-16", type: "holiday" },
  { id: "ac6", title: "Mid-Semester Exams (Odd)", date: "2025-09-15", endDate: "2025-09-25", type: "exam" },
  { id: "ac7", title: "Ganesh Chaturthi", date: "2025-09-07", type: "holiday" },
  { id: "ac8", title: "Gandhi Jayanti", date: "2025-10-02", type: "holiday" },
  { id: "ac9", title: "Dussehra Break", date: "2025-10-02", endDate: "2025-10-05", type: "holiday" },
  { id: "ac10", title: "Tech Fest — Technovation", date: "2025-10-17", endDate: "2025-10-19", type: "event", club: "ACM MUJ" },
  { id: "ac11", title: "Diwali Break", date: "2025-10-31", endDate: "2025-11-05", type: "holiday" },
  { id: "ac12", title: "Rang — Cultural Fest", date: "2025-11-14", endDate: "2025-11-16", type: "event", club: "Cultural Committee MUJ" },
  { id: "ac13", title: "End-Semester Exams (Odd)", date: "2025-12-01", endDate: "2025-12-15", type: "exam" },
  { id: "ac14", title: "Winter Break Begins", date: "2025-12-16", type: "holiday" },
  { id: "ac15", title: "Christmas", date: "2025-12-25", type: "holiday" },
  { id: "ac16", title: "Even Semester Begins", date: "2026-01-05", type: "academic" },
  { id: "ac17", title: "Republic Day", date: "2026-01-26", type: "holiday" },
  { id: "ac18", title: "National Science Symposium", date: "2026-01-15", type: "event", club: "Science Society" },
  { id: "ac19", title: "Startup Weekend MUJ", date: "2026-02-05", endDate: "2026-02-07", type: "event", club: "E-Cell MUJ" },
  { id: "ac20", title: "TEDxMUJ 2026", date: "2026-02-20", type: "event", club: "TEDxMUJ" },
  { id: "ac21", title: "Mid-Semester Exams (Even)", date: "2026-03-02", endDate: "2026-03-12", type: "exam" },
  { id: "ac22", title: "HackMUJ 3.0", date: "2026-03-15", endDate: "2026-03-16", type: "event", club: "ACM MUJ" },
  { id: "ac23", title: "Holi Break", date: "2026-03-19", endDate: "2026-03-21", type: "holiday" },
  { id: "ac24", title: "Rang — Annual Cultural Fest", date: "2026-03-22", endDate: "2026-03-24", type: "event", club: "Cultural Committee MUJ" },
  { id: "ac25", title: "Cricket Tournament", date: "2026-04-01", endDate: "2026-04-05", type: "event", club: "Sports Club MUJ" },
  { id: "ac26", title: "Photography Walk — Jaipur Heritage", date: "2026-04-10", type: "event", club: "Photography Club MUJ" },
  { id: "ac27", title: "Badminton Championship", date: "2026-04-15", endDate: "2026-04-17", type: "event", club: "Sports Club MUJ" },
  { id: "ac28", title: "End-Semester Exams (Even)", date: "2026-05-04", endDate: "2026-05-18", type: "exam" },
  { id: "ac29", title: "Summer Break Begins", date: "2026-05-19", type: "holiday" },
  { id: "ac30", title: "Convocation Ceremony", date: "2026-06-15", type: "academic" },
];
