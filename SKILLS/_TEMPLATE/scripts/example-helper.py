#!/usr/bin/env python3
"""
Example helper script for skills that need executable automation.

This template demonstrates:
- Proper script structure
- Command-line argument handling
- Error handling
- Documentation
"""

import argparse
import sys
from pathlib import Path


def main():
    """Main function demonstrating skill automation."""
    parser = argparse.ArgumentParser(
        description="Example helper script for [Skill Name]"
    )
    parser.add_argument(
        "input_file",
        type=Path,
        help="Input file to process"
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        help="Output file (default: stdout)"
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose output"
    )

    args = parser.parse_args()

    try:
        # Validate input
        if not args.input_file.exists():
            print(f"Error: Input file '{args.input_file}' not found", file=sys.stderr)
            return 1

        # Process input
        if args.verbose:
            print(f"Processing {args.input_file}...")

        # Your skill-specific logic here
        result = process_file(args.input_file)

        # Write output
        if args.output:
            args.output.write_text(result)
            if args.verbose:
                print(f"Wrote output to {args.output}")
        else:
            print(result)

        return 0

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


def process_file(file_path: Path) -> str:
    """
    Process the input file according to skill requirements.

    Args:
        file_path: Path to input file

    Returns:
        Processed result as string
    """
    # Replace with actual skill-specific processing
    content = file_path.read_text()
    return f"Processed: {content}"


if __name__ == "__main__":
    sys.exit(main())
