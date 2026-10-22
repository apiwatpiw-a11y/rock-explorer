/*
 * ตั้งค่าเว็บไซต์ ROCK EXPLORER
 *
 * API_URL  : URL ของเว็บแอป Google Apps Script (ขึ้นต้นด้วย https://script.google.com/macros/s/.../exec)
 *            ถ้าเว้นว่าง เว็บจะทำงานแบบ "โหมดทดลอง" เก็บข้อมูลไว้ในเบราว์เซอร์เครื่องนั้นเท่านั้น
 * MODEL_BASE / MODEL_EXT : ที่อยู่ไฟล์โมเดลหิน 3 มิติ (ชื่อไฟล์ = รหัสหิน เช่น granite.glb)
 *            ค่าเริ่มต้นใช้ไฟล์จากเว็บส่องหิน AR ของครูบน GitHub Pages
 *            ถ้าวางโมเดลไว้ในเว็บนี้เอง ให้แก้เป็น MODEL_BASE: 'scans/'
 */
window.ROCK_CONFIG = {
  API_URL: '',
  MODEL_BASE: 'https://apiwatpiw-a11y.github.io/rock-ar/scans/',
  MODEL_EXT: 'glb'
};
