// Card request form (Home, Shop): success / error panels from ?sent=request or ?request=error, and a "Sending..." state.
import { showResult, guardSend } from './form-state.js';

const form = document.getElementById('request-form');
if (form) { showResult(form, 'request'); guardSend(form); }
