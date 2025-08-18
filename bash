# 1) Create project
npx create-next-app@latest saletagr --ts --eslint --src-dir --app --tailwind
cd saletagr

# 2) Install deps
npm i stripe @prisma/client prisma qrcode pdf-lib jszip zod date-fns
npm i -D @types/qrcode

# 3) Replace/add files per below, then:
npx prisma init
npx prisma migrate dev -n init
npm run dev