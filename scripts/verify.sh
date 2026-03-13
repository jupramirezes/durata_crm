#!/bin/bash
echo "=== Build ==="
npm run build || exit 1
echo "=== Tests ==="
npm test || exit 1
echo "=== ✓ Todo OK — listo para merge ==="
