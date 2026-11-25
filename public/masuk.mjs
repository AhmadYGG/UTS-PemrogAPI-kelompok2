import { api, saatKirim } from './common.mjs';

const form = document.querySelector('.akses');
const lanjut = (pengguna) => location.replace(pengguna.peran === 'admin' ? 'admin.html' : '/');

saatKirim(form, form.querySelector('.salah'), async (isi) => lanjut(await api('POST', form.dataset.tujuan, isi)));

const pengguna = await api('GET', '/auth/saya').catch(() => null);
if (pengguna) lanjut(pengguna);
