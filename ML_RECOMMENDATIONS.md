# AI/ML Recommendation System

## Overview

LiveZen now includes a sophisticated AI/ML-powered recommendation system that supplements the existing rule-based recommendations. The system uses **TF-IDF (Term Frequency-Inverse Document Frequency)** vectorization combined with **Cosine Similarity** to provide intelligent product recommendations.

## Architecture

### Hybrid Approach

- **70% Rule-based**: Traditional recommendations based on categories, tags, and user behavior
- **30% ML-based**: AI-powered recommendations using product similarity analysis

### Core Components

1. **ProductEmbeddingService** (`app/Services/ProductEmbeddingService.php`)
    - Generates TF-IDF vectors for all products
    - Calculates cosine similarity between products
    - Manages vocabulary and feature extraction

2. **Enhanced RecommendationService** (`app/Services/RecommendationService.php`)
    - Combines rule-based and ML approaches
    - Implements fallback mechanisms
    - Includes performance monitoring

3. **Admin Interface** (`resources/js/pages/admin/ml-recommendations.tsx`)
    - Real-time system statistics
    - Cache management
    - ML system monitoring

4. **CLI Management** (`app/Console/Commands/GenerateEmbeddings.php`)
    - Generate embeddings for all products
    - View system statistics
    - Test similarity calculations

## How It Works

### Feature Extraction

Products are converted into feature vectors using:

- **Product name** (tokenized and weighted)
- **Description** (processed for key terms)
- **Category** (categorical encoding)
- **Tags** (multi-hot encoding)
- **Price range** (normalized buckets)

### TF-IDF Vectorization

1. **Term Frequency (TF)**: How often a term appears in a product's features
2. **Inverse Document Frequency (IDF)**: How rare a term is across all products
3. **TF-IDF Score**: TF × IDF gives importance to unique, relevant terms

### Similarity Calculation

Products are compared using **Cosine Similarity**:

```
similarity = (A · B) / (||A|| × ||B||)
```

Where A and B are TF-IDF vectors of two products.

## Usage

### Artisan Commands

```bash
# Generate embeddings for all products
php artisan generate:embeddings

# View system statistics
php artisan generate:embeddings --stats

# Test similarity between products
php artisan generate:embeddings --test
```

### Admin Interface

Visit `/admin/ml-recommendations` to:

- View real-time statistics
- Clear caches
- Monitor system performance
- Understand ML logic

### API Integration

The system automatically integrates with existing recommendation endpoints:

- `/api/products/{id}/related` - Enhanced with ML recommendations
- Transparent to frontend - no changes needed

## Performance & Caching

### Multi-layer Caching

- **Embeddings**: Cached for 24 hours
- **Recommendations**: Cached for 30 minutes
- **Similarity matrices**: In-memory during calculation

### Fallback Strategy

1. Try ML-based recommendations
2. Fall back to rule-based if ML fails
3. Ensure always returning results

## Monitoring

### Key Metrics

- Total products with embeddings
- Cache hit rates
- Similarity calculation performance
- Recommendation accuracy

### Logs

All ML operations are logged with context for debugging and optimization.

## Technical Details

### Libraries Used

- Pure PHP implementation (no external ML libraries)
- Laravel's caching system
- Mathematical operations for vector calculations

### Scalability

- Optimized for datasets up to 10,000 products
- Batch processing for large catalogs
- Incremental updates supported

## Development Notes

### File Locations

```
app/Services/ProductEmbeddingService.php - Core ML engine
app/Services/RecommendationService.php - Hybrid recommendation system
app/Console/Commands/GenerateEmbeddings.php - CLI management
resources/js/pages/admin/ml-recommendations.tsx - Admin interface
```

### Database Impact

- No additional tables required
- Uses existing product data
- Embeddings stored in cache

## Future Enhancements

Potential improvements:

- User behavior tracking for personalization
- A/B testing framework
- Advanced NLP preprocessing
- Real-time embedding updates
- Machine learning model evaluation metrics

---

_This AI/ML system provides intelligent, supplementary recommendations while maintaining the reliability of rule-based approaches._
