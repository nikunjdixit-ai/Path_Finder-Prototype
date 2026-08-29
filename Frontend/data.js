/**
 * data.js
 * ----------------------------------------------------------------------------
 * Static catalog data, embedded directly so the site runs with no backend.
 * This is a verbatim JS copy of careers.json, skills.json, courses.json,
 * projects.json and assessments.json (the same data the Python reference
 * implementation in profile_analyzer.py / skill_gap_analyzer.py /
 * recommender.py / path_generator.py reads from disk).
 * ---------------------------------------------------------------------------- */

window.PathlineData = {
  careers: {
    "careers": {
      "ai_engineer": {
        "name": "AI Engineer",
        "category": "Artificial Intelligence",
        "description": "Designs and develops AI-powered applications and intelligent systems.",
        "required_skills": [
          "python",
          "numpy",
          "pandas",
          "statistics",
          "machine_learning",
          "deep_learning",
          "natural_language_processing",
          "generative_ai",
          "llm",
          "prompt_engineering"
        ]
      },
      "machine_learning_engineer": {
        "name": "Machine Learning Engineer",
        "category": "Artificial Intelligence",
        "description": "Builds, trains, evaluates and deploys machine learning models.",
        "required_skills": [
          "python",
          "numpy",
          "pandas",
          "statistics",
          "linear_algebra",
          "machine_learning",
          "supervised_learning",
          "unsupervised_learning",
          "feature_engineering",
          "model_evaluation",
          "deep_learning",
          "docker"
        ]
      },
      "data_scientist": {
        "name": "Data Scientist",
        "category": "Data Science",
        "description": "Uses statistics, programming and machine learning to extract insights and build predictive models from data.",
        "required_skills": [
          "python",
          "numpy",
          "pandas",
          "statistics",
          "probability",
          "linear_algebra",
          "data_visualization",
          "machine_learning",
          "supervised_learning",
          "unsupervised_learning",
          "feature_engineering",
          "model_evaluation"
        ]
      },
      "data_analyst": {
        "name": "Data Analyst",
        "category": "Data Science",
        "description": "Analyzes data and communicates insights to support business and technical decision-making.",
        "required_skills": [
          "python",
          "sql",
          "pandas",
          "statistics",
          "data_visualization"
        ]
      },
      "full_stack_developer": {
        "name": "Full Stack Developer",
        "category": "Software Development",
        "description": "Develops both frontend and backend components of web applications.",
        "required_skills": [
          "html",
          "css",
          "javascript",
          "react",
          "nodejs",
          "rest_api",
          "sql",
          "database_design",
          "git",
          "github"
        ]
      },
      "frontend_developer": {
        "name": "Frontend Developer",
        "category": "Software Development",
        "description": "Builds user interfaces and interactive web applications.",
        "required_skills": [
          "html",
          "css",
          "javascript",
          "react",
          "git",
          "github"
        ]
      },
      "backend_developer": {
        "name": "Backend Developer",
        "category": "Software Development",
        "description": "Develops server-side applications, APIs and database-driven systems.",
        "required_skills": [
          "python",
          "object_oriented_programming",
          "rest_api",
          "sql",
          "database_design",
          "git",
          "github",
          "linux"
        ]
      },
      "cybersecurity_analyst": {
        "name": "Cybersecurity Analyst",
        "category": "Cybersecurity",
        "description": "Monitors systems, identifies security threats and helps protect applications and networks.",
        "required_skills": [
          "linux",
          "cybersecurity_fundamentals",
          "network_security",
          "ethical_hacking",
          "python",
          "git"
        ]
      },
      "cloud_engineer": {
        "name": "Cloud Engineer",
        "category": "Cloud Computing",
        "description": "Designs, deploys and manages scalable cloud infrastructure and services.",
        "required_skills": [
          "linux",
          "cloud_computing",
          "docker",
          "kubernetes",
          "git",
          "python"
        ]
      },
      "devops_engineer": {
        "name": "DevOps Engineer",
        "category": "DevOps",
        "description": "Automates software development, testing, deployment and infrastructure management.",
        "required_skills": [
          "linux",
          "git",
          "cloud_computing",
          "docker",
          "kubernetes",
          "ci_cd",
          "python"
        ]
      }
    }
  },
  skills: {
    "skills": {
      "python": {
        "name": "Python",
        "category": "Programming",
        "description": "General-purpose programming language widely used in software development, data science, AI and automation.",
        "difficulty": "beginner",
        "prerequisites": []
      },
      "javascript": {
        "name": "JavaScript",
        "category": "Programming",
        "description": "Programming language used to build interactive web applications and modern frontend and backend systems.",
        "difficulty": "beginner",
        "prerequisites": []
      },
      "java": {
        "name": "Java",
        "category": "Programming",
        "description": "Object-oriented programming language commonly used for enterprise applications and backend development.",
        "difficulty": "beginner",
        "prerequisites": []
      },
      "cpp": {
        "name": "C++",
        "category": "Programming",
        "description": "High-performance programming language used in systems programming, competitive programming and performance-intensive applications.",
        "difficulty": "intermediate",
        "prerequisites": []
      },
      "data_structures": {
        "name": "Data Structures",
        "category": "Computer Science",
        "description": "Knowledge of arrays, linked lists, stacks, queues, trees, graphs and other structures used to organize data.",
        "difficulty": "intermediate",
        "prerequisites": [
          "python"
        ]
      },
      "algorithms": {
        "name": "Algorithms",
        "category": "Computer Science",
        "description": "Ability to design and analyze algorithms for solving computational problems efficiently.",
        "difficulty": "intermediate",
        "prerequisites": [
          "data_structures"
        ]
      },
      "object_oriented_programming": {
        "name": "Object-Oriented Programming",
        "category": "Programming",
        "description": "Programming paradigm based on classes, objects, inheritance, encapsulation and polymorphism.",
        "difficulty": "intermediate",
        "prerequisites": [
          "python"
        ]
      },
      "html": {
        "name": "HTML",
        "category": "Web Development",
        "description": "Markup language used to structure content on web pages.",
        "difficulty": "beginner",
        "prerequisites": []
      },
      "css": {
        "name": "CSS",
        "category": "Web Development",
        "description": "Styling language used to design and format web pages.",
        "difficulty": "beginner",
        "prerequisites": [
          "html"
        ]
      },
      "react": {
        "name": "React",
        "category": "Frontend Development",
        "description": "JavaScript library used to build component-based user interfaces.",
        "difficulty": "intermediate",
        "prerequisites": [
          "javascript",
          "html",
          "css"
        ]
      },
      "nodejs": {
        "name": "Node.js",
        "category": "Backend Development",
        "description": "JavaScript runtime used to build scalable server-side applications.",
        "difficulty": "intermediate",
        "prerequisites": [
          "javascript"
        ]
      },
      "rest_api": {
        "name": "REST APIs",
        "category": "Backend Development",
        "description": "Understanding of RESTful services used for communication between frontend and backend systems.",
        "difficulty": "intermediate",
        "prerequisites": [
          "javascript"
        ]
      },
      "sql": {
        "name": "SQL",
        "category": "Database",
        "description": "Language used to query, manipulate and manage relational databases.",
        "difficulty": "beginner",
        "prerequisites": []
      },
      "database_design": {
        "name": "Database Design",
        "category": "Database",
        "description": "Ability to design normalized and efficient database schemas and relationships.",
        "difficulty": "intermediate",
        "prerequisites": [
          "sql"
        ]
      },
      "numpy": {
        "name": "NumPy",
        "category": "Data Science",
        "description": "Python library for numerical computing and multidimensional array operations.",
        "difficulty": "beginner",
        "prerequisites": [
          "python"
        ]
      },
      "pandas": {
        "name": "Pandas",
        "category": "Data Science",
        "description": "Python library used for data manipulation, cleaning and analysis.",
        "difficulty": "beginner",
        "prerequisites": [
          "python",
          "numpy"
        ]
      },
      "data_visualization": {
        "name": "Data Visualization",
        "category": "Data Science",
        "description": "Ability to communicate data insights using charts, graphs and visual analytics.",
        "difficulty": "beginner",
        "prerequisites": [
          "pandas"
        ]
      },
      "statistics": {
        "name": "Statistics",
        "category": "Mathematics",
        "description": "Understanding of probability, distributions, hypothesis testing, correlation and statistical inference.",
        "difficulty": "intermediate",
        "prerequisites": []
      },
      "probability": {
        "name": "Probability",
        "category": "Mathematics",
        "description": "Understanding of probability concepts used in statistics and machine learning.",
        "difficulty": "intermediate",
        "prerequisites": []
      },
      "linear_algebra": {
        "name": "Linear Algebra",
        "category": "Mathematics",
        "description": "Understanding of vectors, matrices and mathematical operations used in machine learning.",
        "difficulty": "intermediate",
        "prerequisites": []
      },
      "machine_learning": {
        "name": "Machine Learning",
        "category": "Artificial Intelligence",
        "description": "Ability to develop models that learn patterns from data for prediction and decision-making.",
        "difficulty": "intermediate",
        "prerequisites": [
          "python",
          "numpy",
          "pandas",
          "statistics",
          "linear_algebra"
        ]
      },
      "supervised_learning": {
        "name": "Supervised Learning",
        "category": "Machine Learning",
        "description": "Machine learning approach using labeled data for tasks such as classification and regression.",
        "difficulty": "intermediate",
        "prerequisites": [
          "machine_learning"
        ]
      },
      "unsupervised_learning": {
        "name": "Unsupervised Learning",
        "category": "Machine Learning",
        "description": "Machine learning approach that discovers patterns and structures in unlabeled data.",
        "difficulty": "intermediate",
        "prerequisites": [
          "machine_learning"
        ]
      },
      "feature_engineering": {
        "name": "Feature Engineering",
        "category": "Machine Learning",
        "description": "Process of creating, transforming and selecting useful features for machine learning models.",
        "difficulty": "intermediate",
        "prerequisites": [
          "pandas",
          "machine_learning"
        ]
      },
      "model_evaluation": {
        "name": "Model Evaluation",
        "category": "Machine Learning",
        "description": "Ability to evaluate machine learning models using appropriate metrics and validation techniques.",
        "difficulty": "intermediate",
        "prerequisites": [
          "machine_learning"
        ]
      },
      "deep_learning": {
        "name": "Deep Learning",
        "category": "Artificial Intelligence",
        "description": "Machine learning approach based on neural networks with multiple layers.",
        "difficulty": "advanced",
        "prerequisites": [
          "machine_learning",
          "linear_algebra"
        ]
      },
      "neural_networks": {
        "name": "Neural Networks",
        "category": "Deep Learning",
        "description": "Understanding and implementation of artificial neural networks.",
        "difficulty": "advanced",
        "prerequisites": [
          "machine_learning",
          "linear_algebra"
        ]
      },
      "computer_vision": {
        "name": "Computer Vision",
        "category": "Artificial Intelligence",
        "description": "Techniques for enabling computers to understand and analyze images and visual data.",
        "difficulty": "advanced",
        "prerequisites": [
          "deep_learning"
        ]
      },
      "natural_language_processing": {
        "name": "Natural Language Processing",
        "category": "Artificial Intelligence",
        "description": "Techniques for processing, understanding and generating human language using computational methods.",
        "difficulty": "advanced",
        "prerequisites": [
          "deep_learning"
        ]
      },
      "generative_ai": {
        "name": "Generative AI",
        "category": "Artificial Intelligence",
        "description": "AI techniques used to generate text, images, code and other forms of content.",
        "difficulty": "advanced",
        "prerequisites": [
          "machine_learning",
          "deep_learning"
        ]
      },
      "llm": {
        "name": "Large Language Models",
        "category": "Generative AI",
        "description": "Understanding and application of large language models for natural language tasks and AI applications.",
        "difficulty": "advanced",
        "prerequisites": [
          "natural_language_processing",
          "generative_ai"
        ]
      },
      "prompt_engineering": {
        "name": "Prompt Engineering",
        "category": "Generative AI",
        "description": "Designing effective prompts to guide large language models toward useful and reliable outputs.",
        "difficulty": "intermediate",
        "prerequisites": [
          "llm"
        ]
      },
      "git": {
        "name": "Git",
        "category": "Developer Tools",
        "description": "Distributed version control system used to track code changes and collaborate on software projects.",
        "difficulty": "beginner",
        "prerequisites": []
      },
      "github": {
        "name": "GitHub",
        "category": "Developer Tools",
        "description": "Platform for hosting Git repositories and collaborating on software development projects.",
        "difficulty": "beginner",
        "prerequisites": [
          "git"
        ]
      },
      "linux": {
        "name": "Linux",
        "category": "Systems",
        "description": "Operating system environment commonly used for servers, cloud computing and development.",
        "difficulty": "intermediate",
        "prerequisites": []
      },
      "cloud_computing": {
        "name": "Cloud Computing",
        "category": "Cloud",
        "description": "Understanding of cloud infrastructure, services, deployment and scalable computing resources.",
        "difficulty": "intermediate",
        "prerequisites": [
          "linux"
        ]
      },
      "docker": {
        "name": "Docker",
        "category": "DevOps",
        "description": "Containerization technology used to package applications and their dependencies.",
        "difficulty": "intermediate",
        "prerequisites": [
          "linux"
        ]
      },
      "kubernetes": {
        "name": "Kubernetes",
        "category": "DevOps",
        "description": "Container orchestration platform used to deploy and manage containerized applications.",
        "difficulty": "advanced",
        "prerequisites": [
          "docker",
          "cloud_computing"
        ]
      },
      "ci_cd": {
        "name": "CI/CD",
        "category": "DevOps",
        "description": "Practices for automating software integration, testing and deployment pipelines.",
        "difficulty": "intermediate",
        "prerequisites": [
          "git",
          "docker"
        ]
      },
      "cybersecurity_fundamentals": {
        "name": "Cybersecurity Fundamentals",
        "category": "Cybersecurity",
        "description": "Fundamental concepts related to security threats, vulnerabilities, authentication and protection mechanisms.",
        "difficulty": "beginner",
        "prerequisites": [
          "linux"
        ]
      },
      "network_security": {
        "name": "Network Security",
        "category": "Cybersecurity",
        "description": "Techniques for protecting networks, systems and communications from unauthorized access and attacks.",
        "difficulty": "intermediate",
        "prerequisites": [
          "cybersecurity_fundamentals",
          "linux"
        ]
      },
      "ethical_hacking": {
        "name": "Ethical Hacking",
        "category": "Cybersecurity",
        "description": "Authorized security testing techniques used to identify and assess vulnerabilities.",
        "difficulty": "advanced",
        "prerequisites": [
          "network_security",
          "cybersecurity_fundamentals"
        ]
      }
    }
  },
  courses: {
    "courses": [
      {
        "id": "course_python_basics",
        "title": "Python Programming Fundamentals",
        "skill": "python",
        "level": "beginner",
        "duration_hours": 20,
        "prerequisites": [],
        "type": "course"
      },
      {
        "id": "course_sql_basics",
        "title": "SQL and Database Fundamentals",
        "skill": "sql",
        "level": "beginner",
        "duration_hours": 15,
        "prerequisites": [],
        "type": "course"
      },
      {
        "id": "course_git",
        "title": "Git and GitHub Fundamentals",
        "skill": "git",
        "level": "beginner",
        "duration_hours": 8,
        "prerequisites": [],
        "type": "course"
      },
      {
        "id": "course_html_css",
        "title": "HTML and CSS Web Development",
        "skill": "html",
        "level": "beginner",
        "duration_hours": 15,
        "prerequisites": [],
        "type": "course"
      },
      {
        "id": "course_javascript",
        "title": "Modern JavaScript Fundamentals",
        "skill": "javascript",
        "level": "beginner",
        "duration_hours": 20,
        "prerequisites": [
          "html",
          "css"
        ],
        "type": "course"
      },
      {
        "id": "course_react",
        "title": "React Frontend Development",
        "skill": "react",
        "level": "intermediate",
        "duration_hours": 25,
        "prerequisites": [
          "javascript",
          "html",
          "css"
        ],
        "type": "course"
      },
      {
        "id": "course_nodejs",
        "title": "Node.js Backend Development",
        "skill": "nodejs",
        "level": "intermediate",
        "duration_hours": 25,
        "prerequisites": [
          "javascript"
        ],
        "type": "course"
      },
      {
        "id": "course_rest_api",
        "title": "REST API Development",
        "skill": "rest_api",
        "level": "intermediate",
        "duration_hours": 12,
        "prerequisites": [
          "javascript"
        ],
        "type": "course"
      },
      {
        "id": "course_numpy",
        "title": "NumPy for Data Science",
        "skill": "numpy",
        "level": "beginner",
        "duration_hours": 8,
        "prerequisites": [
          "python"
        ],
        "type": "course"
      },
      {
        "id": "course_pandas",
        "title": "Pandas for Data Analysis",
        "skill": "pandas",
        "level": "beginner",
        "duration_hours": 12,
        "prerequisites": [
          "python",
          "numpy"
        ],
        "type": "course"
      },
      {
        "id": "course_statistics",
        "title": "Statistics and Probability for Data Science",
        "skill": "statistics",
        "level": "intermediate",
        "duration_hours": 20,
        "prerequisites": [],
        "type": "course"
      },
      {
        "id": "course_linear_algebra",
        "title": "Linear Algebra for Machine Learning",
        "skill": "linear_algebra",
        "level": "intermediate",
        "duration_hours": 15,
        "prerequisites": [],
        "type": "course"
      },
      {
        "id": "course_data_visualization",
        "title": "Data Visualization with Python",
        "skill": "data_visualization",
        "level": "beginner",
        "duration_hours": 12,
        "prerequisites": [
          "pandas"
        ],
        "type": "course"
      },
      {
        "id": "course_machine_learning",
        "title": "Machine Learning Fundamentals",
        "skill": "machine_learning",
        "level": "intermediate",
        "duration_hours": 30,
        "prerequisites": [
          "python",
          "numpy",
          "pandas",
          "statistics",
          "linear_algebra"
        ],
        "type": "course"
      },
      {
        "id": "course_supervised_learning",
        "title": "Supervised Machine Learning",
        "skill": "supervised_learning",
        "level": "intermediate",
        "duration_hours": 20,
        "prerequisites": [
          "machine_learning"
        ],
        "type": "course"
      },
      {
        "id": "course_unsupervised_learning",
        "title": "Unsupervised Machine Learning",
        "skill": "unsupervised_learning",
        "level": "intermediate",
        "duration_hours": 18,
        "prerequisites": [
          "machine_learning"
        ],
        "type": "course"
      },
      {
        "id": "course_feature_engineering",
        "title": "Feature Engineering",
        "skill": "feature_engineering",
        "level": "intermediate",
        "duration_hours": 15,
        "prerequisites": [
          "pandas",
          "machine_learning"
        ],
        "type": "course"
      },
      {
        "id": "course_model_evaluation",
        "title": "Machine Learning Model Evaluation",
        "skill": "model_evaluation",
        "level": "intermediate",
        "duration_hours": 12,
        "prerequisites": [
          "machine_learning"
        ],
        "type": "course"
      },
      {
        "id": "course_deep_learning",
        "title": "Deep Learning Fundamentals",
        "skill": "deep_learning",
        "level": "advanced",
        "duration_hours": 35,
        "prerequisites": [
          "machine_learning",
          "linear_algebra"
        ],
        "type": "course"
      },
      {
        "id": "course_computer_vision",
        "title": "Computer Vision with Deep Learning",
        "skill": "computer_vision",
        "level": "advanced",
        "duration_hours": 30,
        "prerequisites": [
          "deep_learning"
        ],
        "type": "course"
      },
      {
        "id": "course_nlp",
        "title": "Natural Language Processing",
        "skill": "natural_language_processing",
        "level": "advanced",
        "duration_hours": 30,
        "prerequisites": [
          "deep_learning"
        ],
        "type": "course"
      },
      {
        "id": "course_generative_ai",
        "title": "Generative AI Fundamentals",
        "skill": "generative_ai",
        "level": "advanced",
        "duration_hours": 20,
        "prerequisites": [
          "machine_learning",
          "deep_learning"
        ],
        "type": "course"
      },
      {
        "id": "course_llm",
        "title": "Large Language Models",
        "skill": "llm",
        "level": "advanced",
        "duration_hours": 25,
        "prerequisites": [
          "natural_language_processing",
          "generative_ai"
        ],
        "type": "course"
      },
      {
        "id": "course_prompt_engineering",
        "title": "Prompt Engineering",
        "skill": "prompt_engineering",
        "level": "intermediate",
        "duration_hours": 10,
        "prerequisites": [
          "llm"
        ],
        "type": "course"
      },
      {
        "id": "course_linux",
        "title": "Linux Fundamentals",
        "skill": "linux",
        "level": "beginner",
        "duration_hours": 15,
        "prerequisites": [],
        "type": "course"
      },
      {
        "id": "course_cloud",
        "title": "Cloud Computing Fundamentals",
        "skill": "cloud_computing",
        "level": "intermediate",
        "duration_hours": 20,
        "prerequisites": [
          "linux"
        ],
        "type": "course"
      },
      {
        "id": "course_docker",
        "title": "Docker and Containerization",
        "skill": "docker",
        "level": "intermediate",
        "duration_hours": 15,
        "prerequisites": [
          "linux"
        ],
        "type": "course"
      },
      {
        "id": "course_kubernetes",
        "title": "Kubernetes Fundamentals",
        "skill": "kubernetes",
        "level": "advanced",
        "duration_hours": 25,
        "prerequisites": [
          "docker",
          "cloud_computing"
        ],
        "type": "course"
      },
      {
        "id": "course_cicd",
        "title": "CI/CD and DevOps Automation",
        "skill": "ci_cd",
        "level": "intermediate",
        "duration_hours": 18,
        "prerequisites": [
          "git",
          "docker"
        ],
        "type": "course"
      },
      {
        "id": "course_cybersecurity",
        "title": "Cybersecurity Fundamentals",
        "skill": "cybersecurity_fundamentals",
        "level": "beginner",
        "duration_hours": 20,
        "prerequisites": [
          "linux"
        ],
        "type": "course"
      },
      {
        "id": "course_network_security",
        "title": "Network Security",
        "skill": "network_security",
        "level": "intermediate",
        "duration_hours": 20,
        "prerequisites": [
          "cybersecurity_fundamentals",
          "linux"
        ],
        "type": "course"
      },
      {
        "id": "course_ethical_hacking",
        "title": "Ethical Hacking Fundamentals",
        "skill": "ethical_hacking",
        "level": "advanced",
        "duration_hours": 25,
        "prerequisites": [
          "network_security"
        ],
        "type": "course"
      }
    ]
  },
  projects: {
    "projects": [
      {
        "id": "project_python_automation",
        "title": "Python Automation Toolkit",
        "skill": "python",
        "level": "beginner",
        "estimated_hours": 8,
        "prerequisites": [
          "python"
        ],
        "type": "project"
      },
      {
        "id": "project_data_analysis",
        "title": "Student Performance Data Analysis",
        "skill": "pandas",
        "level": "beginner",
        "estimated_hours": 10,
        "prerequisites": [
          "python",
          "numpy",
          "pandas"
        ],
        "type": "project"
      },
      {
        "id": "project_sales_dashboard",
        "title": "Sales Analytics Dashboard",
        "skill": "data_visualization",
        "level": "beginner",
        "estimated_hours": 12,
        "prerequisites": [
          "pandas",
          "data_visualization"
        ],
        "type": "project"
      },
      {
        "id": "project_ml_prediction",
        "title": "House Price Prediction",
        "skill": "machine_learning",
        "level": "intermediate",
        "estimated_hours": 20,
        "prerequisites": [
          "python",
          "pandas",
          "statistics",
          "machine_learning"
        ],
        "type": "project"
      },
      {
        "id": "project_customer_segmentation",
        "title": "Customer Segmentation System",
        "skill": "unsupervised_learning",
        "level": "intermediate",
        "estimated_hours": 20,
        "prerequisites": [
          "pandas",
          "machine_learning",
          "unsupervised_learning"
        ],
        "type": "project"
      },
      {
        "id": "project_image_classifier",
        "title": "Image Classification System",
        "skill": "computer_vision",
        "level": "advanced",
        "estimated_hours": 30,
        "prerequisites": [
          "deep_learning",
          "computer_vision"
        ],
        "type": "project"
      },
      {
        "id": "project_sentiment_analysis",
        "title": "Sentiment Analysis Application",
        "skill": "natural_language_processing",
        "level": "advanced",
        "estimated_hours": 25,
        "prerequisites": [
          "machine_learning",
          "natural_language_processing"
        ],
        "type": "project"
      },
      {
        "id": "project_rag_assistant",
        "title": "Document Question Answering Assistant",
        "skill": "llm",
        "level": "advanced",
        "estimated_hours": 30,
        "prerequisites": [
          "natural_language_processing",
          "generative_ai",
          "llm"
        ],
        "type": "project"
      },
      {
        "id": "project_react_app",
        "title": "Interactive React Web Application",
        "skill": "react",
        "level": "intermediate",
        "estimated_hours": 20,
        "prerequisites": [
          "html",
          "css",
          "javascript",
          "react"
        ],
        "type": "project"
      },
      {
        "id": "project_rest_api",
        "title": "REST API Backend",
        "skill": "rest_api",
        "level": "intermediate",
        "estimated_hours": 18,
        "prerequisites": [
          "python",
          "rest_api",
          "sql"
        ],
        "type": "project"
      },
      {
        "id": "project_docker_deployment",
        "title": "Containerized Web Application",
        "skill": "docker",
        "level": "intermediate",
        "estimated_hours": 15,
        "prerequisites": [
          "linux",
          "docker"
        ],
        "type": "project"
      },
      {
        "id": "project_devops_pipeline",
        "title": "Automated CI/CD Pipeline",
        "skill": "ci_cd",
        "level": "advanced",
        "estimated_hours": 20,
        "prerequisites": [
          "git",
          "docker",
          "ci_cd"
        ],
        "type": "project"
      },
      {
        "id": "project_security_audit",
        "title": "Web Application Security Assessment",
        "skill": "ethical_hacking",
        "level": "advanced",
        "estimated_hours": 20,
        "prerequisites": [
          "cybersecurity_fundamentals",
          "network_security",
          "ethical_hacking"
        ],
        "type": "project"
      },
      {
        "id": "project_cloud_deployment",
        "title": "Cloud Application Deployment",
        "skill": "cloud_computing",
        "level": "intermediate",
        "estimated_hours": 20,
        "prerequisites": [
          "linux",
          "cloud_computing"
        ],
        "type": "project"
      }
    ]
  },
  assessments: {
    "assessments": [
      {
        "id": "assessment_python",
        "title": "Python Fundamentals Assessment",
        "skill": "python",
        "level": "beginner",
        "question_count": 10,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_sql",
        "title": "SQL Fundamentals Assessment",
        "skill": "sql",
        "level": "beginner",
        "question_count": 10,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_data_analysis",
        "title": "Data Analysis Assessment",
        "skill": "pandas",
        "level": "beginner",
        "question_count": 10,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_statistics",
        "title": "Statistics for Data Science Assessment",
        "skill": "statistics",
        "level": "intermediate",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_machine_learning",
        "title": "Machine Learning Fundamentals Assessment",
        "skill": "machine_learning",
        "level": "intermediate",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_deep_learning",
        "title": "Deep Learning Assessment",
        "skill": "deep_learning",
        "level": "advanced",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_nlp",
        "title": "Natural Language Processing Assessment",
        "skill": "natural_language_processing",
        "level": "advanced",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_web",
        "title": "Web Development Fundamentals Assessment",
        "skill": "javascript",
        "level": "beginner",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_backend",
        "title": "Backend Development Assessment",
        "skill": "rest_api",
        "level": "intermediate",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_cybersecurity",
        "title": "Cybersecurity Fundamentals Assessment",
        "skill": "cybersecurity_fundamentals",
        "level": "beginner",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_cloud",
        "title": "Cloud Computing Fundamentals Assessment",
        "skill": "cloud_computing",
        "level": "intermediate",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      },
      {
        "id": "assessment_devops",
        "title": "DevOps Fundamentals Assessment",
        "skill": "ci_cd",
        "level": "intermediate",
        "question_count": 15,
        "passing_score": 70,
        "type": "quiz"
      }
    ]
  }
};
