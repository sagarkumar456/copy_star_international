// Populate price (numeric, NPR), stock and exact model compatibility from your inventory.
// Until verified, the public UI explicitly offers a quote and stock confirmation.
const item=(id,name,category,brand,image,description,details)=>({id,name,category,brand,image,description,details,price:null,stock:'confirm',illustrative:true});
export const products=[
 item('xerox-office-copier','Xerox office copier','Machines','Xerox','copier.svg','Find a Xerox copier that fits your office workflow.',[['Selection','Model selected after consultation'],['Configuration','Confirm print, scan and copy requirements'],['Installation','Ask about setup and service options']]),
 item('canon-office-copier','Canon multifunction copier','Machines','Canon','copier-canon.svg','Explore Canon machine options for your workspace.',[['Selection','Model selected after consultation'],['Configuration','Confirm paper sizes and required functions'],['Installation','Ask about setup and maintenance']]),
 item('xerox-black-toner','Black toner for Xerox','Toner cartridges','Xerox','toner.svg','Request the correct black toner for your Xerox machine.',[['Compatibility','Exact model and cartridge code required'],['Supply','Confirm genuine or compatible options'],['Yield','Varies by cartridge; quote will specify']]),
 item('canon-black-toner','Black toner for Canon','Toner cartridges','Canon','toner.svg','Match a replacement black toner to your Canon printer.',[['Compatibility','Exact model and cartridge code required'],['Supply','Confirm genuine or compatible options'],['Yield','Varies by cartridge; quote will specify']]),
 item('colour-toner','CMYK toner selection','Toner cartridges','Multi-brand','colour-toner.svg','Cyan, magenta, yellow and black options, matched to your model.',[['Colours','Cyan, magenta, yellow, black'],['Selection','Individual cartridges or a matched set'],['Compatibility','Share the machine model and cartridge codes']]),
 item('drive-gear','Copier drive gear','Gears','Multi-brand','gear.svg','Replacement drive gears for supported copier mechanisms.',[['Fit','Part number, dimensions and tooth count required'],['Material','Confirmed against the replacement part'],['Compatibility','Model-specific; verification required']]),
 item('fuser-gear','Fuser drive gear','Gears','Multi-brand','gear.svg','Find a suitable replacement for a worn fuser drive gear.',[['Fit','Share the gear code or a clear reference photo'],['Location','Fuser drive assembly'],['Compatibility','Exact machine model required']]),
 item('fuser-roller','Upper fuser roller','Spare parts','Multi-brand','roller.svg','Replacement roller enquiries for your copier fuser assembly.',[['Location','Fuser assembly'],['Selection','Part number and machine model required'],['Installation','Ask about fitting and servicing']]),
 item('pressure-roller','Lower pressure roller','Spare parts','Multi-brand','roller.svg','Request a pressure roller matched to the fuser assembly.',[['Location','Lower fuser assembly'],['Fit','Confirm length, diameter and part code'],['Installation','Service support available on enquiry']]),
 item('feed-roller','Paper feed roller set','Spare parts','Multi-brand','feed.svg','Explore replacement rollers for paper pickup and feeding.',[['Location','Paper pickup and feed path'],['Selection','Kit contents confirmed with quote'],['Compatibility','Share the machine model and symptoms']]),
 item('drum-unit','Imaging drum unit','Spare parts','Multi-brand','drum.svg','Find an imaging drum replacement for your printing system.',[['Location','Imaging assembly'],['Selection','Drum or complete unit, subject to model'],['Compatibility','Exact model and part code required']]),
 item('cartridge-chip','Cartridge chip','Spare parts','Multi-brand','chip.svg','Model-specific chip enquiries for toner cartridges.',[['Fit','Cartridge code and machine model required'],['Version','Firmware compatibility must be confirmed'],['Supply','Availability confirmed on enquiry']])
];
export const categories=['All products','Machines','Toner cartridges','Spare parts','Gears'];
export function selectProducts({query='',category='All products',brand='All brands',availability='all',sort='featured'}={}){
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 let result=products.filter(p=>(category==='All products'||p.category===category)&&
 (brand==='All brands'||p.brand===brand)&&
 (availability==='all'||p.stock===availability)&&
 terms.every(term=>`${p.name} ${p.category} ${p.brand} ${p.description} ${p.details.flat().join(' ')}`.toLowerCase().includes(term)));
 if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name));
 if(sort==='price')result.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
 return result;
}
export const priceLabel=p=>p.price==null?'Price on request':new Intl.NumberFormat('en-NP',{style:'currency',currency:'NPR',maximumFractionDigits:0}).format(p.price);
export const stockLabel=p=>({confirm:'Confirm availability',in_stock:'In stock',order:'Available to order',out_of_stock:'Out of stock'}[p.stock]??'Confirm availability');
export function makeRequest(data,product){
 return [data.kind==='service'?'COPYSTAR — SERVICE REQUEST':data.kind==='bulk'?'COPYSTAR — ORDER QUOTE REQUEST':'COPYSTAR — PRODUCT ENQUIRY',
 data.kind==='bulk'?`Order category: ${data.orderCategory}`:null,
 data.company?`Company / shop: ${data.company}`:null,
 data.delivery?`Delivery city / area: ${data.delivery}`:null,
 product?`Product: ${product.name} (${product.id})`:null,
 `Name: ${data.name}`,`Phone: ${data.phone}`,data.email?`Email: ${data.email}`:null,
 data.kind==='service'?`Service: ${data.service}`:null,
 `Machine / model: ${data.model||'To be confirmed'}`,
 data.kind==='service'?`Location: ${data.location}`:`Quantity: ${data.quantity}`,
 data.date?`Preferred date: ${data.date} (subject to confirmation)`:null,
 `Details: ${data.message||'Please contact me to discuss.'}`,
 'Please confirm pricing, availability and next steps. This is a request, not a confirmed order or appointment.'
 ].filter(Boolean).join('\n');
}
