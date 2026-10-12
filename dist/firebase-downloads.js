import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,signInAnonymously,setPersistence,browserLocalPersistence,connectAuthEmulator} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getDatabase,ref,get,update,onValue,increment,serverTimestamp,connectDatabaseEmulator} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js';

const app=initializeApp({
 apiKey:'AIzaSyD2idY4COqkNMowGTZwLDRko5rmzcIk7iw',
 appId:'1:151762256510:web:1987de6f5cfe73e3a68e2f',
 messagingSenderId:'151762256510',
 projectId:'raxaul-minute-grocery',
 authDomain:'raxaul-minute-grocery.firebaseapp.com',
 storageBucket:'raxaul-minute-grocery.firebasestorage.app',
 databaseURL:'https://raxaul-minute-grocery-default-rtdb.asia-southeast1.firebasedatabase.app/'
},'copystar-downloads');
const auth=getAuth(app),db=getDatabase(app);
// Opt-in local testing only: open localhost:5050/?firebaseEmulators=1.
if(['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('firebaseEmulators')){
 connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
 connectDatabaseEmulator(db,'127.0.0.1',9000);
}
let signingIn;
async function user(){
 if(!signingIn)signingIn=(async()=>{await setPersistence(auth,browserLocalPersistence);await auth.authStateReady();return auth.currentUser||(await signInAnonymously(auth)).user;})().catch(e=>{signingIn=null;throw e;});
 return signingIn;
}
export function watchDownloadCount(callback,onError){
 return onValue(ref(db,'software_downloads'),snap=>{
  const value=snap.val();if(value===null)callback(0);else if(Number.isSafeInteger(value)&&value>=0)callback(value);else onError(new Error('Invalid counter.'));
 },onError);
}
export async function recordDownload({brand,email,requestId}){
 if(brand!=='xerox')throw new Error('Software is not available yet.');
 email=String(email||'').trim().toLowerCase();
 if(email.length>254||! /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))throw new Error('Please enter a valid email address.');
 if(! /^[0-9a-f-]{36}$/i.test(requestId))throw new Error('Please refresh the page and try again.');
 try{
  const account=await user(),uid=account.uid,path=`software_emails/${uid}/${requestId}`;
  const previous=await get(ref(db,path));
  if(previous.exists()){
   if(previous.val().email!==email)throw new Error('Please refresh the page and try again.');
   return {url:'/downloads/xerox-software.zip',count:(await get(ref(db,'software_downloads'))).val()};
  }
  const limit=await get(ref(db,`software_download_limits/${uid}`));
  if(limit.exists()&&Date.now()-limit.val()<60000)throw new Error('Please wait one minute before downloading again.');
  const changes={};
  changes[path]={email,brand:'xerox',createdAt:serverTimestamp()};
  changes.software_downloads=increment(1);
  changes.software_download_meta={uid,requestId,createdAt:serverTimestamp()};
  changes[`software_download_limits/${uid}`]=serverTimestamp();
  // One atomic write: email, count and retry/cooldown metadata all succeed or fail.
  await update(ref(db),changes);
  // Counter refresh must not turn a successfully saved request into a failed download.
  let count;try{count=(await get(ref(db,'software_downloads'))).val();}catch{}
  return {url:'/downloads/xerox-software.zip',count};
 }catch(e){
  if(e.code==='auth/operation-not-allowed')throw new Error('Downloads are not ready yet. Please contact COPYSTAR.');
  if(e.code==='PERMISSION_DENIED'||e.code==='permission-denied')throw new Error('Unable to save your request. Please wait a minute and try again, or contact COPYSTAR.');
  if(e.code)throw new Error('Unable to connect to the download service. Please try again.');
  throw e;
 }
}
