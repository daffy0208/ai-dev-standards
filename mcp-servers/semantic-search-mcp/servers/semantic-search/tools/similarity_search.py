"""
similarity_search Tool

Performs semantic similarity search across document vectors.
"""

import numpy as np
from typing import List, Dict, Any, Tuple


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors."""
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot_product / (norm1 * norm2)


def similarity_search(
    query_embedding: List[float],
    document_embeddings: List[List[float]],
    document_metadata: List[Dict[str, Any]] = None,
    options: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Find most similar documents using cosine similarity.

    Args:
        query_embedding: Query vector (list of floats)
        document_embeddings: List of document vectors
        document_metadata: Optional metadata for each document (IDs, content, etc.)
        options: Optional parameters:
            - top_k: Number of results to return (default: 5)
            - threshold: Minimum similarity score (default: 0.0)
            - metric: Similarity metric (cosine, euclidean, dot_product)
            - return_scores: Whether to include similarity scores (default: True)

    Returns:
        dict: {
            "success": bool,
            "results": list of results with scores,
            "count": int,
            "query_info": dict
        }
    """
    options = options or {}
    top_k = options.get("top_k", 5)
    threshold = options.get("threshold", 0.0)
    metric = options.get("metric", "cosine")
    return_scores = options.get("return_scores", True)

    if not query_embedding:
        return {
            "success": False,
            "error": "Query embedding is required",
            "results": []
        }

    if not document_embeddings:
        return {
            "success": False,
            "error": "No document embeddings provided",
            "results": []
        }

    # Convert to numpy arrays for efficient computation
    query_vec = np.array(query_embedding)
    doc_vecs = np.array(document_embeddings)

    # Validate dimensions
    if query_vec.shape[0] != doc_vecs.shape[1]:
        return {
            "success": False,
            "error": f"Dimension mismatch: query={query_vec.shape[0]}, documents={doc_vecs.shape[1]}",
            "results": []
        }

    # Calculate similarities based on metric
    similarities = []

    if metric == "cosine":
        for idx, doc_vec in enumerate(doc_vecs):
            similarity = cosine_similarity(query_vec, doc_vec)
            similarities.append((idx, similarity))

    elif metric == "dot_product":
        for idx, doc_vec in enumerate(doc_vecs):
            similarity = np.dot(query_vec, doc_vec)
            similarities.append((idx, similarity))

    elif metric == "euclidean":
        for idx, doc_vec in enumerate(doc_vecs):
            # Convert distance to similarity (inverse)
            distance = np.linalg.norm(query_vec - doc_vec)
            similarity = 1.0 / (1.0 + distance)
            similarities.append((idx, similarity))

    else:
        return {
            "success": False,
            "error": f"Unsupported metric: {metric}",
            "supported_metrics": ["cosine", "dot_product", "euclidean"]
        }

    # Filter by threshold
    similarities = [(idx, score) for idx, score in similarities if score >= threshold]

    # Sort by similarity (descending)
    similarities.sort(key=lambda x: x[1], reverse=True)

    # Take top k
    top_results = similarities[:top_k]

    # Format results
    results = []
    for idx, score in top_results:
        result = {
            "index": idx,
            "similarity": float(score)
        }

        # Add metadata if provided
        if document_metadata and idx < len(document_metadata):
            result["metadata"] = document_metadata[idx]

        if return_scores:
            result["score"] = float(score)

        results.append(result)

    return {
        "success": True,
        "results": results,
        "count": len(results),
        "query_info": {
            "dimensions": len(query_embedding),
            "metric": metric,
            "top_k": top_k,
            "threshold": threshold,
            "total_documents": len(document_embeddings)
        }
    }


# Example usage and testing
if __name__ == "__main__":
    # Create sample embeddings
    print("Test: Semantic similarity search")
    print()

    # Query embedding (simulated)
    query = np.random.randn(384)
    query = query / np.linalg.norm(query)

    # Document embeddings (5 documents, similar to query with varying degrees)
    documents = []
    metadata = []

    for i in range(5):
        # Create document vectors with varying similarity to query
        noise_level = i * 0.3  # More noise = less similar
        doc_vec = query + np.random.randn(384) * noise_level
        doc_vec = doc_vec / np.linalg.norm(doc_vec)
        documents.append(doc_vec)

        metadata.append({
            "id": f"doc_{i}",
            "title": f"Document {i}",
            "content": f"This is document number {i}"
        })

    # Perform similarity search
    result = similarity_search(
        query_embedding=query.tolist(),
        document_embeddings=[doc.tolist() for doc in documents],
        document_metadata=metadata,
        options={
            "top_k": 3,
            "threshold": 0.5,
            "metric": "cosine"
        }
    )

    print(f"Success: {result['success']}")
    print(f"Found {result['count']} results:")
    print()

    for i, res in enumerate(result['results']):
        print(f"{i + 1}. {res['metadata']['title']}")
        print(f"   Similarity: {res['similarity']:.4f}")
        print(f"   ID: {res['metadata']['id']}")
        print()
