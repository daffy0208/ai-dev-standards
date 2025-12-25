"""
index_documents Tool

Indexes documents for semantic search by creating embeddings and metadata.
"""

import json
from typing import List, Dict, Any, Union


def index_documents(
    documents: List[Dict[str, Any]],
    options: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Index documents for semantic search.

    Creates embeddings and indexes for efficient similarity search.

    Args:
        documents: List of documents to index. Each document should have:
            - id: Unique identifier
            - content: Text content to embed
            - metadata: Optional metadata (title, tags, etc.)
        options: Optional parameters:
            - embedding_model: Model to use for embeddings (default: sentence-transformers)
            - chunk_size: Split documents into chunks (default: None)
            - batch_size: Batch size for embedding (default: 32)
            - include_metadata: Store metadata with embeddings (default: True)

    Returns:
        dict: {
            "success": bool,
            "indexed_count": int,
            "failed_count": int,
            "index_info": dict with statistics,
            "embeddings": list of embeddings,
            "metadata": list of metadata
        }
    """
    options = options or {}
    embedding_model = options.get("embedding_model", "sentence-transformers")
    chunk_size = options.get("chunk_size")
    batch_size = options.get("batch_size", 32)
    include_metadata = options.get("include_metadata", True)

    if not documents:
        return {
            "success": False,
            "error": "No documents provided for indexing",
            "indexed_count": 0
        }

    indexed = []
    failed = []
    embeddings = []
    metadata_list = []

    for doc in documents:
        try:
            # Validate document structure
            if "id" not in doc:
                failed.append({
                    "document": doc,
                    "error": "Missing 'id' field"
                })
                continue

            if "content" not in doc:
                failed.append({
                    "document": doc,
                    "error": "Missing 'content' field"
                })
                continue

            doc_id = doc["id"]
            content = doc["content"]
            doc_metadata = doc.get("metadata", {})

            # Split into chunks if specified
            if chunk_size and len(content) > chunk_size:
                chunks = [
                    content[i:i + chunk_size]
                    for i in range(0, len(content), chunk_size)
                ]
            else:
                chunks = [content]

            # Generate embeddings for each chunk
            # IMPLEMENTATION NOTE: Replace with actual embedding call
            for chunk_idx, chunk in enumerate(chunks):
                # Placeholder: Generate deterministic embedding based on content hash
                import numpy as np
                content_hash = hash(chunk) % 10000
                np.random.seed(content_hash)

                if embedding_model == "sentence-transformers":
                    dimensions = 384
                elif embedding_model == "openai":
                    dimensions = 1536
                else:
                    dimensions = 384

                embedding = np.random.randn(dimensions)
                embedding = embedding / np.linalg.norm(embedding)

                # Store embedding
                embeddings.append(embedding.tolist())

                # Store metadata
                chunk_metadata = {
                    "doc_id": doc_id,
                    "chunk_index": chunk_idx,
                    "total_chunks": len(chunks),
                    "content": chunk if len(chunk) < 200 else chunk[:200] + "...",
                    "content_length": len(chunk)
                }

                if include_metadata:
                    chunk_metadata.update(doc_metadata)

                metadata_list.append(chunk_metadata)

            indexed.append(doc_id)

        except Exception as e:
            failed.append({
                "document": doc.get("id", "unknown"),
                "error": str(e)
            })

    # Calculate statistics
    total_chunks = len(embeddings)
    avg_dimensions = len(embeddings[0]) if embeddings else 0

    result = {
        "success": len(indexed) > 0,
        "indexed_count": len(indexed),
        "failed_count": len(failed),
        "total_chunks": total_chunks,
        "index_info": {
            "embedding_model": embedding_model,
            "dimensions": avg_dimensions,
            "documents_indexed": len(indexed),
            "chunks_created": total_chunks,
            "avg_chunks_per_doc": total_chunks / len(indexed) if indexed else 0
        },
        "embeddings": embeddings,
        "metadata": metadata_list
    }

    if failed:
        result["failed"] = failed

    return result


# Example usage and testing
if __name__ == "__main__":
    print("Test: Document indexing")
    print()

    # Sample documents
    documents = [
        {
            "id": "doc_1",
            "content": "Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data.",
            "metadata": {
                "title": "Introduction to ML",
                "category": "AI",
                "author": "John Doe"
            }
        },
        {
            "id": "doc_2",
            "content": "Deep learning uses neural networks with multiple layers to progressively extract higher-level features from raw input.",
            "metadata": {
                "title": "Deep Learning Basics",
                "category": "AI",
                "author": "Jane Smith"
            }
        },
        {
            "id": "doc_3",
            "content": "Natural language processing (NLP) is a branch of AI that helps computers understand, interpret and manipulate human language.",
            "metadata": {
                "title": "NLP Overview",
                "category": "AI",
                "author": "Bob Johnson"
            }
        }
    ]

    # Index documents
    result = index_documents(
        documents=documents,
        options={
            "embedding_model": "sentence-transformers",
            "include_metadata": True
        }
    )

    print(f"Success: {result['success']}")
    print(f"Indexed: {result['indexed_count']} documents")
    print(f"Total chunks: {result['total_chunks']}")
    print(f"Dimensions: {result['index_info']['dimensions']}")
    print()

    print("Indexed documents:")
    for i, meta in enumerate(result['metadata'][:3]):  # Show first 3
        print(f"{i + 1}. {meta['doc_id']} - {meta.get('title', 'No title')}")
        print(f"   Content: {meta['content'][:80]}...")
        print()
