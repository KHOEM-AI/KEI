#!/data/data/com.termux/files/usr/bin/bash
# setup-termux.sh — ដំឡើង + រត់ KEI (Khmer Editor & Input) ក្នុង Termux
set -e

echo "==> កំពុងអាប់ដេត Termux packages..."
pkg update -y && pkg upgrade -y

echo "==> កំពុងដំឡើង Node.js និង git..."
pkg install -y nodejs git

echo "==> ពិនិត្យកំណែ Node/npm..."
node -v
npm -v

if [ ! -f package.json ]; then
  echo "!! រកមិនឃើញ package.json ក្នុង folder បច្ចុប្បន្នទេ។"
  echo "   សូម cd ទៅ folder ដែលមាន package.json (ឧ. cd ~/KEI/khoem-now) រួចរត់ script នេះម្តងទៀត។"
  exit 1
fi

echo "==> កំពុងដំឡើង dependencies (npm install)..."
npm install

echo "==> ចាប់ផ្តើម Expo dev server..."
echo "    ស្កេន QR code ដោយកម្មវិធី Expo Go នៅលើទូរស័ព្ទ Android របស់បង"
npx expo start
