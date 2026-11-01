#!/usr/bin/env python3
"""Small original vector covers for the game shelf. No external asset requests."""
import json
from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parents[1]
INK='#252847'
PALETTES={'reading':('#eee5ff','#7950db','#c9afff'),'maths':('#e4edff','#4369df','#a8c1ff'),'grammar':('#fff0bd','#dc9724','#ffd76c'),'speaking':('#ffdfd5','#d65b55','#ffad9a'),'puzzles':('#d9f0f2','#268c9b','#99d8df'),'seasonal':('#e7e5ff','#7967d7','#bbb2f4')}
def rect(x,y,w,h,fill,r=12,stroke='none',sw=2):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def circle(x,y,r,fill,stroke='none',sw=2):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def text(x,y,s,size=44,color=INK,weight=800,anchor='middle'):return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Arial, sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(s)}</text>'
def path(d,fill='none',stroke=INK,sw=5):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
def group(s,x=0,y=0,rotate=0):return f'<g transform="translate({x} {y}) rotate({rotate})">{s}</g>'
def card(label,x,y,fill='#fff9e9',angle=0,size=72):
 return group(rect(-59,-57,118,120,'#25284718',16)+rect(-64,-64,118,120,fill,16,INK,3)+text(-5,17,label,size),x,y,angle)
def ribbon(label,x=300,y=286,w=270):return rect(x-w/2,y-24,w,45,'#fffdf4',22)+text(x,y+4,label,20)
def basic_frame(content,bg,accent):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><rect width="600" height="360" fill="{bg}"/>'+circle(590,5,140,accent+'20')+circle(18,352,120,accent+'18')+path('M40 60h20m-10-10v20 M537 274h22m-11-11v22',stroke=accent,sw=3)+content+'</svg>'
def cover(g):
 id=g['id']; bg,accent,soft=PALETTES[g['category']]
 s=''
 if id=='place-value-chart':
  s=group(rect(78,43,450,254,'#25284718',20)+rect(70,35,450,254,'#fffdf2',20,INK,3),0,0,-2)
  for i,(label,n,col) in enumerate([('H',2,'#d98762'),('T',4,'#7aa997'),('O',6,'#bd9fcf')]):
   x=130+i*145;s+=text(x,88,label,24)+path(f'M{x-57} 106h114',stroke='#d4dbcf',sw=2)
   for k in range(n):s+=circle(x-22+(k%2)*44,139+(k//2)*43,16,col)+circle(x-27+(k%2)*44,134+(k//2)*43,4,'#ffffff80')
  s+=ribbon('BUILD A NUMBER',y=325,w=256)
 elif id=='odometer':
  s=rect(82,76,446,204,INK,27)+rect(104,94,398,164,'#10261e',15)
  for i,n in enumerate('089'):
   x=121+i*128;s+=rect(x,108,105,137,'#fcf6df',10)+text(x+52,211,n,104)+path(f'M{x} 173h105',stroke='#d1cbb8',sw=2)+rect(x-3,163,7,20,'#778477',3)+rect(x+101,163,7,20,'#778477',3)
  s+=ribbon('ONE MORE…',y=318,w=190)
 elif id in ['block-maths','emerald-shop']:
  for x,y in [(200,190),(300,220),(400,180),(300,120)]:
   s+=path(f'M{x} {y}l65-35 65 35-65 35Z','#7fa987','none')+path(f'M{x} {y}v66l65 35v-66Z','#4f7d69','none')+path(f'M{x+65} {y+35}l65-35v66l-65 35Z','#315846','none')
  s+=card('+' if id=='block-maths' else '◆',183,110,'#f6d892',-9,68)+ribbon('ADD + SUBTRACT' if id=='block-maths' else 'THE EMERALD SHOP',y=326,w=280)
 elif id=='shape-play':
  s+=circle(228,162,91,'#e6b161',INK,4)+group(rect(-77,-77,154,154,'#8eae9a',21,INK,4),370,195,14)+path('M136 277 215 135 294 277Z','#e18b70',INK,4)
  s+=circle(437,72,14,'#8eae9a')+ribbon('A WORLD OF SHAPES',y=324,w=292)
 elif id in ['number-pop','number-explorer','math-master','intruder-hunt']:
  if id=='number-pop':
   for x,y,r,n,col in [(185,126,64,'2','#edc175'),(319,192,80,'7','#aac5ae'),(439,100,54,'5','#c9b8db'),(153,276,42,'9','#e2a288')]:s+=circle(x+4,y+8,r,'#25284718')+circle(x,y,r,col,INK,3)+circle(x-r/3,y-r/3,9,'#ffffff90')+text(x,y+20,n,56)
  elif id=='number-explorer':
   for x,y,col in [(185,193,'#93bba8'),(292,150,'#7e9eae'),(401,207,'#c4a7d4')]:s+=path(f'M{x} {y-95}l50 55-18 92-64 0-18-92Z',col,INK,3)+path(f'M{x} {y-95}v147m-50-92h100',stroke=INK,sw=2)
   s+=ribbon('CRYSTAL EXPEDITION',y=325,w=286)
  else:
   s+=group(rect(-159,-102,318,206,'#fff9e9',22,INK,4)+text(0,-15,'7 × 8' if id=='math-master' else '52 − 7',61)+path('M-120 15h240',stroke='#d9d9c6',sw=2)+text(0,79,'56' if id=='math-master' else '?',65,accent),300,174,-5)
   s+=circle(481,258,33,accent)+text(481,270,'✓' if id=='math-master' else '!',35,'#fffdf5')
 elif id=='dino-number-squad':
  s+=path('M185 249c-50-30-61-85-30-105 27-17 54 22 49 44l50-4c15-59 6-130 50-138 45-9 74 28 55 62-14 20-30 9-35 25l10 72c38 5 69-9 87-35 14 40 4 74-35 91l-8 35h-34l-6-35h-95l-7 35h-36Z','#81aa87',INK,4)+circle(326,78,6,INK)+path('M348 89l15 1',stroke=INK,sw=3)+circle(273,229,13,'#b4d0a6')+circle(310,220,10,'#b4d0a6')+text(454,100,'1 2 3',32,accent)
 elif id in ['letter-tracer','word-race','this-or-is']:
  letters={'letter-tracer':['a','b','c'],'word-race':['c','a','t'],'this-or-is':['this','or','is']}[id]
  for i,a in enumerate(letters):s+=card(a,170+130*i,165+([15,-10,20][i]),['#e9bf77','#b4cdb2','#c2aad4'][i],[-9,5,-4][i],37 if len(a)>1 else 72)
  s+=ribbon({'letter-tracer':'MAKE YOUR MARK','word-race':'READY, SET, READ!','this-or-is':'LOOK A LITTLE CLOSER'}[id],y=307,w=295)
 elif id=='secret-character':
  for x,ang,col in [(219,-9,'#ddb19d'),(389,9,'#9ab9a2')]:
   inner=rect(-83,-112,166,230,'#fff9e9',15,INK,4)+circle(0,-28,42,col,INK,3)+path('M-58 77c0-64 116-64 116 0Z',col,INK,3)+text(0,3,'?',62)
   s+=group(inner,x,174,ang)
  s+=ribbon('WHO COULD IT BE?',y=325,w=266)
 elif id in ['99-nights-beginner','99-nights-a1','dark-forest']:
  bg='#294a40';accent='#a7c5a7';s+=circle(469,78,36,'#f6e8b9')
  for x,y,h in [(78,260,175),(179,238,202),(447,275,155),(530,281,209),(354,232,170)]:
   s+=path(f'M{x} {y-h}l-58 {h}h116Z','#426957','none')+path(f'M{x} {y-h}v{h}',stroke='#64866a',sw=3)
  s+=path('M185 301 285 145 410 301Z','#dca56d','#e8c188',3)+path('M185 301 285 145 300 301Z','#f2ce87','none')+path('M251 301 285 224 300 301Z','#284037','none')+text(96,89,'99' if id.startswith('99') else '?',76,'#f6e8b9')
  if id.startswith('99'):s+=ribbon('BEGINNER' if id.endswith('beginner') else 'LEVEL A1',x=455,y=321,w=172)
 elif id=='space-lotto':
  bg='#243f59';accent='#9dbed1';s+=circle(147,108,47,'#dbb579')+path('M85 131q82-4 131-49',stroke='#f2d69a',sw=11)
  s+=group(path('M0-111C-65-69-61 24-33 64H33C61 24 65-69 0-111Z','#f6f1da',INK,4)+path('M-35 9-67 55-64 93-28 62M35 9 67 55 64 93 28 62','#dd946c',INK,3)+circle(0,-18,28,'#8cb6c4',INK,4)+path('M-20 69 0 118 20 69','#efc764',INK,3),365,180,26)
  for x,y in [(60,230),(242,52),(480,87),(526,278),(218,276)]:s+=circle(x,y,3,'#f9edca')
 elif id=='town-trips':
  s+=rect(140,110,330,161,'#e5b85e',25,INK,4)+rect(164,133,68,67,'#dcebf0',9,INK,3)+rect(244,133,68,67,'#dcebf0',9,INK,3)+rect(324,133,63,67,'#dcebf0',9,INK,3)+rect(402,133,46,109,'#c6dee1',9,INK,3)
  for x in [208,401]:s+=circle(x,271,31,INK)+circle(x,271,14,'#c4d3c7')
  s+=path('M80 307h444',stroke=accent,sw=4)+ribbon('NEXT STOP: ADVENTURE',y=59,w=310)
 elif id=='timmys-bag':
  s+=path('M233 135V95a67 67 0 0 1 134 0v40',stroke=INK,sw=20)+rect(190,126,220,160,'#ddb46d',23,INK,4)+rect(214,169,172,72,'#fff8df',10,INK,3)
  for i,n in enumerate('315'):s+=text(242+i*57,218,n,48)
  s+=ribbon('CRACK THE CODE',y=324,w=260)
 elif id=='christmas-quest':
  s+=path('M300 37 185 179h48l-76 101h286l-76-101h48Z','#4f8067',INK,4)+rect(283,280,34,42,'#b27959',3)+path('M300 22 307 39 325 40 311 52 315 70 300 61 285 70 289 52 275 40 293 39Z','#efcb6a',INK,2)
  for x,y,col in [(278,121,'#efce77'),(330,169,'#e8a58c'),(251,221,'#b6cce6'),(360,247,'#efce77')]:s+=circle(x,y,12,col)
 elif id=='shader-wallpapers':
  s='<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#2d5d78"/><stop offset=".5" stop-color="#8585b5"/><stop offset="1" stop-color="#e6b4aa"/></linearGradient></defs><rect width="600" height="360" fill="url(#g)"/>'
  for i in range(11):s+=path(f'M-40 {70+i*23}Q150 {280+i*8} 280 {130+i*18}T650 {160+i*16}',stroke='#fff5e87a',sw=3)
 else:
  words={'word-jobs':['on','under','beside'],'apostrophes-quiz':["isn’t","Tom’s","it’s"],'verb-master':['go','went','gone'],'requests-and-get':['could','get','please'],'is-or-are':['is','or','are'],'goose-packs-a-bag':['hasn’t','got','a bag'],'gem-slots':['he','she','they'],'has-or-have':['has','or','have'],'he-she-or-they':['he','she','they'],'give-and-put':['give','&','put']}.get(id,['think','play','learn'])
  for i,w in enumerate(words):
   s+=group(rect(-142,-34,284,76,'#25284718',12)+rect(-148,-40,284,76,['#fff9e9',soft,'#fff9e9'][i],12,INK,3)+text(-6,10,w,43),300+[ -28,32,-6][i],83+i*93,[-7,5,-3][i])
 return basic_frame(s,bg,accent)
if __name__=='__main__':
 c=json.loads((ROOT/'catalog.json').read_text())
 for g in c['games']:
  ext='png' if g['id']=='reading-tower' else 'jpg' if g['id']=='monster-bakery' else 'svg'
  g['cover']=f'console-assets/covers/{g["id"]}.{ext}'
  if ext=='svg':(ROOT/g['cover']).write_text(cover(g))
 (ROOT/'catalog.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
 print('Cover library ready.')
