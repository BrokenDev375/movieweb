"""
Movie Recommender System Package
=================================
Collaborative filtering (Matrix Factorization) and Hybrid Deep Learning
recommender systems on the MovieLens dataset.
"""

from .data_loader import MovieLensLoader
from .matrix_factorization import MatrixFactorization
from .evaluator import Evaluator
from .recommender import MovieRecommender
try:
    from .hybrid_model import HybridRecommender
    has_hybrid = True
except ImportError:
    has_hybrid = False
    import warnings
    warnings.warn("HybridRecommender could not be imported because 'torch' is missing. "
                  "Collaborative filtering (MatrixFactorization) will still work.")

__all__ = [
    'MovieLensLoader',
    'MatrixFactorization',
    'Evaluator',
    'MovieRecommender',
]

if has_hybrid:
    __all__.append('HybridRecommender')


__version__ = '2.0.0'