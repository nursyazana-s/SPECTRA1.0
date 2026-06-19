// ============================================================
// SPECTRA v3 — Core Logic
// Healthcare Intelligence Office HTPN
// ============================================================
const SK = { SUBS:'spectra_subs', USERS:'spectra_users', AUTH:'spectra_auth' };

function initUsers() {
  if (!localStorage.getItem(SK.USERS)) {
    localStorage.setItem(SK.USERS, JSON.stringify([
      { id:1, username:'admin', password:'htpn2024', name:'Admin HTPN', role:'admin', status:'active', email:'admin@htpn.gov.my' },
      { id:2, username:'ot.farah', password:'spectra123', name:'OT Farah Hana', role:'therapist', status:'active', email:'farah@htpn.gov.my' },
      { id:3, username:'ot.ahmad', password:'spectra123', name:'OT Ahmad Zaki', role:'therapist', status:'active', email:'ahmad@htpn.gov.my' }
    ]));
  }
}

function login(u,p) {
  const users = JSON.parse(localStorage.getItem(SK.USERS)||'[]');
  const user = users.find(x=>x.username===u&&x.password===p&&x.status==='active');
  if (user) { localStorage.setItem(SK.AUTH, JSON.stringify({...user,loginTime:Date.now()})); return user; }
  return null;
}
function logout() { localStorage.removeItem(SK.AUTH); window.location.href='../pages/therapist-login.html'; }
function getAuth() { const a=localStorage.getItem(SK.AUTH); return a?JSON.parse(a):null; }
function requireAuth() { const a=getAuth(); if(!a){window.location.href='../pages/therapist-login.html';return null;} return a; }
function getSubmissions() { return JSON.parse(localStorage.getItem(SK.SUBS)||'[]'); }
function saveSubmission(s) { const subs=getSubmissions(); subs.unshift(s); localStorage.setItem(SK.SUBS,JSON.stringify(subs)); }
function updateSubmission(id,updates) {
  const subs=getSubmissions(); const i=subs.findIndex(s=>s.id===id);
  if(i>=0){subs[i]={...subs[i],...updates};localStorage.setItem(SK.SUBS,JSON.stringify(subs));return true;}
  return false;
}
function findByIC(ic6) { return getSubmissions().filter(s=>s.ic6===ic6); }
function findById(id) { return getSubmissions().find(s=>s.id===id)||null; }

// ── SP2 QUESTIONS (all 9 sections) ──
const SP2_QUESTIONS = {
  auditory:{ label:'Auditory Processing', icon:'👂🔊', color:'#3B82F6', bg:'#EFF6FF', gradient:'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
    desc:{ en:'How your child responds to sounds and auditory stimuli in their environment.', bm:'Bagaimana anak anda bertindak balas terhadap bunyi di persekitarannya.' },
    items:[
      {num:1,q:'AV',en:'reacts strongly to unexpected or loud noises (e.g., sirens, dog barking, hair dryer).',bm:'bertindak balas dengan kuat terhadap bunyi yang tidak dijangka atau kuat (cth: siren, anjing menyalak, pengering rambut).'},
      {num:2,q:'AV',en:'holds hands over ears to protect them from sound.',bm:'memegang tangan ke telinga untuk melindungi diri dari bunyi.'},
      {num:3,q:'SN',en:'struggles to complete tasks when music or TV is on.',bm:'sukar menyiapkan tugas apabila muzik atau TV sedang bermain.'},
      {num:4,q:'SN',en:'is distracted when there is a lot of noise around.',bm:'mudah terganggu apabila terdapat banyak bunyi di sekeliling.'},
      {num:5,q:'AV',en:'becomes unproductive with background noise (e.g., fan, refrigerator).',bm:'tidak produktif dengan bunyi latar belakang (cth: kipas, peti sejuk).'},
      {num:6,q:'SN',en:'tunes me out or seems to ignore me.',bm:'tidak menghiraukan saya atau kelihatan mengabaikan saya.'},
      {num:7,q:'SN',en:'seems not to hear when I call his or her name (even though hearing is OK).',bm:'kelihatan tidak mendengar apabila saya memanggil namanya (walaupun pendengaran baik).'},
      {num:8,q:'RG',en:'enjoys strange noises or makes noise(s) for fun.',bm:'gemar bunyi-bunyi pelik atau membuat bunyi untuk keseronokan.'}
    ]
  },
  visual:{ label:'Visual Processing', icon:'👁️✨', color:'#8B5CF6', bg:'#F3E8FF', gradient:'linear-gradient(135deg,#F3E8FF,#EDE9FE)',
    desc:{ en:'How your child processes and responds to visual information.', bm:'Bagaimana anak anda memproses dan bertindak balas terhadap maklumat visual.' },
    items:[
      {num:9,q:'SN',en:'prefers to play or work in low lighting.',bm:'lebih suka bermain atau bekerja dalam pencahayaan yang rendah.'},
      {num:10,q:null,en:'prefers bright colors or patterns for clothing.',bm:'lebih suka warna terang atau corak untuk pakaian.'},
      {num:11,q:null,en:'enjoys looking at visual details in objects.',bm:'gemar melihat perincian visual pada objek.'},
      {num:12,q:'RG',en:'needs help to find objects that are obvious to others.',bm:'memerlukan bantuan untuk mencari objek yang jelas kepada orang lain.'},
      {num:13,q:'SN',en:'is more bothered by bright lights than other same-aged children.',bm:'lebih terganggu dengan cahaya terang berbanding kanak-kanak seusianya.'},
      {num:14,q:'SK',en:'watches people as they move around the room.',bm:'memerhati orang apabila mereka bergerak di dalam bilik.'}
    ]
  },
  touch:{ label:'Touch Processing', icon:'🤲💆', color:'#EC4899', bg:'#FDF2F8', gradient:'linear-gradient(135deg,#FDF2F8,#FCE7F3)',
    desc:{ en:'How your child responds to tactile input and touching experiences.', bm:'Bagaimana anak anda bertindak balas terhadap sentuhan.' },
    items:[
      {num:16,q:'SN',en:'shows distress during grooming (e.g., fights or cries during haircutting, face washing, fingernail cutting).',bm:'menunjukkan kesusahan semasa penjagaan diri (cth: menentang atau menangis semasa potong rambut, basuh muka, potong kuku).'},
      {num:17,q:null,en:'becomes irritated by wearing shoes or socks.',bm:'mudah marah apabila memakai kasut atau stokin.'},
      {num:18,q:'AV',en:'shows an emotional or aggressive response to being touched.',bm:'menunjukkan tindak balas emosi atau agresif apabila disentuh.'},
      {num:19,q:'SN',en:'becomes anxious when standing close to others (e.g., in a line).',bm:'menjadi cemas apabila berdiri berhampiran orang lain (cth: dalam barisan).'},
      {num:20,q:'SN',en:'rubs or scratches a part of the body that has been touched.',bm:'menggosok atau menggaruk bahagian badan yang telah disentuh.'},
      {num:21,q:'SK',en:'touches people or objects to the point of annoying others.',bm:'menyentuh orang atau objek sehingga menjengkelkan orang lain.'},
      {num:22,q:'SK',en:'displays need to touch toys, surfaces, or textures (e.g., wants to get the feeling of everything).',bm:'menunjukkan keperluan untuk menyentuh mainan, permukaan, atau tekstur.'},
      {num:23,q:'RG',en:'seems unaware of pain.',bm:'kelihatan tidak sedar tentang kesakitan.'},
      {num:24,q:'RG',en:'seems unaware of temperature changes.',bm:'kelihatan tidak sedar tentang perubahan suhu.'},
      {num:25,q:'SK',en:'touches people and objects more than same-aged children.',bm:'menyentuh orang dan objek lebih daripada kanak-kanak seusianya.'},
      {num:26,q:'RG',en:'seems oblivious to messy hands or face.',bm:'kelihatan tidak kisah tentang tangan atau muka yang kotor.'}
    ]
  },
  movement:{ label:'Movement Processing', icon:'🏃‍♂️🌀', color:'#10B981', bg:'#F0FDF4', gradient:'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
    desc:{ en:'How your child responds to and seeks movement experiences.', bm:'Bagaimana anak anda bertindak balas dan mencari pengalaman pergerakan.' },
    items:[
      {num:27,q:'SK',en:"pursues movement to the point it interferes with daily routines (e.g., can't sit still, fidgets).",bm:'mencari pergerakan sehingga mengganggu rutin harian (cth: tidak boleh duduk diam, resah).'},
      {num:28,q:'SK',en:'rocks in chair, on floor, or while standing.',bm:'bergoyang di kerusi, di lantai, atau semasa berdiri.'},
      {num:29,q:null,en:'hesitates going up or down curbs or steps (e.g., is cautious, stops before moving).',bm:'teragak-agak untuk naik atau turun tangga (cth: berhati-hati, berhenti sebelum bergerak).'},
      {num:30,q:'SK',en:'becomes excited during movement tasks.',bm:'menjadi teruja semasa melakukan tugasan pergerakan.'},
      {num:31,q:'SK',en:'takes movement or climbing risks that are unsafe.',bm:'mengambil risiko pergerakan atau memanjat yang tidak selamat.'},
      {num:32,q:'SK',en:'looks for opportunities to fall with no regard for own safety.',bm:'mencari peluang untuk jatuh tanpa mengambil kira keselamatan diri.'},
      {num:33,q:'RG',en:'loses balance unexpectedly when walking on an uneven surface.',bm:'tiba-tiba kehilangan keseimbangan apabila berjalan di permukaan yang tidak rata.'},
      {num:34,q:'RG',en:'bumps into things, failing to notice objects or people in the way.',bm:'berlanggar dengan benda, gagal melihat objek atau orang di hadapan.'}
    ]
  },
  bodyPosition:{ label:'Body Position Processing', icon:'🧍‍♂️💪', color:'#F59E0B', bg:'#FFFBEB', gradient:'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
    desc:{ en:'How your child is aware of their body position and uses their muscles.', bm:'Bagaimana anak anda sedar tentang kedudukan badannya dan menggunakan ototnya.' },
    items:[
      {num:35,q:'RG',en:'moves stiffly.',bm:'bergerak dengan kaku.'},
      {num:36,q:'RG',en:'becomes tired easily, especially when standing or holding the body in one position.',bm:'cepat penat, terutamanya apabila berdiri atau mengekalkan badan dalam satu kedudukan.'},
      {num:37,q:'RG',en:'seems to have weak muscles.',bm:'kelihatan mempunyai otot yang lemah.'},
      {num:38,q:'RG',en:'props to support self (e.g., holds head in hands, leans against a wall).',bm:'bersandar untuk menyokong diri (cth: menopang kepala di tangan, bersandar pada dinding).'},
      {num:39,q:'RG',en:'clings to objects, walls, or banisters more than same-aged children.',bm:'bergantung pada objek, dinding, atau pagar lebih daripada kanak-kanak seusianya.'},
      {num:40,q:'RG',en:'walks loudly as if feet are heavy.',bm:'berjalan dengan kuat seolah-olah kaki berat.'},
      {num:41,q:'SK',en:'drapes self over furniture or on other people.',bm:'bersandar ke atas perabot atau orang lain.'},
      {num:42,q:null,en:'needs heavy blankets to sleep.',bm:'memerlukan selimut berat untuk tidur.'}
    ]
  },
  oral:{ label:'Oral Sensory Processing', icon:'👄🍎', color:'#EF4444', bg:'#FFF5F5', gradient:'linear-gradient(135deg,#FFF5F5,#FEE2E2)',
    desc:{ en:'How your child responds to tastes, textures, and oral sensory experiences.', bm:'Bagaimana anak anda bertindak balas terhadap rasa, tekstur, dan pengalaman deria oral.' },
    items:[
      {num:43,q:null,en:'gags easily from certain food textures or food utensils in mouth.',bm:'mudah loya dengan tekstur makanan tertentu atau peralatan makan dalam mulut.'},
      {num:44,q:'SN',en:"rejects certain tastes or food smells that are typically part of children's diets.",bm:'menolak rasa atau bau makanan tertentu yang biasanya menjadi diet kanak-kanak.'},
      {num:45,q:'SN',en:'eats only certain tastes (e.g., sweet, salty).',bm:'hanya makan rasa tertentu (cth: manis, masin).'},
      {num:46,q:'SN',en:'limits self to certain food textures.',bm:'hanya makan tekstur makanan tertentu.'},
      {num:47,q:'SN',en:'is a picky eater, especially about food textures.',bm:'pemilih dalam makanan, terutamanya tentang tekstur makanan.'},
      {num:48,q:'SK',en:'smells nonfood objects.',bm:'menghidu objek bukan makanan.'},
      {num:49,q:'SK',en:'shows a strong preference for certain tastes.',bm:'menunjukkan kecenderungan kuat terhadap rasa tertentu.'},
      {num:50,q:'SK',en:'craves certain foods, tastes, or smells.',bm:'mengidamkan makanan, rasa, atau bau tertentu.'},
      {num:51,q:'SK',en:'puts objects in mouth (e.g., pencil, hands).',bm:'memasukkan objek ke dalam mulut (cth: pensel, tangan).'},
      {num:52,q:'SN',en:'bites tongue or lips more than same-aged children.',bm:'menggigit lidah atau bibir lebih daripada kanak-kanak seusianya.'}
    ]
  },
  conduct:{ label:'Conduct', icon:'🎭⚡', color:'#6366F1', bg:'#EEF2FF', gradient:'linear-gradient(135deg,#EEF2FF,#E0E7FF)',
    desc:{ en:'Behavioural patterns associated with sensory processing.', bm:'Corak tingkah laku yang berkaitan dengan pemprosesan deria.' },
    items:[
      {num:53,q:'RG',en:'seems accident-prone.',bm:'kelihatan mudah mengalami kemalangan.'},
      {num:54,q:'RG',en:'rushes through coloring, writing, or drawing.',bm:'tergesa-gesa semasa mewarna, menulis, atau melukis.'},
      {num:55,q:'SK',en:'takes excessive risks (e.g., climbs high into a tree, jumps off tall furniture) that compromise own safety.',bm:'mengambil risiko berlebihan (cth: memanjat pokok tinggi, melompat dari perabot tinggi).'},
      {num:56,q:'SK',en:'seems more active than same-aged children.',bm:'kelihatan lebih aktif daripada kanak-kanak seusianya.'},
      {num:57,q:'RG',en:'does things in a harder way than is needed (e.g., wastes time, moves slowly).',bm:'melakukan perkara dengan cara yang lebih sukar dari yang diperlukan.'},
      {num:58,q:'AV',en:'can be stubborn and uncooperative.',bm:'boleh keras kepala dan tidak bekerjasama.'},
      {num:59,q:'AV',en:'has temper tantrums.',bm:'mengamuk.'},
      {num:60,q:'SK',en:'appears to enjoy falling.',bm:'kelihatan menikmati jatuh.'},
      {num:61,q:'AV',en:'resists eye contact from me or others.',bm:'mengelakkan hubungan mata dengan saya atau orang lain.'}
    ]
  },
  socialEmotional:{ label:'Social Emotional', icon:'❤️🤝', color:'#F43F5E', bg:'#FFF1F2', gradient:'linear-gradient(135deg,#FFF1F2,#FFE4E6)',
    desc:{ en:'Social and emotional responses related to sensory experiences.', bm:'Tindak balas sosial dan emosi berkaitan pengalaman deria.' },
    items:[
      {num:62,q:'RG',en:'seems to have low self-esteem (e.g., difficulty liking self).',bm:'kelihatan mempunyai harga diri yang rendah.'},
      {num:63,q:'AV',en:'needs positive support to return to challenging situations.',bm:'memerlukan sokongan positif untuk kembali kepada situasi yang mencabar.'},
      {num:64,q:'AV',en:'is sensitive to criticisms.',bm:'sensitif terhadap kritikan.'},
      {num:65,q:'AV',en:'has definite, predictable fears.',bm:'mempunyai ketakutan yang pasti dan boleh dijangka.'},
      {num:66,q:'AV',en:'expresses feeling like a failure.',bm:'menyatakan perasaan seperti seorang yang gagal.'},
      {num:67,q:'AV',en:'is too serious.',bm:'terlalu serius.'},
      {num:68,q:'AV',en:'has strong emotional outbursts when unable to complete a task.',bm:'mempunyai ledakan emosi yang kuat apabila tidak dapat menyelesaikan tugas.'},
      {num:69,q:'SN',en:'struggles to interpret body language or facial expression.',bm:'sukar untuk mentafsir bahasa badan atau ekspresi muka.'},
      {num:70,q:'AV',en:'gets frustrated easily.',bm:'mudah kecewa.'},
      {num:71,q:'AV',en:'has fears that interfere with daily routines.',bm:'mempunyai ketakutan yang mengganggu rutin harian.'},
      {num:72,q:'AV',en:'is distressed by changes in plans, routines, or expectations.',bm:'tertekan dengan perubahan dalam rancangan, rutin, atau jangkaan.'},
      {num:73,q:'SN',en:'needs more protection from life than same-aged children.',bm:'memerlukan lebih perlindungan daripada kanak-kanak seusianya.'},
      {num:74,q:'AV',en:'interacts or participates in groups less than same-aged children.',bm:'berinteraksi atau menyertai kumpulan kurang daripada kanak-kanak seusianya.'},
      {num:75,q:'AV',en:'has difficulty with friendships (e.g., making or keeping friends).',bm:'mempunyai kesukaran dalam persahabatan.'}
    ]
  },
  attentional:{ label:'Attentional', icon:'🧠🎯', color:'#0EA5E9', bg:'#F0F9FF', gradient:'linear-gradient(135deg,#F0F9FF,#E0F2FE)',
    desc:{ en:'Attention and focus patterns associated with sensory processing.', bm:'Corak perhatian dan tumpuan berkaitan pemprosesan deria.' },
    items:[
      {num:76,q:'RG',en:'misses eye contact with me during everyday interactions.',bm:'terlepas hubungan mata dengan saya semasa interaksi harian.'},
      {num:77,q:'SN',en:'struggles to pay attention.',bm:'sukar untuk memberi perhatian.'},
      {num:78,q:'SN',en:'looks away from tasks to notice all actions in the room.',bm:'memalingkan pandangan dari tugas untuk melihat semua tindakan dalam bilik.'},
      {num:79,q:'RG',en:'seems oblivious within an active environment (e.g., unaware of activity).',bm:'kelihatan tidak sedar dalam persekitaran yang aktif.'},
      {num:80,q:'RG',en:'stares intensely at objects.',bm:'menatap objek dengan penuh perhatian.'},
      {num:81,q:'AV',en:'stares intensely at people.',bm:'menatap orang dengan penuh perhatian.'},
      {num:82,q:'SK',en:'watches everyone when they move around the room.',bm:'memerhati semua orang apabila mereka bergerak di dalam bilik.'},
      {num:83,q:'SK',en:'jumps from one thing to another so that it interferes with activities.',bm:'melompat dari satu perkara ke perkara lain sehingga mengganggu aktiviti.'},
      {num:84,q:'SN',en:'gets lost easily.',bm:'mudah tersesat.'},
      {num:85,q:'RG',en:'has a hard time finding objects in competing backgrounds.',bm:'sukar untuk mencari objek dalam latar belakang yang bersaing.'}
    ]
  }
};

const SP2_NORMS = {
  quadrants:{
    seeking:{max:95,muchLess:[0,6],less:[7,19],typical:[20,47],more:[48,60],muchMore:[61,95]},
    avoiding:{max:100,muchLess:[0,7],less:[8,20],typical:[21,46],more:[47,59],muchMore:[60,100]},
    sensitivity:{max:95,muchLess:[0,6],less:[7,17],typical:[18,42],more:[43,53],muchMore:[54,95]},
    registration:{max:110,muchLess:[0,6],less:[7,18],typical:[19,43],more:[44,55],muchMore:[56,110]}
  },
  sections:{
    auditory:{max:40,muchLess:[0,2],less:[3,9],typical:[10,24],more:[25,31],muchMore:[32,40]},
    visual:{max:30,muchLess:[0,4],less:[5,8],typical:[9,17],more:[18,21],muchMore:[22,30]},
    touch:{max:55,muchLess:[0,0],less:[1,7],typical:[8,21],more:[22,28],muchMore:[29,55]},
    movement:{max:40,muchLess:[0,1],less:[2,6],typical:[7,18],more:[19,24],muchMore:[25,40]},
    bodyPosition:{max:40,muchLess:[0,0],less:[1,4],typical:[5,15],more:[16,19],muchMore:[20,40]},
    oral:{max:50,muchLess:null,less:[0,7],typical:[8,24],more:[25,32],muchMore:[33,50]},
    conduct:{max:45,muchLess:[0,1],less:[2,8],typical:[9,22],more:[23,29],muchMore:[30,45]},
    socialEmotional:{max:70,muchLess:[0,2],less:[3,12],typical:[13,31],more:[32,41],muchMore:[42,70]},
    attentional:{max:50,muchLess:[0,0],less:[1,8],typical:[9,24],more:[25,31],muchMore:[32,50]}
  }
};

const QUAD_ITEMS = {
  seeking:[14,21,22,25,27,28,30,31,32,41,48,49,50,51,55,56,60,82,83],
  avoiding:[1,2,5,15,18,58,59,61,63,64,65,66,67,68,70,71,72,74,75,81],
  sensitivity:[3,4,6,7,9,13,16,19,20,44,45,46,47,52,69,73,77,78,84],
  registration:[8,12,23,24,26,33,34,35,36,37,38,39,40,53,54,57,62,76,79,80,85,86]
};

function classify(score,norms){
  if(!norms) return {label:'N/A',key:'typical'};
  const c=(r)=>r&&score>=r[0]&&score<=r[1];
  if(c(norms.muchLess)) return {label:'Much Less Than Others',key:'much-less'};
  if(c(norms.less))     return {label:'Less Than Others',key:'less'};
  if(c(norms.typical))  return {label:'Just Like the Majority',key:'typical'};
  if(c(norms.more))     return {label:'More Than Others',key:'more'};
  if(c(norms.muchMore)) return {label:'Much More Than Others',key:'much-more'};
  return {label:'Just Like the Majority',key:'typical'};
}

function calcScores(answers){
  const sections={};
  for(const[k,sec] of Object.entries(SP2_QUESTIONS)){
    sections[k]=sec.items.reduce((t,item)=>t+parseInt(answers[item.num]||0),0);
  }
  const quadrants={};
  for(const[quad,items] of Object.entries(QUAD_ITEMS)){
    quadrants[quad]=items.reduce((t,n)=>t+parseInt(answers[n]||0),0);
  }
  return {sections,quadrants};
}

function getFullReport(answers){
  const{sections,quadrants}=calcScores(answers);
  const qReport={};
  for(const[k,score] of Object.entries(quadrants)){
    qReport[k]={score,max:SP2_NORMS.quadrants[k].max,classification:classify(score,SP2_NORMS.quadrants[k])};
  }
  const sReport={};
  for(const[k,score] of Object.entries(sections)){
    if(SP2_NORMS.sections[k]){
      sReport[k]={score,max:SP2_NORMS.sections[k].max,classification:classify(score,SP2_NORMS.sections[k])};
    }
  }
  return{qReport,sReport};
}

function genClinicalSummary(report,childName){
  const{qReport,sReport}=report;
  const name=childName||'the child';
  const SN={auditory:'Auditory Processing',visual:'Visual Processing',touch:'Tactile Processing',movement:'Vestibular/Movement',bodyPosition:'Proprioceptive/Body Position',oral:'Oral Sensory',conduct:'Conduct',socialEmotional:'Social-Emotional',attentional:'Attentional'};
  let html=`<p>Based on the Child Sensory Profile 2 (SP-2) caregiver questionnaire (Dunn, 2014), the following sensory processing profile was identified for <strong>${name}</strong>:</p>`;
  const concerns=[],moderate=[];
  for(const[k,d] of Object.entries(sReport)){
    if(d.classification.key==='much-more') concerns.push(SN[k]+` (${d.score}/${d.max})`);
    else if(d.classification.key==='more') moderate.push(SN[k]+` (${d.score}/${d.max})`);
  }
  if(concerns.length>0) html+=`<p>⚠️ <strong>Significant concerns (Much More Than Others):</strong> ${name} demonstrates significantly elevated scores in <strong>${concerns.join('; ')}</strong>. These scores fall more than 2 standard deviations above the mean, indicating these behaviours occur at a much higher frequency than same-aged peers and are likely impacting daily functioning.</p>`;
  if(moderate.length>0) html+=`<p>📊 <strong>Moderate concerns (More Than Others):</strong> Elevated scores noted in <strong>${moderate.join('; ')}</strong>. These areas (1 SD above mean) may benefit from targeted sensory intervention strategies.</p>`;
  const qConcerns=Object.entries(qReport).filter(([,v])=>['more','much-more'].includes(v.classification.key));
  if(qConcerns.length>0){
    html+=`<p>🔷 <strong>Quadrant Profile:</strong> `;
    for(const[k] of qConcerns){
      if(k==='seeking') html+=`<strong>Seeker Profile</strong> — ${name} actively seeks additional sensory input. May present as hyperactive, constantly moving, touching everything. `;
      if(k==='avoiding') html+=`<strong>Avoider Profile</strong> — ${name} is easily overwhelmed by sensory input. May present with emotional meltdowns and avoidance behaviours. `;
      if(k==='sensitivity') html+=`<strong>Sensor Profile</strong> — ${name} detects sensory input at a higher threshold, reacting strongly to stimuli others may not notice. `;
      if(k==='registration') html+=`<strong>Bystander Profile</strong> — ${name} misses sensory cues. May appear inattentive, clumsy, or unresponsive. `;
    }
    html+=`</p>`;
  }
  if(concerns.length===0&&moderate.length===0) html+=`<p>✅ <strong>Within Typical Range:</strong> Overall sensory processing scores fall within the typical range. No significant sensory concerns identified at this time.</p>`;
  html+=`<p><em>📌 This summary is generated from caregiver-reported observations using SP-2 (Dunn, 2014). Must be reviewed and validated by a registered Occupational Therapist prior to any clinical decision-making. HITL verification is mandatory.</em></p>`;
  return html;
}

function genHomeProgramme(report){
  const{sReport}=report;
  const prog=[];
  const concern=(k)=>sReport[k]&&['more','much-more'].includes(sReport[k].classification.key);

  if(concern('auditory')) prog.push({domain:'Auditory Sensory',icon:'👂',color:'#3B82F6',bg:'#EFF6FF',evidence:'Schaaf & Mailloux (2015). Intervention for Sensory Processing Disorder. AJOT.',activities:[{name:'Sound Desensitisation',steps:['Play soft music (50–60 dB) during daily activities; gradually increase tolerance over 2 weeks','Use noise-cancelling headphones in overwhelming environments (supermarket, assembly)','Sound detective game: identify 5 household sounds with eyes closed (10 min/day)','White noise machine during sleep and homework time','Clapping rhythm games: parent claps pattern, child repeats (10–15 min)']},{name:'Auditory Motor Integration',steps:['Simon Says with sound cues — improves auditory processing and motor response','Read aloud with varied vocal tones; child listens and predicts next words','Simple instruments (drum, xylophone) to develop rhythm and auditory tolerance (15 min)']}]});

  if(concern('touch')) prog.push({domain:'Tactile Sensory',icon:'🤲',color:'#EC4899',bg:'#FDF2F8',evidence:'Ayres (1979). Sensory Integration and the Child. Western Psychological Services.',activities:[{name:'Tactile Desensitisation',steps:['Introduce textures gradually: smooth → rough → bumpy (5–10 min/day)','Messy play: kinetic sand, playdough, water beads — build tolerance slowly','Firm pressure massage BEFORE grooming (scalp, arms, legs)','Use vibrating toothbrush to reduce oral tactile sensitivity','Deep pressure "sandwiching": roll child in blanket, apply gentle pressure']},{name:'Deep Pressure Activities',steps:['Weighted blanket (10% body weight): 20–30 min before bed or during homework','Wall push-ups: 10 reps × 3 sets, 3× daily','Carry weighted backpack (5–10% body weight) during morning routine','Body sock or compression vest: 20 min during focused tasks']}]});

  if(concern('movement')) prog.push({domain:'Vestibular & Movement',icon:'🏃',color:'#10B981',bg:'#F0FDF4',evidence:'Bundy et al. (2002). Sensory Integration: Theory and Practice. F.A. Davis.',activities:[{name:'Vestibular Input Activities',steps:['Swinging: linear forward/back — 20 min daily (inhibitory effect)','Rocking chair: 10–15 min before focused tasks (calming)','Balance board: stand 2–5 min before school or homework','Obstacle course at home: cushions, tunnels, balance beams (15–20 min daily)','Trampoline jumping: 10 min × 2 daily — regulates arousal level effectively']},{name:'Proprioceptive Heavy Work',steps:['Animal walks: bear crawl, crab walk — across room × 5','Wheelbarrow walking (parent holds legs): 5–10 metres × 3','Yoga poses: Downward Dog, Warrior, Child\'s Pose (15 min daily)','Stair climbing preferred over elevator: builds proprioceptive awareness']}]});

  if(concern('bodyPosition')) prog.push({domain:'Body Awareness / Proprioception',icon:'🧍',color:'#F59E0B',bg:'#FFFBEB',evidence:'Case-Smith & O\'Brien (2015). Occupational Therapy for Children. Elsevier.',activities:[{name:'Body Awareness Activities',steps:['Body tracing on large paper: trace outline, label body parts — builds body schema','Mirror imitation games: copy movements in front of full-length mirror (10 min)','Tug-of-war with towel: resistive input to joints and muscles (5 min)','Carrying tasks: laundry basket, groceries, books — purposeful heavy work daily']},{name:'Proprioceptive Sensory Diet',steps:['Morning routine (5 min): jumping jacks → star jumps → push-ups → stretches','Chair push-ups during study: hands on armrests, lift body × 10','Chewy snacks: bagels, dried fruit — jaw provides proprioceptive input','Jump 20 times before transitions (car, classroom, bedtime)']}]});

  if(concern('oral')) prog.push({domain:'Oral Sensory',icon:'👄',color:'#EF4444',bg:'#FFF5F5',evidence:'Toomey (2002). Food Chaining. Pediatric Feeding & Dysphagia Newsletter.',activities:[{name:'Oral Motor Programme',steps:['Blowing: bubbles, pinwheels (5 min/day) — oral motor strengthening','Straw drinking: thick smoothies — graded oral proprioception','Sugar-free gum: 10–15 min during homework — regulates oral sensory needs','Vibrating chew tool before meals to desensitise oral cavity','Singing, humming, whistling: oral motor coordination and normalisation']},{name:'Food Introduction (Food Chaining)',steps:['Start with accepted food → find similar food with one difference','Food play: sort, smell, touch new foods WITHOUT pressure to eat (10 min/day)','Involve child in cooking: washing, stirring — increases acceptance','Celebrate any interaction with new food (smelling, licking) as success']}]});

  if(concern('socialEmotional')) prog.push({domain:'Social-Emotional Regulation',icon:'❤️',color:'#F43F5E',bg:'#FFF1F2',evidence:'Kuypers (2011). The Zones of Regulation. Socialthinking Publishing.',activities:[{name:'Emotional Regulation Tools',steps:['Zones of Regulation: teach Green/Blue/Yellow/Red zones — daily check-in','Calm-down corner: bean bag + fidget tools + noise-cancelling headphones','Deep breathing: "Smell the flowers, blow out the candles" — 5 cycles when upset','Emotion journal: draw or write daily emotions (5–10 min after school)','Sensory coping toolkit: chew necklace, stress ball, mini trampoline']},{name:'Social Skills Building',steps:['Role-play social scenarios: greetings, turn-taking, asking for help (10 min/day)','Structured playdate: 30–45 min with 1 peer, familiar activity, gradually increase','Social stories (Carol Gray method): read before challenging social events','Specific praise for positive social moments — builds self-esteem']}]});

  if(concern('attentional')) prog.push({domain:'Attention & Focus',icon:'🧠',color:'#0EA5E9',bg:'#F0F9FF',evidence:'Cooper-Kahn & Dietzel (2008). Late, Lost and Unprepared. Woodbine House.',activities:[{name:'Sensory Diet for Attention',steps:['Work blocks: 10–15 min focused work + 3–5 min movement break','Pre-learning warm-up: 5 min exercise → seated work → 5 min break','Visual timer (Time Timer) on desk: makes time concrete','Reduce visual clutter in workspace: dedicated homework area','Fidget tools while working: stress ball, wobble cushion, chew pencil topper']},{name:'Executive Function Supports',steps:['Visual schedule: picture-based daily routine chart at eye level','Checklists for multi-step tasks (morning routine, homework)','5-minute countdown warnings before ALL transitions','Reward chart: stickers for sustained attention']}]});

  if(concern('conduct')) prog.push({domain:'Behaviour & Conduct',icon:'🎭',color:'#6366F1',bg:'#EEF2FF',evidence:'Kranowitz (2005). The Out-of-Sync Child Has Fun. Perigee Books.',activities:[{name:'Behaviour Regulation',steps:['Keep sensory diary for 1 week: identify triggers and antecedents','Create sensory-safe spaces for regulation breaks at home and school','Positive Behaviour Support: reward expected behaviours immediately','Environmental modifications: reduce sensory overload triggers','Predictable visual schedule: reduces anxiety and outbursts']}]});

  prog.push({domain:'Daily Sensory Diet',icon:'⭐',color:'#7C3AED',bg:'#F3E8FF',evidence:'Wilbarger & Wilbarger (1991). Sensory Defensiveness in Children. Avanti Educational Programs.',activities:[{name:'Morning Wake-Up Routine',steps:['5 min wake-up: star jumps → push-ups → stretches → deep breathing','Firm towel rub after shower (firm circular motions)','Nutritious breakfast with varied textures','Visual schedule review: child marks completed tasks']},{name:'Evening Wind-Down Routine',steps:['Warm bath/shower: 15–20 min — deep pressure from water is regulating','Gentle joint compressions: 3–5 per joint (consult OT for technique)','Quiet reading: dim lighting, 20–30 min before bed','Consistent bedtime same time every night']}]});

  return prog;
}

function genWeeklySchedule(prog){
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const colors=['#4F46E5','#7C3AED','#EC4899','#10B981','#F59E0B','#EF4444','#0EA5E9'];
  const schedule={};
  days.forEach(d=>{schedule[d]=[{icon:'☀️',text:'Morning sensory warm-up (5 min)'},{icon:'🌙',text:'Evening wind-down routine (15 min)'}]});
  const dp=prog.filter(p=>p.domain!=='Daily Sensory Diet');
  if(dp[0]){schedule['Monday'].push({icon:dp[0].icon,text:dp[0].activities[0]?.name+' (15 min)'});schedule['Thursday'].push({icon:dp[0].icon,text:(dp[0].activities[1]||dp[0].activities[0])?.name+' (15 min)'});}
  if(dp[1]){schedule['Tuesday'].push({icon:dp[1].icon,text:dp[1].activities[0]?.name+' (15 min)'});schedule['Friday'].push({icon:dp[1].icon,text:(dp[1].activities[1]||dp[1].activities[0])?.name+' (15 min)'});}
  if(dp[2]) schedule['Wednesday'].push({icon:dp[2].icon,text:dp[2].activities[0]?.name+' (15 min)'});
  if(dp[3]) schedule['Saturday'].push({icon:dp[3].icon,text:dp[3].activities[0]?.name+' (20 min)'});
  schedule['Sunday'].push({icon:'📋',text:'Review week & note progress'});
  schedule['Saturday'].push({icon:'🎮',text:'Free sensory play (30 min)'});
  return{days,colors,schedule};
}

// ── EMAIL BODY BUILDER ──
function buildEmailBody(sub,auth){
  const date=new Date(sub.submittedAt).toLocaleDateString('en-MY');
  const approvedDate=sub.approvedAt?new Date(sub.approvedAt).toLocaleDateString('en-MY'):'N/A';
  const summaryText=(sub.customSummary||sub.clinicalSummary||'').replace(/<[^>]*>/g,'').substring(0,1000);

  // Build score summary text
  let scoreText='SCORE SUMMARY:\n';
  const qNames={seeking:'Seeking/Seeker',avoiding:'Avoiding/Avoider',sensitivity:'Sensitivity/Sensor',registration:'Registration/Bystander'};
  if(sub.report?.qReport){
    for(const[k,v] of Object.entries(sub.report.qReport)){
      scoreText+=`  • ${qNames[k]}: ${v.score}/${v.max} — ${v.classification.label}\n`;
    }
  }

  // Build home programme text (top activities)
  let progText='HOME PROGRAMME HIGHLIGHTS:\n';
  if(sub.homeProgramme&&sub.homeProgramme.length>0){
    sub.homeProgramme.slice(0,4).forEach(domain=>{
      progText+=`\n${domain.icon} ${domain.domain}:\n`;
      if(domain.activities[0]){
        progText+=`  Activity: ${domain.activities[0].name}\n`;
        domain.activities[0].steps.slice(0,3).forEach(step=>{ progText+=`    - ${step}\n`; });
      }
    });
  }

  return `Dear Parent/Guardian of ${sub.childName},

Assalamualaikum / Greetings,

We are pleased to share the results of the Child Sensory Profile 2 (SP-2) assessment for your child, ${sub.childName}, completed on ${date}.

This report has been reviewed and approved by your Occupational Therapist at Unit Terapi Cara Kerja, Hospital Tengku Permaisuri Norashikin Kajang (HTPN) on ${approvedDate}.

═══════════════════════════════════════
CHILD INFORMATION
═══════════════════════════════════════
Name         : ${sub.childName}
Age          : ${sub.childAge} years
Gender       : ${sub.gender}
Date of Assessment : ${date}
Reference No : ${sub.id}

═══════════════════════════════════════
${scoreText}
═══════════════════════════════════════
OT CLINICAL SUMMARY
═══════════════════════════════════════
${summaryText}

═══════════════════════════════════════
${progText}
═══════════════════════════════════════
IMPORTANT NOTES
═══════════════════════════════════════
⚠️  This report does NOT replace face-to-face clinical consultation.
📅  Please attend your scheduled follow-up appointment to discuss these results.
🏠  Begin the home programme activities as discussed with your OT.
📞  Contact us if you have any questions or concerns.

Approved by  : ${auth?.name||sub.approvedBy||'OT HTPN'}
Department   : Unit Terapi Cara Kerja
Hospital     : Hospital Tengku Permaisuri Norashikin Kajang (HTPN)
              Healthcare Intelligence Office HTPN

Thank you for your cooperation in supporting your child's development.

Warm regards,
Occupational Therapy Team
Unit Terapi Cara Kerja, HTPN Kajang`;
}

function showToast(msg,type=''){
  let t=document.getElementById('globalToast');
  if(!t){t=document.createElement('div');t.id='globalToast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg; t.className='toast '+type; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3500);
}

function closeDisclaimer(){
  const o=document.getElementById('disclaimerOverlay');
  if(o){o.style.display='none';o.style.visibility='hidden';o.style.pointerEvents='none';o.style.zIndex='-1';}
}

function showDisclaimer(){
  window.addEventListener('load',()=>{
    const o=document.getElementById('disclaimerOverlay');
    if(o){o.style.display='flex';o.style.visibility='visible';o.style.pointerEvents='all';o.style.zIndex='9999';}
  });
}

initUsers();
showDisclaimer();
