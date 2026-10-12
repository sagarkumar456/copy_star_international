export const emailConfig=Object.freeze({serviceId:'service_y64js2r',templateId:'template_fjzrtba',publicKey:'5pLP9u1jZ7zWZG3zC'});

export async function sendEnquiry(data,message,fetcher=fetch){
 const name=String(data.name||'').trim(),email=String(data.email||'').trim();
 if(!name||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Please enter your name and a valid email address.');
 let response;
 try{
  response=await fetcher('https://api.emailjs.com/api/v1.0/email/send',{
   method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),
   body:JSON.stringify({service_id:emailConfig.serviceId,template_id:emailConfig.templateId,user_id:emailConfig.publicKey,
    template_params:{from_name:name,from_email:email,phone_number:String(data.phone||''),message}})
  });
 }catch{throw new Error('We could not confirm delivery. Please check your connection before trying again.');}
 if(response.status===429)throw new Error('The email service is busy. Please try again later.');
 if(response.status!==200)throw new Error('The email service could not accept your message.');
 return true;
}
