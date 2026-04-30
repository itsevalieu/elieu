import { Project } from "@evalieu/common";

export const projects: Project[] = [
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    date: "January 2025",
    description:
      "A full-featured e-commerce platform with product listings, shopping cart, and checkout functionality.",
    longDescription: `
          This e-commerce platform offers a complete solution for online retail businesses. It features a responsive product catalog, 
          advanced filtering and search capabilities, a user-friendly shopping cart, and secure checkout process.
          
          Users can create accounts, save favorite items, track orders, and receive personalized recommendations based on their browsing history.
          The admin panel provides comprehensive inventory management, order processing, and customer relationship tools.
          
          The platform was built with scalability in mind, utilizing MongoDB for flexible product schemas and efficient data retrieval.
          RESTful API architecture ensures clean separation between the frontend and backend services.
        `,
    challenges: [
      "Implementing a secure and user-friendly checkout process",
      "Designing a flexible product catalog that accommodates various product types",
      "Optimizing database queries for fast product browsing and search",
    ],
    solutions: [
      "Utilized Stripe API with custom validation to ensure secure transactions",
      "Designed a MongoDB schema with polymorphic product models and common interfaces",
      "Implemented caching and pagination strategies to improve performance",
    ],
    technologies: [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "Stripe API",
      "Redis",
      "AWS S3",
    ],
    githubUrl: "https://githubUrl.com/yourusername/ecommerce",
    demoUrl: "https://ecommerce-demoUrl.example.com",
    images: [
      "/images/ecommerce-1.jpg",
      "/images/ecommerce-2.jpg",
      "/images/ecommerce-3.jpg",
    ],
  },
  {
    id: "weather-application",
    title: "Weather Application",
    date: "October 2024",
    description:
      "Real-time weather application that shows current conditions and forecasts for any location.",
    longDescription: `
          This weather application provides users with accurate, real-time weather information for any location worldwide.
          It features current conditions, hourly forecasts, and extended 7-day predictions using data from multiple weather APIs
          for increased accuracy.
          
          The app includes interactive maps with radar overlays, severe weather alerts, and customizable notifications.
          Users can save favorite locations and compare weather conditions across different cities.
          
          The UI dynamically changes based on current weather conditions and time of day, creating an immersive experience
          that visually represents the forecast.
        `,
    challenges: [
      "Aggregating and normalizing data from multiple weather API sources",
      "Creating an intuitive UI that displays complex weather data clearly",
      "Optimizing for performance while handling real-time data updates",
    ],
    solutions: [
      "Built a data normalization layer that combines and validates information from multiple APIs",
      "Used data visualization libraries to create intuitive charts and graphics",
      "Implemented efficient state management with React Context and optimized render cycles",
    ],
    technologies: [
      "JavaScript",
      "React",
      "API Integration",
      "CSS",
      "D3.js",
      "Leaflet Maps",
      "IndexedDB",
    ],
    githubUrl: "https://githubUrl.com/yourusername/weather-app",
    demoUrl: "https://weather-demoUrl.example.com",
    images: [
      "/images/weather-1.jpg",
      "/images/weather-2.jpg",
      "/images/weather-3.jpg",
    ],
  },
  {
    id: "task-management-system",
    title: "Task Management System",
    date: "July 2024",
    description:
      "A Kanban-style task management system allowing users to organize their tasks in various stages.",
    longDescription: `
          This task management system helps teams and individuals organize work effectively using a Kanban methodology.
          Users can create boards for different projects, add customizable columns representing workflow stages,
          and move tasks between them with a smooth drag-and-drop interface.
          
          The system includes features like task assignments, due dates, priority levels, file attachments, and comment threads.
          Advanced filtering and search capabilities make it easy to find specific tasks across multiple boards.
          
          Real-time collaboration features keep everyone in sync, with instant updates when tasks are modified or moved.
          Automated notifications ensure team members stay informed about relevant changes.
        `,
    challenges: [
      "Creating a smooth, responsive drag-and-drop interface for task management",
      "Implementing real-time updates across multiple clients",
      "Designing a flexible task model that accommodates various workflow needs",
    ],
    solutions: [
      "Used Vue.js with custom directives for drag-and-drop functionality",
      "Integrated Firebase Realtime Database for synchronization across clients",
      "Designed a composable task schema with customizable fields and metadata",
    ],
    technologies: [
      "Vue.js",
      "Firebase",
      "Tailwind CSS",
      "Vuex",
      "Cloud Functions",
      "Firestore",
    ],
    githubUrl: "https://githubUrl.com/yourusername/task-manager",
    demoUrl: "https://task-manager-demoUrl.example.com",
    images: ["/images/task-1.jpg", "/images/task-2.jpg", "/images/task-3.jpg"],
  },
  {
    id: "personal-blog",
    title: "Personal Blog",
    date: "March 2024",
    description:
      "A blog platform with content management system, commenting, and social sharing features.",
    longDescription: `
          This modern blog platform was built using Next.js to deliver blazing-fast page loads and excellent SEO performance.
          It features a custom content management system that makes content creation and editing intuitive for writers.
          
          The platform includes advanced typography and layout options, with responsive design that looks great on any device.
          Features include categorization, tagging, related posts suggestions, and full-text search capabilities.
          
          User engagement is encouraged through a commenting system with threading and reactions, social sharing options,
          and newsletter subscriptions. The analytics dashboard provides insights into content performance.
        `,
    challenges: [
      "Balancing performance with rich content editing capabilities",
      "Creating a flexible content model that works with SSR and static generation",
      "Implementing effective SEO strategies for content discoverability",
    ],
    solutions: [
      "Used Next.js with selective hydration and lazy loading for optimal performance",
      "Designed a hybrid approach with static generation for content and client-side loading for dynamic elements",
      "Implemented structured data, automatic sitemaps, and SEO-friendly URLs",
    ],
    technologies: [
      "Next.js",
      "GraphQL",
      "PostgreSQL",
      "SASS",
      "Apollo Client",
      "Prisma ORM",
      "Vercel",
    ],
    githubUrl: "https://githubUrl.com/yourusername/blog",
    demoUrl: "https://blog-demoUrl.example.com",
    images: ["/images/blog-1.jpg", "/images/blog-2.jpg", "/images/blog-3.jpg"],
  },
  {
    id: "fitness-tracker",
    title: "Fitness Tracker",
    date: "November 2023",
    description:
      "An application to track workouts, nutrition, and fitness progress with data visualization.",
    longDescription: `
          This comprehensive fitness tracking application helps users monitor and improve their health and fitness journey.
          It allows tracking of workouts, nutrition intake, body measurements, and various health metrics in one integrated platform.
          
          The app provides detailed data visualization, showing progress over time through interactive charts and graphs.
          Users can set personal goals, receive customized workout and meal plans, and get insights into their performance.
          
          Built as a cross-platform mobile application with React Native, it features offline capability, allowing users to
          log activities without an internet connection. Data synchronizes when connectivity is restored.
        `,
    challenges: [
      "Creating intuitive interfaces for complex data entry during workouts",
      "Designing effective data visualizations that provide actionable insights",
      "Implementing reliable offline functionality with data synchronization",
    ],
    solutions: [
      "Developed streamlined input forms with smart defaults and quick-entry options",
      "Used D3.js to create custom visualizations that highlight meaningful patterns and trends",
      "Implemented a robust local storage solution with conflict resolution for data syncing",
    ],
    technologies: [
      "React Native",
      "Redux",
      "D3.js",
      "Firebase",
      "Async Storage",
      "Cloud Functions",
      "Health Kit Integration",
    ],
    githubUrl: "https://githubUrl.com/yourusername/fitness-tracker",
    demoUrl: "https://fitness-tracker-demoUrl.example.com",
    images: [
      "/images/fitness-1.jpg",
      "/images/fitness-2.jpg",
      "/images/fitness-3.jpg",
    ],
  },
];
