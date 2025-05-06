document.addEventListener('DOMContentLoaded', () => {
    // — Elements
    const registerBtn      = document.getElementById('register-btn');
    const loginBtn         = document.getElementById('login-btn');
    const registerModal    = document.getElementById('register-modal');
    const loginModal       = document.getElementById('login-modal');
    const closeRegister    = document.querySelector('.close-register');
    const closeLogin       = document.querySelector('.close-login');
    const registerForm     = document.getElementById('register-form');
    const loginForm        = document.getElementById('login-form');
    const reportForm       = document.getElementById('report-form');
    const itemsList        = document.getElementById('items-list');
  
    // — Modal open/close
    registerBtn.addEventListener('click', () => registerModal.style.display = 'flex');
    loginBtn   .addEventListener('click', () => loginModal.style.display    = 'flex');
    closeRegister.addEventListener('click', () => registerModal.style.display = 'none');
    closeLogin    .addEventListener('click', () => loginModal.style.display    = 'none');
    window.addEventListener('click', e => {
      if (e.target === registerModal) registerModal.style.display = 'none';
      if (e.target === loginModal)    loginModal.style.display    = 'none';
    });
  
    // — Register
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const res = await fetch('/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const { message } = await res.json();
      alert(message);
      if (res.status === 201) registerModal.style.display = 'none';
    });
  
    // — Login
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const { message } = await res.json();
      alert(message);
      if (res.status === 200) loginModal.style.display = 'none';
    });
  
    // — Report item
    reportForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('item_name',  document.getElementById('item-name').value);
      formData.append('description', document.getElementById('description').value);
      formData.append('status',     document.getElementById('status').value);
      formData.append('contact',    document.getElementById('contact').value);
      formData.append('image',      document.getElementById('image-upload').files[0]);
  
      const res = await fetch('/api/report', { method: 'POST', body: formData });
      const { message } = await res.json();
      alert(message);
      reportForm.reset();
      loadItems();
    });
  
    // — Load items
    async function loadItems() {
      const res = await fetch('/api/items');
      const items = await res.json();
      itemsList.innerHTML = '';
      items.forEach(i => {
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
          <h3>${i.item_name} (${i.status})</h3>
          <p>${i.description}</p>
          ${i.image_url ? `<img src="${i.image_url}" alt="Item Image">` : ''}
          <p>Contact: ${i.contact}</p>
        `;
        itemsList.appendChild(li);
      });
    }
    loadItems();  
  });
  