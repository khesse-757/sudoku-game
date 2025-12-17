#!/bin/bash
# bump-version.sh - Helper script to bump version numbers

set -e

CURRENT_VERSION=$(cat VERSION | tr -d '[:space:]')

echo "Current version: $CURRENT_VERSION"
echo ""
echo "What type of version bump?"
echo "  1) Patch (x.x.X) - Bug fixes"
echo "  2) Minor (x.X.0) - New features, backwards compatible"
echo "  3) Major (X.0.0) - Breaking changes"
echo "  4) Custom version"
echo ""
read -p "Enter choice (1-4): " choice

IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

case $choice in
  1)
    NEW_VERSION="$major.$minor.$((patch + 1))"
    ;;
  2)
    NEW_VERSION="$major.$((minor + 1)).0"
    ;;
  3)
    NEW_VERSION="$((major + 1)).0.0"
    ;;
  4)
    read -p "Enter new version (e.g., 1.2.3): " NEW_VERSION
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "Bumping version: $CURRENT_VERSION → $NEW_VERSION"

# Update VERSION file
echo "$NEW_VERSION" > VERSION
echo "✓ VERSION file updated"

# Update package.json
npm version "$NEW_VERSION" --no-git-tag-version --allow-same-version
echo "✓ package.json updated"

echo ""
echo "Next steps:"
echo "  1. Review your changes"
echo "  2. git add VERSION package.json package-lock.json"
echo "  3. git commit -m 'Bump version to $NEW_VERSION'"
echo "  4. git push origin main"
echo ""
echo "The GitHub Action will automatically:"
echo "  - Create tag v$NEW_VERSION"
echo "  - Generate a changelog from commits"
echo "  - Create a GitHub release"