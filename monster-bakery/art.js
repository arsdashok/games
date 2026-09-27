(function(){
const wrap=(body,view='0 0 180 160')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" aria-hidden="true"><g stroke="#343944" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const faces='<circle cx="69" cy="84" r="3" fill="#343944"/><circle cx="105" cy="84" r="3" fill="#343944"/>';
const art={
cat:wrap(`<path d="M40 75L33 25 73 48Q90 42 111 49L145 25 141 81Q148 132 91 141 34 137 40 75" fill="#F6BC75"/>${faces}<path d="M82 99h14l-7 8z" fill="#e48189"/><path d="M60 102l-36-7m36 18l-33 6m91-17l35-9m-35 20l33 8" fill="none"/>`),
dog:wrap(`<path d="M49 55Q88 24 130 58L132 115Q91 154 50 115Z" fill="#D7A275"/><path d="M48 47Q12 38 22 107L48 87m82-40q38-7 28 61l-28-21" fill="#906442"/>${faces}<ellipse cx="87" cy="106" rx="10" ry="7" fill="#343944"/><path d="M81 119v12q10 13 19 0v-12" fill="#EF8397"/>`),
sun:wrap(`<g stroke="#EFAB41" stroke-width="7"><path d="M90 9v17m0 108v17M20 80H5m170 0h-16M35 25l13 13m84 84l13 13M35 135l13-13m84-84l13-13"/></g><circle cx="90" cy="80" r="44" fill="#FFD55D"/>`),
cup:wrap(`<path d="M123 57h13q42 5 12 40l-21 3" fill="none" stroke="#578DDB" stroke-width="13"/><path d="M39 47h87v59q-3 29-43 29-41 0-44-29Z" fill="#8FC9F1"/><ellipse cx="82" cy="47" rx="44" ry="11" fill="#F2F7FA"/><path d="M59 150h65" fill="none"/>`),
hat:wrap(`<ellipse cx="90" cy="123" rx="72" ry="18" fill="#EDA97C"/><path d="M46 115l10-75q34-23 68 0l10 75" fill="#F7BD8B"/><path d="M47 98q43 10 85 0v17q-43 13-86 0z" fill="#7164BA"/>`),
pig:wrap(`<path d="M41 57L34 21l40 20m36 0l36-20-5 43" fill="#EA92A6"/><ellipse cx="90" cy="84" rx="57" ry="57" fill="#F5B8C6"/>${faces}<ellipse cx="88" cy="111" rx="24" ry="17" fill="#EA92A6"/><circle cx="79" cy="111" r="3"/><circle cx="97" cy="111" r="3"/>`),
duck:wrap(`<path d="M35 97q21-9 48-2V65q-6-45 36-39 33 8 17 43l-12 17q13 46-43 52-52 4-57-48z" fill="#FFDB62"/><path d="M136 51h30l-21 19h-17" fill="#ED9655"/><circle cx="117" cy="48" r="4" fill="#343944"/><path d="M59 105q17 21 43 0" fill="none"/>`),
sock:wrap(`<path d="M75 21h53v80q0 24-28 37l-40 13q-26 4-32-16-4-17 14-27l34-17z" fill="#C0B4EA"/><path d="M75 21h53v25H75zm23 113q-18-2-20-23m-37 0q19 5 23 32" fill="#F6D877"/>`),
map:wrap(`<path d="M18 40l46-18 49 19 48-17v107l-48 18-49-20-46 17z" fill="#D2EBD7"/><path d="M64 22v107m49-88v108" fill="none"/><path d="M36 101q20-50 55-32t50-13" stroke="#E88B78" stroke-dasharray="6 8" fill="none"/><path d="M130 39l20 21m-20 0l20-21" stroke="#E16F62"/>`),
fish:wrap(`<path d="M119 66l40-28v84l-40-23" fill="#E9A662"/><ellipse cx="78" cy="83" rx="53" ry="39" fill="#F9C579"/><circle cx="49" cy="74" r="5" fill="#343944"/><path d="M78 67q16 14 0 30" fill="none"/>`),
cake:wrap(`<path d="M32 76h117v56q-54 23-117 0z" fill="#DFA784"/><path d="M32 75v24q11 16 22 0 12 23 24 0 13 20 23 0 13 22 25 0 12 16 23 0V75" fill="#F8C1CC"/><ellipse cx="90" cy="75" rx="59" ry="20" fill="#FFE4E7"/><circle cx="89" cy="58" r="11" fill="#ED716A"/><path d="M90 46q5-14 17-13" fill="none"/>`),
jam:wrap(`<rect x="47" y="48" width="87" height="94" rx="16" fill="#D46B87"/><rect x="43" y="30" width="95" height="24" rx="6" fill="#BADEE3"/><rect x="56" y="71" width="68" height="45" rx="8" fill="#FFF0D8"/><path d="M78 82q12-12 23 0 13 14-11 25-25-11-12-25" fill="#E26F72"/>`),
egg:wrap(`<path d="M43 99Q44 41 88 18q46 20 50 81 0 47-48 47-49 0-47-47" fill="#FFF3D8"/>`),
milk:wrap(`<path d="M54 48l18-26h40l20 26v96H54z" fill="#F4FBF7"/><path d="M54 48h78v37H54z" fill="#B5DAED"/><path d="M72 22v26m40-26v26" fill="none"/><path d="M89 99q-23 28 0 29 22-2 0-29" fill="#93C8E7"/>`),
flour:wrap(`<path d="M51 21h78l-4 32q18 47 15 91H39q-2-46 17-91z" fill="#ECD5A5"/><path d="M53 41h73M88 71v48m0-35l-13-9m13 24l15-10m-15 25l-15-9" fill="none"/>`),
butter:wrap(`<path d="M27 88l40-30h67l23 21v48H28z" fill="#FAD970"/><path d="M27 88h86l44-9M113 88v39" fill="none"/><path d="M19 132h144" fill="none"/>`),
sugar:wrap(`<path d="M37 102l18-55h75l19 55v39H37z" fill="#F7E6DE"/><path d="M56 47h74V26H56z" fill="#EDBAC3"/><path d="M69 87l20-12 23 12v26l-23 12-20-12z" fill="#fff"/><path d="M69 87l20 12 23-12m-23 12v26" fill="none"/>`),
berry:wrap(`<path d="M43 60q45-28 90 0 11 43-45 88-53-48-45-88" fill="#EF8392"/><path d="M88 20l7 27 24-17-11 27 25 2-38 12-41-14 24-5-7-21 19 16z" fill="#80B8A0"/><path d="M66 81v5m44-2v5m-25 8v5m-8 14v5m29-11v5" stroke="#FFF5D7"/>`),
chocolate:wrap(`<rect x="37" y="25" width="102" height="119" rx="8" fill="#A6775E"/><path d="M71 25v119m34-119v119M37 65h102M37 105h102" fill="none" stroke="#734D3D"/>`),
car:wrap(`<path d="M25 82h21l19-39h54l20 39h18v41H25z" fill="#92BFCF"/><path d="M63 79l13-23h32l13 23z" fill="#F6EDDA"/><circle cx="52" cy="127" r="15" fill="#4D5265"/><circle cx="132" cy="127" r="15" fill="#4D5265"/>`),
boot:wrap(`<path d="M45 23h68v74l33 9q24 12 13 34H37V94z" fill="#84BCA8"/><path d="M36 132h126v15H36z" fill="#50635D"/><path d="M46 47h65" fill="none"/>`),
button:wrap(`<circle cx="90" cy="80" r="55" fill="#AEA1D7"/><circle cx="90" cy="80" r="40" fill="none" stroke="#8976B5"/><circle cx="77" cy="67" r="7" fill="#FFF4E2"/><circle cx="103" cy="67" r="7" fill="#FFF4E2"/><circle cx="77" cy="94" r="7" fill="#FFF4E2"/><circle cx="103" cy="94" r="7" fill="#FFF4E2"/>`)
};
window.BakeryArt=art;
})();
