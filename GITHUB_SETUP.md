# GitHub Setup Instructions

## Remote Repository Qo'shish

Quyidagi buyruqlarni bajarishingiz kerak (GitHub username'ingizni o'rniga qo'ying):

```bash
# Remote qo'shish (username'ingizni o'rniga qo'ying)
git remote add origin https://github.com/YOUR_USERNAME/AstraGo.git

# Yoki SSH orqali (agar SSH key sozlangan bo'lsa)
git remote add origin git@github.com:YOUR_USERNAME/AstraGo.git

# Branch nomini main ga o'zgartirish (agar kerak bo'lsa)
git branch -M main

# GitHub'ga push qilish
git push -u origin main
```

## Agar Repository Bo'sh Bo'lsa

Agar GitHub'da repository yaratgan bo'lsangiz va u bo'sh bo'lsa, yuqoridagi buyruqlar ishlaydi.

## Agar Repository'da README Bor Bo'lsa

Agar GitHub'da repository yaratganingizda README.md qo'shgan bo'lsangiz, avval pull qilish kerak:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Keyingi Qadamlar

1. GitHub'da repository'ni oching
2. Settings → Secrets → Actions (agar CI/CD kerak bo'lsa)
3. README.md faylini tekshiring
4. Deployment qilish uchun `docs/DEPLOYMENT_GUIDE.md` ni o'qing
