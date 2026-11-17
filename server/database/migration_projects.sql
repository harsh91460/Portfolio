USE harsh_portfolio;

ALTER TABLE projects
ADD COLUMN category VARCHAR(100) AFTER slug,
ADD COLUMN metrics JSON AFTER tech_stack;

UPDATE projects
SET
    category = 'AI / Machine Learning',
    metrics = JSON_ARRAY(
        'CPU Forecast R²: 0.8885',
        'Memory Forecast R²: 0.8717',
        'Failure Prediction F1: 0.9908',
        'Autoscaling Accuracy: 90.49%'
    )
WHERE slug = 'smartscale';

UPDATE projects
SET
    category = 'NLP / Machine Learning',
    metrics = JSON_ARRAY(
        'State Classification Accuracy: 78.5%',
        'Intensity Prediction MSE: 0.92'
    )
WHERE slug = 'arvyax-emotion-guide';

UPDATE projects
SET
    category = 'Full-Stack Development',
    metrics = JSON_ARRAY()
WHERE slug = 'bravo';
