# The Void - Yayınlama Rehberi (Deploy)

Projenizi internette canlıya almak için en iyi platform **Vercel**'dir (Next.js'in yaratıcıları).

## Yöntem 1: GitHub ile (Önerilen)

1.  **GitHub'da Yeni Depo Açın**:
    *   [github.com/new](https://github.com/new) adresine gidin.
    *   Repository name: `the-void`
    *   "Public" veya "Private" seçin.
    *   "Create repository" butonuna basın.

2.  **Bu Klasörü Yükleyin**:
    *   Terminal veya CMD ekranını bu klasörde açın.
    *   Şu komutları sırasıyla yapıştırın (GitHub'da size verilen linki kullanın):
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/KULLANICI_ADINIZ/the-void.git
        git push -u origin main
        ```

3.  **Vercel'e Bağlayın**:
    *   [vercel.com/new](https://vercel.com/new) adresine gidin.
    *   GitHub hesabınızla giriş yapın.
    *   Listede `the-void` projesini göreceksiniz. **"Import"** butonuna basın.
    *   Hiçbir ayarı değiştirmeden **"Deploy"** butonuna basın.

---

## Yöntem 2: Vercel CLI (Komut Satırı ile)

GitHub ile uğraşmak istemiyorsanız:

1.  Bu klasörde terminali açın.
2.  Şu komutu yazıp Vercel aracını yükleyin:
    ```bash
    npm i -g vercel
    ```
3.  Yüklendikten sonra sadece şu komutu yazın:
    ```bash
    vercel
    ```
4.  Size "Log in" diyecek, emailinizi girin veya tarayıcıdan giriş yapın.
5.  Sorulara sırasıyla `Y` (Yes) diyip geçin.

Bu işlem bittiğinde size canlı bir link (örn: `the-void.vercel.app`) verecek.
