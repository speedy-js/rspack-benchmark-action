#!/bin/sh

export HOME=/root
set -eu # stop on error
cd /usr/src/app/

# Init Benchmark repositories
echo 'Preparing Benchmark repositories...'
rm -rf benchmarks
git clone https://${PR_STATS_COMMENT_TOKEN}@github.com/speedy-js/rspack.git benchmarks

echo 'Starting Action...'
pnpm action:start