FROM python:3.11-slim

# Security: Non-root user
RUN useradd -m -u 1000 mcpagent
WORKDIR /workspace

# Install IPython and basic dependencies
RUN pip install --no-cache-dir ipython numpy pandas

# Switch to non-root user
USER mcpagent

# Resource limits set at runtime via docker run:
# --memory=512m --cpus=1.0 --network=none
