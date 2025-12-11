#!/bin/bash

# Vercel deployment script
# Builds Next.js frontend from design-source folder

cd design-source/non-parametric-tests-platform
npm install
npm run build
