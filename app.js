const app=document.getElementById('app');
const KEY='musubizzz_demo_users';
const SESSION='musubizzz_demo_session';

const products=[
{id:1,name:'Musubi 300',price:300,daily:60,signin:5,duration:30},
{id:2,name:'Musubi 500',price:500,daily:135,signin:0,duration:30},
{id:3,name:'Musubi 800',price:800,daily:210,signin:0,duration:30}
];

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({
'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[c]));

function users(){
 return JSON.parse(localStorage.getItem(KEY)||'[]')
}

function saveUsers(u){
 localStorage.setItem(KEY,JSON.stringify(u))
}

function current(){
 const email=localStorage.getItem(SESSION);
 return users().find(u=>u.email===email)||null
}

function toast(t){
 const x=document.createElement('div');
 x.className='toast';
 x.textContent=t;
 document.body.appendChild(x);
 setTimeout(()=>x.remove(),2200)
}

function shell(content,active='home',showLogout=false){
 return `<div class="wrap">
 <header class="top">
 <div class="logo">🍙</div>
 <div>
 <div class="brand">musubizzz</div>
 <div class="muted">Musubi demo platform</div>
 </div>
 ${showLogout?'<button class="btn dark push" onclick="logout()">Logout</button>':''}
 </header>${content}</div>`
}

function nav(active){
 return `<nav class="nav">
 ${[
 ['home','⌂','Home'],
 ['products','🍙','Musubi'],
 ['signin','✓','Sign in'],
 ['profile','♙','Profile']
 ].map(x=>`
 <button class="${active===x[0]?'active':''}" onclick="${x[0]}Page()">
 <i>${x[1]}</i><small>${x[2]}</small>
 </button>`).join('')}
 </nav>`
}

function auth(reg=false){
 app.innerHTML=shell(`
 <section class="card form">
 <h1>${reg?'Create account':'Welcome back'}</h1>
 <p class="muted">${reg?'Create your Musubizzz demo account.':'Sign in to continue.'}</p>
 <div id="msg"></div>
 ${reg?'<div class="field"><label>Name</label><input id="name"></div>':''}
 <div class="field"><label>Email</label><input id="email" type="email"></div>
 <div class="field"><label>Password</label><input id="password" type="password"></div>
 <button class="btn orange" style="width:100%" onclick="${reg?'register()':'login()'}">
 ${reg?'Register':'Login'}
 </button>
 <div class="switch">${reg?'Already registered?':'New user?'}
 <a onclick="auth(${!reg})">${reg?'Login':'Register'}</a></div>
 <p class="demo">Demo only: account data is stored in this browser's local storage. Do not use a real password.</p>
 </section>`)
}

function login(){
 const e=document.getElementById('email').value.trim().toLowerCase();
 const p=document.getElementById('password').value;
 const u=users().find(x=>x.email===e&&x.password===p);

 if(!u){
  document.getElementById('msg').innerHTML='<div class="error">Invalid demo email or password.</div>';
  return
 }

 localStorage.setItem(SESSION,e);
 route()
}

function register(){
 const n=document.getElementById('name').value.trim();
 const e=document.getElementById('email').value.trim().toLowerCase();
 const p=document.getElementById('password').value;

 if(!n||!e||!p){
  document.getElementById('msg').innerHTML='<div class="error">Please complete all fields.</div>';
  return
 }

 let u=users();

 if(u.some(x=>x.email===e)){
  document.getElementById('msg').innerHTML='<div class="error">Email already registered.</div>';
  return
 }

 u.push({
  id:Date.now(),
  name:n,
  email:e,
  password:p,
  role:'user',
  demoBalance:0,
  purchased:[],
  signinDate:''
 });

 saveUsers(u);
 localStorage.setItem(SESSION,e);
 route()
}

function logout(){
 localStorage.removeItem(SESSION);
 auth()
}

function dashboard(){
 const u=current();
 if(!u)return auth();

 app.innerHTML=shell(`
 <section class="card notice">
 <span class="ticker">📢 Welcome to musubizzz — this is a demonstration site.</span>
 </section>

 <section class="card hero">
 <div>
 <div class="musubi">🍙</div>
 <h1>musubizzz</h1>
 <p class="muted">Enjoy delicious musubi. Explore our demo products.</p>
 <button class="btn orange" onclick="productsPage()">View Musubi Products</button>
 </div>
 </section>

 <section class="quick">
 <button onclick="dashboard()"><span>🏠</span>About</button>
 <button onclick="productsPage()"><span>🍙</span>Products</button>
 <button onclick="signinPage()"><span>✓</span>Sign in</button>
 <button onclick="profilePage()"><span>♙</span>Profile</button>
 </section>

 <section class="card">
 <div class="section-title">
 <h2>Our Musubi Products</h2><span>🍙</span>
 </div>
 <p class="muted">Choose a demo product to view its example figures.</p>
 </section>

 <div class="products">${products.map(productCard).join('')}</div>

 <section class="card">
 <h2>Demo balance</h2>
 <div class="stat"><strong>₱${Number(u.demoBalance||0).toFixed(2)}</strong></div>
 <p class="demo">This balance is for demonstration only. No money is collected and no profit is guaranteed.</p>
 </section>

 ${u.role==='admin'?`
 <section class="card admin">
 <h2>Admin</h2>
 <button class="btn orange" onclick="adminPage()">Open Admin Panel</button>
 </section>`:''}

 ${nav('home')}`,true)
}

function productCard(p){
 return `<article class="card product">
 <div class="row">
 <div>
 <h2>${esc(p.name)}</h2>
 <div class="price">₱${p.price}</div>
 </div>
 <span style="font-size:38px">🍙</span>
 </div>

 <div class="details">
 <div class="detail"><small>Displayed daily</small><b>₱${p.daily}</b></div>
 <div class="detail"><small>Duration</small><b>${p.duration} days</b></div>
 <div class="detail"><small>Sign-in</small><b>${p.signin?'₱'+p.signin:'—'}</b></div>
 </div>

 <button class="btn orange" style="width:100%" onclick="demoBuy(${p.id})">
 Select demo product
 </button>
 </article>`
}

function productsPage(){
 if(!current())return auth();

 app.innerHTML=shell(`
 <section class="card">
 <h1>Musubi Products</h1>
 <p class="muted">Demo catalog based on the requested figures.</p>
 <p class="demo">The displayed daily amounts are simulations/examples, not guaranteed earnings, investments, or financial returns.</p>
 </section>

 <div class="products">${products.map(productCard).join('')}</div>

 ${nav('products')}`,'products',true)
}

function demoBuy(id){
 const u=current();
 if(!u)return auth();

 const p=products.find(x=>x.id===id);

 u.purchased.push({
  productId:id,
  at:new Date().toISOString()
 });

 saveUsers(users().map(x=>x.email===u.email?u:x));
 toast(`${p.name} selected — demo only`)
}

function signinPage(){
 const u=current();
 if(!u)return auth();

 const today=new Date().toISOString().slice(0,10);
 const claimed=u.signinDate===today;

 app.innerHTML=shell(`
 <section class="card">
 <h1>Daily Sign-in</h1>
 <p class="muted">Product 1 displays a ₱5 sign-in amount in this demo.</p>
 <button class="btn orange" ${claimed?'disabled':''} onclick="demoSignin()">
 ${claimed?'Already claimed today':'Claim demo sign-in'}
 </button>
 <p class="demo">No cash is paid. This is a local browser simulation.</p>
 </section>

 ${nav('signin')}`,'signin',true)
}

function demoSignin(){
 const u=current();
 if(!u)return auth();

 const today=new Date().toISOString().slice(0,10);

 if(u.signinDate===today){
  toast('Already claimed today');
  return
 }

 u.signinDate=today;
 u.demoBalance=Number(u.demoBalance||0)+5;

 saveUsers(users().map(x=>x.email===u.email?u:x));
 toast('Demo sign-in added ₱5');
 signinPage()
}

function profilePage(){
 const u=current();
 if(!u)return auth();

 app.innerHTML=shell(`
 <section class="card">
 <h1>Profile</h1>

 <div class="profile-line">
 <b>Name</b><br>${esc(u.name)}
 </div>

 <div class="profile-line">
 <b>Email</b><br>${esc(u.email)}
 </div>

 <div class="profile-line">
 <b>User ID</b><br>${u.id}
 </div>

 <div class="profile-line">
 <b>Role</b><br>${u.role}
 </div>

 <div class="profile-line">
 <b>Demo balance</b><br>₱${Number(u.demoBalance||0).toFixed(2)}
 </div>
 </section>

 ${u.role==='admin'?`
 <section class="card admin">
 <h2>Admin Panel</h2>
 <button class="btn orange" onclick="adminPage()">Open Admin Panel</button>
 </section>`:''}

 ${nav('profile')}`,'profile',true)
}

function adminPage(){
 const u=current();

 if(!u||u.role!=='admin')return profilePage();

 const us=users();

 app.innerHTML=shell(`
 <section class="card admin">
 <h1>Admin Panel</h1>
 <p class="muted">Local demo user management.</p>

 <div style="overflow:auto">
 <table class="table">
 <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>
 ${us.map(x=>`
 <tr>
 <td>${x.id}</td>
 <td>${esc(x.name)}</td>
 <td>${esc(x.email)}</td>
 <td>${x.role}</td>
 </tr>`).join('')}
 </table>
 </div>

 <p class="demo">For demo purposes only. This static GitHub Pages version has no secure server/database.</p>
 </section>

 <button class="btn dark" onclick="dashboard()">Back to Home</button>
 `,'home',true)
}

function route(){
 current()?dashboard():auth()
}

if(!localStorage.getItem(KEY)){
 saveUsers([{
  id:1,
  name:'Demo Admin',
  email:'admin@musubizzz.local',
  password:'Admin123!',
  role:'admin',
  demoBalance:0,
  purchased:[],
  signinDate:''
 }])
}

route();
