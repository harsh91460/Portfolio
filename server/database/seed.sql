USE harsh_portfolio;

INSERT INTO projects
(title, slug, short_description, description, tech_stack, github_url, is_featured, is_visible, sort_order)
VALUES

(
    'SmartScale',
    'smartscale',
    'ML-powered predictive system for resource monitoring and autoscaling.',
    'A machine learning based system that forecasts CPU and memory utilization, detects potential failures and recommends resource scaling actions.',
    JSON_ARRAY('Python', 'Machine Learning', 'FastAPI', 'Pandas', 'Scikit-learn'),
    'https://github.com/harsh91460',
    TRUE,
    TRUE,
    1
),

(
    'ArvyaX Emotion Guide',
    'arvyax-emotion-guide',
    'An offline machine learning system for emotion state prediction.',
    'Uses TF-IDF, metadata features, Random Forest and Linear Regression to predict emotional states and intensity without external LLM APIs.',
    JSON_ARRAY('Python', 'NLP', 'TF-IDF', 'Random Forest', 'Scikit-learn'),
    'https://github.com/harsh91460/arvyax-emotion-guide',
    TRUE,
    TRUE,
    2
),

(
    'Bravo',
    'bravo',
    'A real-time multiplayer competitive coding platform.',
    'A multiplayer coding platform featuring competitive coding challenges, team battles, authentication and leaderboards.',
    JSON_ARRAY('React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'MySQL'),
    'https://github.com/harsh91460',
    TRUE,
    TRUE,
    3
);