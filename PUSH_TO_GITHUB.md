# GitHub'ga Push Qilish

## Qadam 1: Remote Qo'shish

PowerShell'da quyidagi buyruqni bajaring (YOUR_USERNAME o'rniga GitHub username'ingizni yozing):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/AstraGo.git
```

**Misol:** Agar username'ingiz `johndoe` bo'lsa:
```powershell
git remote add origin https://github.com/johndoe/AstraGo.git
```

## Qadam 2: GitHub'ga Push Qilish

```powershell
git push -u origin main
```

Agar GitHub'da authentication so'ralsa:
- Personal Access Token (PAT) yoki
- GitHub Desktop yoki
- SSH key ishlatishingiz mumkin

## Agar Xatolik Bo'lsa

### "Repository not found"
- GitHub'da repository yaratilganligini tekshiring
- Repository nomi `AstraGo` bo'lishi kerak
- Username to'g'ri ekanligini tekshiring

### "Authentication failed"
- GitHub'da Settings → Developer settings → Personal access tokens
- Token yarating va password o'rniga ishlating

### "Updates were rejected"
Agar repository'da boshqa fayllar bo'lsa:
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Muvaffaqiyatli Push Qilgandan Keyin

1. GitHub'da repository'ni oching: `https://github.com/YOUR_USERNAME/AstraGo`
2. Barcha fayllar ko'rinishi kerak
3. Keyin `docs/DEPLOYMENT_GUIDE.md` ni o'qib, production'ga deploy qiling
