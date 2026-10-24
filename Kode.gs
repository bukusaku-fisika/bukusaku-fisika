/**
 * Penerima jawaban Buku Saku Fisika (Google Apps Script).
 *
 * Cara memasang:
 * 1. Dengan akun email penelitian, buat Google Sheets baru, misalnya "Data Buku Saku Suhu dan Kalor".
 * 2. Di Sheets itu, buka menu Ekstensi → Apps Script. Hapus kode bawaan, tempel seluruh kode ini, lalu simpan.
 * 3. Klik Terapkan (Deploy) → Penerapan baru → jenis "Aplikasi web".
 *    - Jalankan sebagai: Saya
 *    - Yang memiliki akses: Siapa saja
 * 4. Klik Terapkan, beri izin, lalu salin "URL aplikasi web" (berakhiran /exec).
 * 5. Tempel URL itu di bagian CONFIG.ENDPOINT pada file index.html buku saku.
 *
 * Jawaban siswa akan masuk ke enam tab: Log, Kuis, Uraian, Refleksi, Lab, dan Angket.
 */

const TAB = {
  mulai: 'Log', buka_halaman: 'Log', video: 'Log',
  pilihan_ganda: 'Kuis', isian_angka: 'Kuis', klasifikasi: 'Kuis',
  uraian: 'Uraian', nilai_diri: 'Uraian',
  rencana: 'Refleksi', status_belajar: 'Refleksi', refleksi: 'Refleksi',
  lab: 'Lab',
  angket_kemandirian: 'Angket'
};
const KOLOM = ['Diterima', 'Waktu di HP', 'Kode siswa', 'Kelas', 'Buku', 'Subbab', 'Jenis', 'Item', 'Isi'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const rows = Array.isArray(data) ? data : [data];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    rows.forEach(function (r) {
      const nama = TAB[r.jenis] || 'Lainnya';
      let sh = ss.getSheetByName(nama);
      if (!sh) { sh = ss.insertSheet(nama); sh.appendRow(KOLOM); sh.setFrozenRows(1); }
      const isi = r.data && typeof r.data === 'object'
        ? Object.keys(r.data).map(function (k) { return k + ': ' + r.data[k]; }).join('\n')
        : String(r.data || '');
      sh.appendRow([new Date(), r.waktu || '', r.kode || '', r.kelas || '', r.buku || '', r.subbab || '', r.jenis || '', r.item || '', isi]);
    });
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  } finally {
    lock.releaseLock();
  }
}

/** Untuk memeriksa bahwa URL aplikasi web aktif: buka URL-nya di browser. */
function doGet() {
  return ContentService.createTextOutput('Penerima jawaban Buku Saku Fisika aktif.');
}
