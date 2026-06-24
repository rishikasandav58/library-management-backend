#!/bin/bash
# Deploy script for Library Management System Frontend

echo "🚀 Building frontend for production..."
cd /mnt/c/Users/Rishika/library-management-system/client
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 To deploy to Vercel:"
echo "   1. Go to https://vercel.com/new"
echo "   2. Import your GitHub repo: rishikasandav58/library-management-backend"
echo "   3. Set framework preset to 'Vite'"
echo "   4. Set root directory to 'client'"
echo "   5. Click Deploy"
echo ""
echo "🌐 Or use Vercel CLI:"
echo "   npx vercel login"
echo "   npx vercel --prod"
echo ""
echo "📁 Build output is in: client/dist/"
