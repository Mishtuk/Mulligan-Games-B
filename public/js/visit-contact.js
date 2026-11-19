// Contact form: success / error panels from ?sent=contact or ?contact=error, and a "Sending..." state.
import { showResult, guardSend } from './form-state.js';

const form = document.getElementById('contact-form');
if (form) { showResult(form, 'contact'); guardSend(form); }
