import hashlib
import json
import re
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "clothes"
OUTPUT = Path("/tmp/lynmarie-clothing-catalog.json")

# The 2025 camera roll is numbered in capture order. Each range is one look;
# the images in its range are alternate views of that product.
LOOKS = [
 (1,4,"Printed Scarf Wrap","Hats & Accessories","Blue and multicolour","Lightweight printed scarf with a vivid mix of blue, coral, green and yellow. Style it as a head wrap or draped accessory.",3900),
 (5,11,"Soft Grey Flower Hat","Hats & Accessories","Grey","Soft grey statement hat with a sculpted floral accent and a rounded crown. A distinctive finishing piece for an event outfit.",4500),
 (12,24,"Blue Wide-Brim Sun Hat","Hats & Accessories","Navy blue","Wide-brim navy sun hat with a textured finish and contrast pale trim. Its broad brim adds coverage and a polished resort feel.",4200),
 (25,28,"Red-Brim Statement Hat","Hats & Accessories","Red and navy","Structured navy hat with a bold red brim and matching accent. A striking accessory for outdoor events and dressed-up daytime looks.",4300),
 (29,36,"Abstract Print Longline Set","Two-Piece Sets","Black, white and multicolour","A flowing longline layer over a matching printed base, with an expressive black, cream and jewel-tone pattern. The relaxed silhouette makes a strong occasion or holiday look.",8900),
 (37,50,"Leopard Print Sleeveless Top","Tops & Blouses","Brown and black","Sleeveless blouse in a high-contrast leopard print, styled with dark slim trousers. The rounded neckline and all-over animal pattern make it an easy statement top.",5200),
 (51,62,"Burgundy Ruffle Wrap Dress","Dresses","Burgundy","A rich burgundy wrap-style dress with a defined waist and a softly flounced hem. The V-shaped front and three-quarter sleeves give this knee-length silhouette an occasion-ready finish.",7900),
 (63,68,"Teal Botanical Print Blouse","Tops & Blouses","Teal and green","Sleeveless teal blouse with a vivid botanical print and a softly shaped hem. Pair the saturated green-blue palette with tailored black trousers or a simple skirt.",4900),
 (69,73,"White Floral Hair Fascinator","Hats & Accessories","White","A sculptural white fabric flower accessory with layered petals. A bridal and occasion finishing piece for a fascinator, hat or hair clip.",3200),
 (74,77,"Emerald Structured Handbag","Bags","Emerald green","Compact emerald handbag with a structured body, top handles and polished metal detailing. The bright green finish adds colour to both everyday and occasion outfits.",5900),
 (78,80,"Leopard Print Mini Bag","Bags","Brown and black","Small leopard-print bag with a compact shape and dark trim. Its neutral animal pattern works as a statement accent with simple outfits.",3900),
 (81,82,"White Multi-Strap Sandals","Shoes","White","White open-toe sandals with a wide multi-strap upper, flat sole and adjustable ankle fastening. The clean white finish pairs easily with summer dresses and casual outfits.",4900),
 (83,90,"Cobalt Floral Two-Piece Set","Two-Piece Sets","Cobalt blue","Matching cobalt-blue separates with an all-over floral motif and a coordinated relaxed fit. Wear the top and bottoms together for a complete look or style each piece separately.",8900),
 (91,92,"Teal Floral Skirt Set","Two-Piece Sets","Teal and cream","A coordinated teal top and flowing floral skirt with a feminine, softly structured silhouette. The contrast between the solid upper piece and patterned skirt makes the set easy to accessorise.",9900),
 (93,93,"Love Graphic Sweatshirt","Tops & Blouses","Charcoal grey","Casual charcoal sweatshirt with a bold front graphic and an easy relaxed shape. A comfortable layer for everyday styling.",4500),
 (94,98,"Bride To Be Keepsake Set","Bridal & Occasion","White","A white bridal keepsake set with raised floral detailing and a celebratory bride-to-be motif. A thoughtful accessory for wedding preparations and bridal gifting.",3500),
 (99,104,"Quilted Neutral Crossbody Bag","Bags","Cream and taupe","Compact quilted crossbody bag in a soft cream-and-taupe palette, finished with a slim strap and gold-tone hardware. A versatile small bag for daytime events.",5900),
 (105,108,"Yellow Floral Maxi Dress","Dresses","Yellow and white","Sleeveless maxi dress with a light yellow-and-white floral print and a softly defined waist. The long, flowing skirt gives this bright warm-weather style an elegant finish.",8900),
 (109,119,"Ivory Lace Occasion Dress","Bridal & Occasion","Ivory","An elegant ivory occasion dress with delicate lace detailing and a clean, elongated silhouette. The light neutral colour and refined finish suit weddings, formal celebrations and special events.",13900),
 (120,123,"Taupe Mini Shoulder Bag","Bags","Taupe and cream","Small structured shoulder bag in a neutral taupe-and-cream finish, with a compact flap silhouette and decorative hardware. A polished choice for carrying the essentials.",5200),
 (124,128,"Pink and Gold Girls’ Sandals","Shoes","Pink and gold","Children’s open-toe sandals with pink, cream and gold accents and secure multi-strap styling. A dressed-up shoe for parties and family occasions.",3900),
 (129,131,"Pastel Kids’ Trainers","Shoes","White and pastel","Light-coloured children’s trainers with pastel accents and a cushioned casual profile. An easy everyday option for little ones.",4200),
 (132,132,"Red and Black Pointed Heels","Shoes","Red and black","Pointed slingback heels in a dramatic red-and-black colour combination. The sleek shape brings a sharp accent to evening and occasion outfits.",6900),
 (133,133,"Lavender Tulle Party Dress","Kidswear","Lavender","A little girl’s lavender party dress with layered tulle, a full skirt and a decorative bodice. A pretty choice for birthdays, weddings and celebrations.",6900),
 (134,136,"Blush Floral Girls’ Dress","Kidswear","Blush pink and floral","A light girls’ occasion dress with a soft blush base and a colourful floral print. The airy, flowing shape is made for celebrations and warm-weather events.",6200),
 (137,140,"Purple Ruched Maxi Dress","Dresses","Purple","A rich purple fitted maxi dress with gathered ruching through the body and a long, clean skirt. The streamlined silhouette works for evening events and dressy occasions.",9900),
 (141,141,"Pink Floral Maxi Dress","Dresses","Pink and multicolour","A flowing pink floral maxi with a soft drape and a romantic all-over garden print. Its long length and vivid pattern make it an easy choice for daytime celebrations.",9900),
 (142,142,"Mint Floral Fitted Dress","Dresses","Mint green","A fitted mint-green dress with a delicate floral pattern and a softly shaped waist. The fresh pastel palette is well suited to daytime events and smart casual wear.",8900),
 (143,143,"Pink Floral Maxi Dress","Dresses","Pink and multicolour","A flowing pink floral maxi with a soft drape and a romantic all-over garden print. Its long length and vivid pattern make it an easy choice for daytime celebrations.",9900),
 (144,144,"Mint Floral Fitted Dress","Dresses","Mint green","A fitted mint-green dress with a delicate floral pattern and a softly shaped waist. The fresh pastel palette is well suited to daytime events and smart casual wear.",8900),
 (145,145,"Navy Blazer and White Trousers","Suits & Co-ords","Navy and white","A polished navy blazer paired with crisp white trousers. The clean two-colour combination creates a versatile smart-casual suit for work and daytime occasions.",11900),
 (146,148,"Navy Floral Matching Set","Two-Piece Sets","Navy and white","A coordinated navy set with a bold white floral print and a softly tailored shape. The matching pieces create an effortless dressed-up look.",9900),
 (149,149,"Blush Draped Corset Top","Tops & Blouses","Blush pink","A softly draped blush top with a sculpted, corset-inspired bodice and a feminine neckline. Style it with tailored trousers or a high-waisted skirt.",5900),
 (150,154,"Navy Tailored Trouser Suit","Suits & Co-ords","Navy","A coordinated navy trouser suit with a defined blazer and straight-leg trousers. Its classic dark colour and clean tailoring make it suitable for work, meetings and formal events.",13900),
 (155,157,"Mauve Satin Midi Dress","Dresses","Mauve","A fluid mauve satin midi dress with a softly gathered waist and a graceful A-line skirt. The subtle sheen gives this understated style an elegant occasion finish.",10900),
 (158,164,"Powder Blue Wide-Leg Set","Two-Piece Sets","Powder blue","A relaxed powder-blue two-piece with a flowing top and wide-leg trousers. The soft monochrome palette and easy drape make this set comfortable yet refined.",11900),
 (165,168,"Blue Blazer and White Trouser Set","Suits & Co-ords","Blue and white","A bright blue blazer with crisp white trousers for a fresh, tailored contrast. The coordinated pieces can be worn together or mixed into a workwear wardrobe.",13900),
 (169,171,"Colourful Print Tunic Set","Two-Piece Sets","Pink, yellow and blue","A lively multicolour print outfit with a relaxed tunic silhouette and coordinated lower piece. Bright pink, yellow and blue accents bring a playful statement to the look.",8900),
 (172,182,"Ivory Embroidered Trouser Set","Suits & Co-ords","Ivory","A softly tailored ivory tunic-and-trouser set with delicate embroidery and a long, graceful line. The light neutral shade makes it a versatile choice for formal gatherings and celebrations.",12900),
 (183,186,"Navy Floral Long Dress","Dresses","Navy and white","A full-length navy dress with a striking white floral pattern and a softly shaped silhouette. The dark ground keeps the expressive print polished for daytime and evening occasions.",10900),
 (187,187,"Floral Coordinated Outfit","Two-Piece Sets","Multicolour","A coordinated floral outfit with a vivid all-over print and a relaxed, feminine silhouette. The matching look is easy to style for a weekend event or holiday.",8900),
 (188,191,"Lilac Fit-and-Flare Dress","Dresses","Lilac","A lilac fit-and-flare dress with a defined waist, short sleeves and a softly full skirt. The clean solid colour gives this feminine day-to-evening style a polished finish.",8900),
 (192,193,"Black Lace-Trim Top","Tops & Blouses","Black","A black evening top with a smooth bodice and delicate lace trim at the hem. Pair it with tailored trousers or a pencil skirt for an elegant contrast of texture.",5900),
 (194,200,"Green Patterned Trouser Set","Two-Piece Sets","Green and black","A matching green patterned set with a sleeveless top and coordinated wide-leg trousers. The fine all-over motif creates a streamlined look with comfortable movement.",10900),
 (201,203,"Grey Pleated Occasion Dress","Dresses","Grey","A soft grey occasion dress with a gently pleated skirt and a defined upper silhouette. The muted tone and flowing shape make it a versatile event piece.",8900),
 (204,204,"Yellow and Blue Printed Set","Two-Piece Sets","Yellow and blue","A bright coordinated look pairing a colourful printed top with a strong yellow lower piece. Its high-contrast palette brings a confident pop of colour to casual occasions.",8500),
 (205,214,"Green Botanical Jumpsuit","Jumpsuits","Green and black","A sleeveless wide-leg jumpsuit in a fine green botanical print, shaped at the waist for a flattering line. The one-piece silhouette makes a complete outfit with minimal styling.",10900),
 (215,216,"Black Belted Jumpsuit","Jumpsuits","Black","A sleek black jumpsuit with a defined waist and a clean, elongated leg. Its versatile solid colour makes it easy to dress up with heels or keep simple for daytime.",9900),
 (217,222,"Chocolate Ruched Midi Dress","Dresses","Chocolate brown","A rich brown fitted dress with soft draping and gathered detailing through the waist. The sculpted silhouette and deep neutral colour create a refined evening look.",9900),
 (223,227,"White Blouse and Tailored Trousers","Two-Piece Sets","White","A crisp white top paired with tailored trousers for a light, polished two-piece look. The clean lines make this outfit a versatile base for colourful accessories.",9900),
 (228,233,"Charcoal Longline Layer Set","Two-Piece Sets","Charcoal and grey","A softly layered charcoal outfit with a longline outer piece and matching separates. The tonal grey palette creates an easy, understated look for smart everyday wear.",10900),
 (234,240,"Jade Green Sleeveless Dress","Dresses","Jade green","A vivid jade-green sleeveless dress with a clean fitted shape and knee-length finish. The saturated colour makes a confident statement for work, celebrations and daytime events.",8900),
 (241,248,"Black and White Print Trouser Set","Two-Piece Sets","Black and white","A coordinated black-and-white set with an expressive abstract print and tailored lower piece. The monochrome palette makes this statement outfit easy to accessorise.",10900),
 (249,252,"Olive Floral Blouse","Tops & Blouses","Olive and cream","An olive blouse with a soft cream floral motif and a relaxed, easy-to-style fit. Pair it with dark trousers or a simple skirt to let the print stand out.",5200),
 (253,260,"White Embroidered Tunic Set","Two-Piece Sets","White","A flowing white tunic with matching trousers and fine embroidered detail. The airy silhouette and delicate finish create a graceful outfit for warm-weather events.",11900),
 (261,263,"White Contrast-Trim Suit","Suits & Co-ords","White and black","A white tailored outfit finished with sharp black piping and coordinated trousers. The contrast edging gives this clean two-piece a smart, modern profile.",12900),
 (264,271,"Teal Blue Midi Dress","Dresses","Teal blue","A fitted teal-blue midi dress with a simple sleeveless shape and smooth, body-skimming lines. Its rich colour makes it a versatile choice for daytime and evening plans.",8900),
 (272,272,"Abstract Print Blouse and Trousers","Two-Piece Sets","Multicolour","A colourful abstract-print blouse styled with dark tailored trousers. The vivid pattern adds energy while the simple lower piece keeps the outfit balanced.",8900),
 (273,276,"White Tailored Blazer Set","Suits & Co-ords","White","A crisp white blazer-and-trouser set with clean lapels and a straight tailored line. Wear together for a fresh occasion outfit or style the pieces separately.",13900),
 (277,281,"Charcoal Abstract Print Top","Tops & Blouses","Charcoal and blue","A charcoal top with a softly blended blue-grey abstract print and an easy everyday fit. Pair with dark trousers for a coordinated tonal look.",5200),
 (282,291,"Fuchsia Sleeveless Jumpsuit","Jumpsuits","Fuchsia pink","A bold fuchsia one-piece with a sleeveless upper, defined waist and flowing trousers. The bright solid colour creates a confident outfit for parties and special occasions.",10900),
 (292,294,"White Embellished Jacket","Outerwear","White","A light white jacket with delicate embellishment and a softly tailored shape. Layer it over dresses or coordinated sets to add a refined finishing touch.",8900),
 (295,303,"Beige Textured Coat","Outerwear","Beige","A warm beige textured coat with a softly structured shape and a classic neutral finish. Layer it over workwear or occasion outfits for extra polish.",13900),
 (304,308,"Hot Pink Trouser Suit","Suits & Co-ords","Hot pink","A vibrant hot-pink trouser suit with a sharply tailored blazer and matching trousers. The confident colour turns a classic coordinated shape into a standout occasion look.",14900),
 (309,312,"Blue Floral Fitted Dress","Dresses","Blue and white","A fitted blue dress with a fresh white floral pattern and a feminine knee-length silhouette. The classic floral palette works for daytime celebrations and smart casual events.",8900),
 (313,317,"Beige Textured Coat","Outerwear","Beige","A warm beige textured coat with a softly structured shape and a classic neutral finish. Layer it over workwear or occasion outfits for extra polish.",13900),
 (318,323,"Orange Ruffle Mini Dress","Dresses","Orange","A bright orange sleeveless mini dress with a fitted bodice and playful ruffle detail. Its vivid colour and short flared hem make it a lively party piece.",7900),
 (324,333,"White Tunic Mini Dress","Dresses","White","A clean white mini dress with a relaxed tunic shape and soft three-quarter sleeves. The simple silhouette is easy to wear with sandals, heels or a small statement bag.",7900),
 (334,342,"White Blouse and Orange Skirt","Two-Piece Sets","White and orange","A crisp white blouse paired with a vivid orange skirt for a fresh colour-blocked outfit. The feminine skirt adds movement while the light top keeps the look balanced.",9900),
 (343,346,"Blush Ruched Mini Dress","Dresses","Blush pink","A fitted blush-pink mini dress with soft gathered ruching through the body and a flattering sleeveless neckline. Its understated colour makes it easy to accessorise for an evening out.",7900),
 (347,350,"Slate Grey Draped Set","Two-Piece Sets","Slate grey","A slate-grey coordinated set with a softly draped top and matching trousers. The relaxed tonal silhouette offers an understated option for smart everyday dressing.",10900),
 (351,353,"White Relaxed Tunic Dress","Dresses","White","A simple white tunic dress with an easy straight cut, relaxed sleeves and a clean hem. A versatile warm-weather style that works with flats or statement accessories.",6900),
 (354,363,"Ivory Tailored Trouser Suit","Suits & Co-ords","Ivory","A refined ivory trouser suit with a fitted blazer, defined lapels and matching straight-leg trousers. Its light neutral colour suits weddings, work events and formal occasions.",14900),
 (364,368,"White Embroidered Tunic and Trousers","Two-Piece Sets","White and black","A white tunic and trouser set detailed with dark embroidery around the neckline and front. The decorative finish gives the relaxed silhouette a polished occasion feel.",11900),
 (369,374,"White Lace Blouse and Trousers","Two-Piece Sets","White","A white lace-detailed blouse paired with slim white trousers for a light, coordinated look. Textured lace brings a delicate finish to this versatile two-piece.",10900),
 (375,388,"Champagne Satin Evening Gown","Bridal & Occasion","Champagne","A floor-length champagne gown with a fluid satin finish and elegant draping. The softly luminous fabric and long skirt make it a graceful choice for weddings and formal evenings.",16900),
 (389,398,"White Embroidered Kaftan Set","Two-Piece Sets","White","A flowing white kaftan-style top with coordinated trousers and ornate embroidered detailing. The relaxed cut and decorative front make this set comfortable and event ready.",12900),
 (399,404,"Yellow Contrast-Panel Dress","Dresses","Yellow and navy","A bright yellow sleeveless dress with a bold dark contrast panel and a clean knee-length shape. The graphic colour blocking gives this simple silhouette a modern finish.",8900),
 (405,412,"Teal Leaf-Print Blouse","Tops & Blouses","Teal and white","A sleeveless teal blouse with a bold white leaf print and a softly shaped hem. Its fresh botanical pattern pairs easily with black trousers, denim or a simple skirt.",5200),
]

CATEGORIES = ["Dresses","Two-Piece Sets","Office Wear","Evening & Dinner Dresses","Tops & Blouses","Bottoms","Outerwear","Bridal & Occasion","Kidswear","Bags","Shoes","Hats & Accessories"]

def color_from_image(path):
    try:
        im = Image.open(path).convert("RGB")
        w,h = im.size
        a = np.asarray(im.crop((int(w*.25),int(h*.2),int(w*.75),int(h*.85))).resize((24,36))).reshape(-1,3)
        # Prefer saturated garment colours while allowing white, black and neutrals.
        sat = a.max(axis=1)-a.min(axis=1)
        pixels = a[sat > 42]
        if len(pixels) < 10: pixels = a
        r,g,b = np.median(pixels,axis=0)
        if max(r,g,b) < 65: return "Black"
        if min(r,g,b) > 205: return "White"
        if max(r,g,b)-min(r,g,b) < 27: return "Grey" if max(r,g,b)<175 else "Cream"
        if r>g*1.35 and r>b*1.3: return "Red"
        if r>g*1.12 and r>b*1.05: return "Pink" if b>85 else "Orange"
        if g>r*1.12 and g>b*1.03: return "Green"
        if b>r*1.15 and b>g*1.08: return "Blue"
        if r>g*1.08 and b>g*1.04: return "Purple"
        return "Multicolour"
    except Exception:
        return "Multicolour"

def dhash(path):
    try:
        im=Image.open(path).convert("L").resize((9,8)); a=np.asarray(im)
        return (a[:,1:] >= a[:,:-1]).flatten()
    except Exception: return None

def main():
    folders={p.name:p for p in SOURCE.iterdir() if p.is_dir()}
    base=[]; used=set()
    camera=folders.get("Lynmarie 2025")
    if camera:
        by_num={int(re.search(r"\((\d+)\)",p.stem).group(1)):p for p in camera.glob("pic (*).jpeg") if re.search(r"\((\d+)\)",p.stem)}
        for start,end,name,category,color,copy,price in LOOKS:
            imgs=[by_num[n] for n in range(start,end+1) if n in by_num]
            if imgs:
                item={"name":name,"category":category,"color":color,"copy":copy,"price":price,"files":[str(x.relative_to(ROOT)) for x in imgs]}
                base.append(item); used.update(item["files"])
        flower=camera/"Shoes.jpg"
        if flower.exists():
            item={"name":"Black Petal Statement Brooch","category":"Hats & Accessories","color":"Black and pink","copy":"A dramatic petal-shaped statement brooch with a dark outline and a central jewel-like accent. Pin it to a jacket, scarf or occasion outfit.","price":3500,"files":[str(flower.relative_to(ROOT))]}
            base.append(item);used.update(item["files"])

    alviin=folders.get("Lynmarie 2026 Alviin")
    if alviin:
        groups=[(8927,8927,"Burgundy Tailored Trouser Suit","Suits & Co-ords","Burgundy","A coordinated burgundy trouser suit with a fitted jacket and straight-leg trousers. Its deep colour and clean tailoring make a confident work or occasion outfit.",13900),
        (8938,8947,"Cobalt Blue Skirt Suit","Suits & Co-ords","Cobalt blue","A vivid cobalt skirt suit with a shaped jacket and matching knee-length skirt. The saturated blue colour creates a polished statement for work and events.",13900),
        (8955,8973,"Sage Green Pleated Maxi Dress","Dresses","Sage green","A flowing sage-green maxi dress with a softly pleated skirt and a clean sleeveless bodice. The muted green shade and full-length silhouette create an elegant occasion look.",11900),
        (8981,8990,"Leopard Print Trouser Look","Two-Piece Sets","Brown and black","A coordinated animal-print look with a softly tailored light jacket and leopard-patterned trousers. The neutral print creates a bold outfit with a refined finish.",13900),
        (8994,9004,"Ivory Longline Trouser Suit","Suits & Co-ords","Ivory","A light ivory trouser suit with an elongated jacket and matching trousers. The clean neutral palette makes this tailored set an elegant option for formal occasions.",14900),
        (9008,9019,"Black and White Tulle Gown","Bridal & Occasion","Black and white","A dramatic floor-length occasion gown with a fitted dark bodice and a full white tulle skirt. The strong contrast and voluminous shape make it a striking formal piece.",17900),
        (9021,9027,"Midnight Navy Evening Dress","Dresses","Navy and black","A refined dark evening dress with a softly draped neckline and elegant long silhouette. Its deep navy tone is easy to style for formal dinners and celebrations.",11900),
        (9029,9049,"Golden Tiered Occasion Dress","Bridal & Occasion","Gold","A warm gold occasion dress with a softly structured bodice and decorative tiered detailing. The luminous colour and celebratory shape make it ideal for special events.",15900),
        (9051,9059,"Pink Blouse and Black Trousers","Two-Piece Sets","Pink and black","A polished outfit pairing a soft pink blouse with tailored black trousers. The balanced colour contrast makes this coordinated look easy to wear from work to dinner.",10900),
        (9061,9071,"Black and White Printed Midi Dress","Dresses","Black and white","A black-and-white printed midi dress with a flattering, gently shaped silhouette. The graphic pattern and versatile length work for smart daytime dressing and casual occasions.",9900),
        (9081,9088,"Coral Ruched Mini Dress","Dresses","Coral","A vivid coral mini dress with a fitted shape, gathered detailing and a softly flared hem. The bright colour makes it a confident party and occasion style.",8900)]
        files=list(alviin.iterdir())
        for start,end,name,category,color,copy,price in groups:
            imgs=[p for p in files if re.search(r"ALV_(\d+)",p.stem) and start<=int(re.search(r"ALV_(\d+)",p.stem).group(1))<=end]
            if imgs:
                item={"name":name,"category":category,"color":color,"copy":copy,"price":price,"files":[str(x.relative_to(ROOT)) for x in sorted(imgs)]}
                base.append(item);used.update(item["files"])

    # The August photo set includes individual look cards and ordered boutique
    # photo runs. Preserve alternate views together and describe the visible
    # garment rather than using the original upload filename.
    august=folders.get("1 Lynmari August 2026")
    if august:
        def natural_key(path):
            return tuple(int(x) if x.isdigit() else x.lower() for x in re.split(r"(\d+)",path.name))
        pics=sorted([p for p in august.iterdir() if p.suffix.lower() in (".jpg",".jpeg",".png",".webp")],key=natural_key)
        august_specs=[
          ([0,1,2,3],"Ivory Embroidered Trouser Suit","Suits & Co-ords","Ivory","A tailored ivory trouser suit with delicate embroidery concentrated at the hems and a clean longline jacket. A graceful choice for a wedding guest, formal celebration or polished event outfit.",14900),
          ([4],"Blue Print Blouse and Black Trousers","Two-Piece Sets","Blue and black","A blue-and-black printed blouse paired with dark tailored trousers. The relaxed patterned top adds colour to a versatile smart-casual outfit.",9900),
          ([5],"Brown Print Occasion Set","Two-Piece Sets","Brown and cream","A warm brown coordinated look with a decorative cream-and-brown print and an easy flowing silhouette. Its earthy palette works well for daytime gatherings and relaxed occasions.",10900),
          ([6],"Dusty Rose Midi Dress","Dresses","Dusty rose","A softly fitted dusty-rose midi dress with a defined waist and a graceful skirt. Its muted colour and modest length make it suitable for daytime events and dinner plans.",8900),
          ([7,8],"Pink Ruched Mini Dress","Dresses","Pink","A vivid pink fitted mini dress with a softly gathered shape and short sleeves. The clean silhouette and bright colour create a confident party-ready look.",7900),
          ([9],"White Blouse and Black Pencil Skirt","Two-Piece Sets","White and black","A crisp white blouse styled with a black pencil skirt for a classic, polished contrast. This versatile outfit suits the office, meetings and smart daytime occasions.",9900),
          ([10],"Blue Floral Trouser Set","Two-Piece Sets","Blue and multicolour","A coordinated blue floral outfit with a relaxed top and matching trousers. The lively print creates a complete look while remaining easy to style with neutral accessories.",10900),
          ([11],"Wine Red Occasion Dress","Dresses","Wine red","A rich wine-red dress with a softly shaped waist and elegant full-length line. The deep colour makes it a refined option for evening events and special celebrations.",11900),
          ([12],"Turquoise Ruffle Mini Dress","Dresses","Turquoise","A bright turquoise mini dress with a fitted bodice and playful layered ruffle hem. Its lively colour and sculpted silhouette make it a standout party piece.",8900),
          ([13],"Blush Satin Dinner Dress","Bridal & Occasion","Blush pink","A blush-pink evening dress with a smooth satin finish and an elegant floor-length silhouette. The soft sheen and romantic colour suit weddings, formal dinners and celebrations.",14900),
          ([14],"Teal Satin Evening Gown","Bridal & Occasion","Teal blue","A vivid teal-blue formal gown with a fluid satin finish and a graceful long silhouette. The saturated colour makes a striking choice for weddings and evening occasions.",15900),
          ([15],"Pale Pink Dinner Gown","Bridal & Occasion","Pale pink","A pale-pink dinner gown with a flowing formal skirt and an elegant fitted upper shape. The delicate colour and floor-length profile create a graceful special-event look.",15900),
          ([16],"Chocolate Ruched Mini Dress","Dresses","Chocolate brown","A chocolate-brown fitted dress with a softly gathered waist and a clean short silhouette. The rich neutral colour gives this party style a polished, easy-to-accessorise finish.",7900),
          ([17],"Brown Fitted Occasion Dress","Dresses","Brown","A fitted brown occasion dress with a clean, softly shaped silhouette and rich neutral colour. Style it with metallic accessories for dinner plans and special events.",8900),
          ([18],"Ivory Tailored Trouser Suit","Suits & Co-ords","Ivory","A tailored ivory trouser suit with a longline jacket and matching straight-leg trousers. The light, polished silhouette is suited to weddings, work events and formal occasions.",13900),
          ([19],"White Blouse and Black Pencil Skirt","Two-Piece Sets","White and black","A crisp white blouse paired with a black pencil skirt for a classic, polished contrast. This versatile outfit suits the office, meetings and smart daytime occasions.",9900),
          ([20],"Grey Pleated Maxi Skirt","Bottoms","Grey","A flowing grey maxi skirt with fine pleats and soft movement through the hem. Pair it with a fitted blouse or knit top for an elegant, easy-to-wear outfit.",5900),
          ([21],"Navy Pleated Evening Dress","Dresses","Navy","A navy full-length dress with a softly pleated skirt and a graceful, elongated silhouette. Its deep colour and fluid movement work beautifully for evening plans.",11900),
          ([22],"Mocha Draped Midi Dress","Dresses","Mocha brown","A mocha-brown fitted midi dress with gathered draping that shapes the waist and body. The understated neutral tone brings a refined finish to evening dressing.",8900),
          ([23],"Navy Pleated Evening Dress","Dresses","Navy","A navy full-length dress with a softly pleated skirt and a graceful, elongated silhouette. Its deep colour and fluid movement work beautifully for evening plans.",11900),
          ([24,25,26,27,30],"Blush Bow-Detail Gown","Bridal & Occasion","Blush pink","A blush formal gown finished with a sculptural dark bow detail at the bodice and a flowing floor-length skirt. The statement neckline makes it ideal for weddings and special events.",16900),
          ([28],"Mocha Draped Midi Dress","Dresses","Mocha brown","A mocha-brown fitted midi dress with soft gathers that shape the waist and body. The understated neutral tone gives this occasion style a polished finish.",8900),
          ([29,31],"Cobalt Satin Ruffle Dress","Dresses","Cobalt blue","A vivid cobalt-blue dress with a softly draped bodice and layered ruffle detailing. The bright satin-like finish and feminine hem make it a standout occasion style.",11900),
          ([32,33],"Boutique Tailored Outfit Edit","Suits & Co-ords","Black and white","A boutique styling image showing tailored black-and-white outfit options. The coordinated jacket and skirt silhouettes are suited to polished workwear and smart occasions.",12900),
          ([34],"Colourful Print Blouse and Trousers","Two-Piece Sets","Multicolour","A vivid printed blouse styled with dark trousers for a confident, easy-to-wear coordinated look. The colourful pattern brings personality to the outfit while the dark lower piece keeps it balanced.",9900),
          ([35],"Black Longline Jacket and Trousers","Suits & Co-ords","Black","A black longline jacket styled with dark trousers for a sleek, monochrome outfit. The clean elongated silhouette works for smart casual dressing and evening plans.",12900),
          ([36],"Animal Print Top and Trousers","Two-Piece Sets","Brown and black","A coordinated animal-print outfit with a patterned top and dark lower piece. The statement print gives this relaxed set a bold, polished finish.",10900),
          ([37],"Fuchsia Shirt Dress","Dresses","Fuchsia","A bright fuchsia shirt-style dress with a defined waist and easy knee-length shape. The vivid colour makes this versatile piece work for daytime plans and casual occasions.",7900),
          ([38,40,43],"Purple Embellished Evening Dress","Bridal & Occasion","Purple","A rich purple formal dress with decorative texture and a long, elegant silhouette. The saturated jewel tone is suited to celebrations and evening occasions.",14900),
          ([39,41,42,44,47],"Turquoise Ruffle Gown","Bridal & Occasion","Turquoise","A brilliant turquoise occasion gown with a sculpted bodice and dramatic layered ruffle skirt. The vivid colour and voluminous hem create a memorable event look.",15900),
          ([45,46,48],"Black Top and Ivory Wide-Leg Trousers","Two-Piece Sets","Black and ivory","A relaxed two-piece pairing a fluid dark top with light wide-leg trousers. The high-contrast palette and easy proportions create a modern smart-casual outfit.",10900),
          ([49,50,51,52,53,54,55,56,57],"Ivory Embroidered Trouser Suit","Suits & Co-ords","Ivory","A softly tailored ivory jacket-and-trouser outfit with delicate embroidery and a long, refined line. The light neutral shade makes this set a graceful choice for weddings and formal celebrations.",14900),
          ([58,59,60,61,62,63,64,65,68,70,72],"Blue Floral Longline Tunic Set","Two-Piece Sets","Ivory and blue","A flowing light tunic with a blue-grey floral border and coordinated trousers. The longline drape and decorative print give this comfortable set an elegant occasion finish.",12900),
          ([66,67,69,71,73],"Beige Tailored Trouser Suit","Suits & Co-ords","Beige","A refined beige trouser suit with a softly structured jacket and matching trousers. The warm neutral tone and clean tailoring work for formal gatherings, work and special occasions.",13900),
          ([74],"Red Draped Formal Gown","Bridal & Occasion","Red","A striking red formal gown with a sculpted bodice and long, fluid skirt. The confident colour and elegant draping suit weddings, celebrations and evening events.",15900),
          ([75],"White Blouse and Black Skirt","Two-Piece Sets","White and black","A crisp white blouse paired with a black skirt for a timeless, polished contrast. This versatile set moves easily from workwear to smart daytime occasions.",9900),
          ([76],"Sage Green Skirt Set","Two-Piece Sets","Sage green","A coordinated sage-green outfit with a softly structured top and a matching flowing skirt. The fresh muted shade gives this set an elegant daytime feel.",10900),
          ([77],"Navy Pencil Skirt Suit","Suits & Co-ords","Navy","A classic navy skirt suit with a fitted jacket and a neat knee-length skirt. Its clean tailoring makes it a polished choice for work and formal appointments.",12900),
          ([78],"Multicolour Floral Occasion Dress","Dresses","Multicolour","A lively floral occasion dress with a colourful all-over print and a softly shaped silhouette. The bright pattern makes it an easy choice for celebrations and daytime events.",9900),
          ([79],"Teal Tailored Skirt Suit","Suits & Co-ords","Teal","A coordinated teal skirt suit with a clean fitted jacket and matching skirt. The rich colour adds personality to a smart, tailored silhouette.",12900),
          ([80,81],"Purple Trouser Suit","Suits & Co-ords","Purple","A coordinated purple trouser suit with a fitted jacket and matching straight-leg trousers. Its rich jewel tone brings a confident finish to workwear and occasion dressing.",13900),
          ([82,83],"Blush Tiered Party Dress","Kidswear","Blush pink","A little girl’s blush party dress with soft layered tulle and a decorative fitted bodice. The full skirt and delicate colour make it a lovely choice for birthdays and celebrations.",6900),
          ([84],"Navy Floral Midi Dress","Dresses","Navy and white","A navy midi dress with an all-over white floral motif and an easy, softly shaped silhouette. The classic print suits daytime celebrations and smart casual events.",8900),
          ([85],"Pink Occasion Mini Dress","Dresses","Pink","A feminine pink mini dress with a clean fitted shape and a softly flared finish. The bright colour makes it easy to style for parties and daytime events.",7900),
          ([86],"Cream Floral-Print Handbag","Bags","Cream and multicolour","A compact cream handbag with a colourful floral print, top handle and structured shape. The bright pattern makes it a playful accent for neutral outfits.",5900),
          ([87,100],"Leopard Print Top-Handle Bag","Bags","Brown and black","A compact leopard-print handbag with a structured body, top handles and dark trim. Its classic animal pattern adds a statement accent to simple everyday looks.",5900),
          ([88],"Emerald Top-Handle Bag","Bags","Emerald green","A structured emerald-green top-handle bag with a clean boxy silhouette and a polished finish. Carry it as a bright accent for work or an occasion outfit.",6900),
          ([89],"Black Quilted Shoulder Bag","Bags","Black","A small black quilted shoulder bag with a structured silhouette and chain-style strap. Its versatile dark finish works from daytime errands to evening plans.",5900),
          ([90],"Grey Woven Crossbody Bag","Bags","Grey","A compact grey woven crossbody bag with a practical strap and softly structured shape. The neutral texture makes it a versatile everyday accessory.",4900),
          ([91,101],"Coral Structured Handbag","Bags","Coral","A bright coral handbag with a neat top handle, structured shape and polished hardware. Its compact size and vivid colour make it a cheerful occasion accessory.",5900),
          ([92,102],"Black Textured Handbag","Bags","Black","A black textured handbag with a compact shape, short handles and a refined finish. Carry it with formalwear or use it to add a dark accent to a colourful look.",5900),
          ([93,103],"Taupe Everyday Shoulder Bag","Bags","Taupe","A practical taupe shoulder bag with a softly structured body and neutral finish. The understated colour makes it easy to pair with workwear and casual outfits.",5900),
          ([94],"Green Logo Crossbody Bag","Bags","Green","A small green crossbody bag with a bright finish and a slim adjustable strap. It keeps essentials close while adding a colourful accent to a casual look.",5900),
          ([95],"Gold Evening Clutch","Bags","Gold","A gold-tone evening clutch with a compact, polished silhouette and metallic finish. A simple statement accessory for weddings, dinners and celebrations.",4900),
          ([96],"Ivory Quilted Mini Bag","Bags","Ivory","A compact ivory quilted mini bag with a structured flap and subtle hardware. Its light neutral colour pairs easily with occasion dresses and tailored outfits.",5900),
          ([97],"Green Mini Crossbody Bag","Bags","Green","A compact green mini bag with a slim crossbody strap and clean structured shape. The bright colour makes an easy statement with a neutral outfit.",4900),
          ([98],"Coral Mini Shoulder Bag","Bags","Coral","A compact coral shoulder bag with a clean structured shape and a vivid warm finish. A handy accent for daytime outings and special occasions.",4900),
          ([99],"Black Structured Handbag","Bags","Black","A classic black handbag with a structured body and clean top-handle silhouette. Its versatile finish makes it a dependable choice for work and everyday use.",6900),
        ]
        for indices,name,category,color,copy,price in august_specs:
            imgs=[pics[i] for i in indices if i<len(pics)]
            item={"name":name,"category":category,"color":color,"copy":copy,"price":price,"files":[str(p.relative_to(ROOT)) for p in imgs]}
            base.append(item);used.update(item["files"])

    pics_folder=folders.get("Lynemarie pics")
    if pics_folder:
        def natural_key(path):
            return tuple(int(x) if x.isdigit() else x.lower() for x in re.split(r"(\d+)",path.name))
        photo_run=sorted([p for p in pics_folder.iterdir() if p.suffix.lower() in (".jpg",".jpeg",".png",".webp")],key=natural_key)
        # WhatsApp sequences revisit the same styles as the numbered camera
        # roll. Attach those views to their product galleries instead of
        # creating a second listing for another angle of the same garment.
        runs=[
          ([10],"Black Cocktail Dress","Dresses","Black","A sleek black occasion dress with a fitted shape and a softly textured finish. Its versatile dark colour makes it easy to style for dinners and evening events.",8900),
          ([11],"Yellow and Blue Printed Set","Two-Piece Sets","Yellow and blue","A bright coordinated outfit with a vivid yellow piece and colourful print accents. The easy matching silhouette makes it a cheerful choice for daytime occasions.",8900),
          ([12,20,21],"White Fitted Midi Dress","Dresses","White","A clean white fitted dress with a simple neckline and knee-length silhouette. The minimal finish makes this versatile piece easy to accessorise for daytime events.",8900),
          ([13,14,15,26,27],"Ivory Embroidered Trouser Set","Two-Piece Sets","Ivory","A light embroidered tunic-and-trouser outfit with a softly flowing shape and decorative detail. The pale palette and longline silhouette make it a graceful option for celebrations.",12900),
          ([16,17],"Fuchsia Shirt Dress","Dresses","Fuchsia","A vivid fuchsia dress with an easy shirt-inspired shape and a defined waist. Its bright colour makes this versatile day dress a confident choice for casual events.",7900),
          ([18,19],"Blue Floral Trouser Set","Two-Piece Sets","Blue and multicolour","A coordinated blue floral outfit with a printed top and matching trousers. The expressive pattern and relaxed fit create a complete look for weekends and daytime occasions.",10900),
          ([22],"Purple Tailored Skirt Suit","Suits & Co-ords","Purple","A purple tailored skirt suit with a fitted jacket and coordinated skirt. Its rich colour gives a polished workwear silhouette a distinctive finish.",12900),
          ([23,24],"Teal Floral Skirt Suit","Suits & Co-ords","Teal and cream","A coordinated teal jacket and floral skirt with a softly tailored shape. The solid upper piece balances the patterned lower half for a polished event outfit.",12900),
          ([25],"Purple Trouser Suit","Suits & Co-ords","Purple","A coordinated purple trouser suit with a fitted jacket and matching straight-leg trousers. Its rich jewel tone brings a confident finish to workwear and occasion dressing.",13900),
          ([28,29,30,31,32],"Bride To Be Keepsake Set","Bridal & Occasion","White","A white bridal keepsake with raised floral detail and a celebratory bride-to-be message. A thoughtful finishing accessory for wedding preparations and bridal gifting.",3500),
          ([33,34],"Patterned Mini Shoulder Bag","Bags","White and multicolour","A compact patterned shoulder bag with a light ground, colourful print and a practical strap. Its playful pattern adds a bright accent to simple outfits.",4900),
          ([35],"Red and Black Pointed Heels","Shoes","Red and black","Pointed slingback heels in a dramatic red-and-black combination. The sleek shape brings a sharp accent to evening and occasion outfits.",6900),
          ([36],"Blue Print Mini Handbag","Bags","White and blue","A compact light-coloured handbag with a blue printed finish and structured silhouette. Carry it as a fresh accent with neutral clothing.",5200),
          ([37,38,39],"Emerald Top-Handle Bag","Bags","Emerald green","A structured emerald-green handbag with a clean boxy silhouette and polished hardware. The bold colour adds a bright accent to work and occasion outfits.",6900),
          ([40,41,42],"Yellow Floral Maxi Dress","Dresses","Yellow and white","A light yellow-and-white floral maxi dress with a softly defined waist and flowing full-length skirt. The bright botanical print gives it an elegant warm-weather finish.",8900),
          ([43,44],"Ivory Lace Girls’ Party Dress","Kidswear","Ivory","A little girl’s ivory occasion dress with delicate lace texture and a softly full skirt. The refined neutral finish makes it lovely for weddings and celebrations.",6900),
          ([45,46,47,48,49,50,51,52],"Ivory Embroidered Trouser Suit","Suits & Co-ords","Ivory","An ivory embroidered jacket-and-trouser outfit with a graceful longline shape and delicate patterned detailing. Its soft neutral colour is suited to weddings and formal celebrations.",14900),
          ([53,54,55,56],"Taupe Mini Shoulder Bag","Bags","Taupe and cream","A compact taupe-and-cream shoulder bag with a structured flap and polished hardware. Its neutral palette makes it a versatile finishing piece for day and evening outfits.",5200),
          ([57,58,59],"Pink and Gold Girls’ Sandals","Shoes","Pink and gold","Children’s open-toe sandals with pink, cream and gold accents and secure multi-strap styling. A dressed-up shoe for parties and family occasions.",3900),
          ([60,61,62,63],"Pastel Kids’ Trainers","Shoes","White and pastel","Light-coloured children’s trainers with soft pastel accents and an everyday cushioned profile. An easy casual option for little ones.",4200),
          ([64,65,66],"Pink Glitter Ballet Flats","Shoes","Pink","A pair of pink glitter flats with a rounded toe and a polished finish. The sparkle makes these comfortable shoes a sweet choice for parties and special occasions.",3900),
          ([67,68,74,75,76],"Pink Floral Maxi Dress","Dresses","Pink and multicolour","A flowing pink floral maxi with a soft drape and romantic all-over garden print. The long length and vivid pattern make it an easy choice for daytime celebrations.",9900),
          ([69,70,71,73],"Purple Ruched Maxi Dress","Dresses","Purple","A rich purple fitted maxi dress with gathered ruching through the body and a long, clean skirt. The streamlined silhouette works for evening events and dressy occasions.",9900),
          ([72],"Lavender Tulle Party Dress","Kidswear","Lavender","A little girl’s lavender party dress with layered tulle, a full skirt and a decorative bodice. A pretty choice for birthdays, weddings and celebrations.",6900),
          ([77,78,79],"Mint Floral Fitted Dress","Dresses","Mint green","A fitted mint-green dress with a delicate floral pattern and a softly shaped waist. The fresh pastel palette is well suited to daytime events and smart casual wear.",8900),
          ([80,81,82,83],"Navy Floral Long Dress","Dresses","Navy and white","A full-length navy dress with a striking white floral pattern and a softly shaped silhouette. The dark ground keeps the expressive print polished for daytime and evening occasions.",10900),
          ([84],"Navy Blazer and White Trousers","Suits & Co-ords","Navy and white","A polished navy blazer paired with crisp white trousers. The clean two-colour combination creates a versatile smart-casual suit for work and daytime occasions.",11900),
          ([85],"Colourful Print Blouse and Trousers","Two-Piece Sets","Multicolour","A vibrant printed top styled with coordinating trousers for an expressive, easy-to-wear outfit. The colourful pattern brings personality to daytime dressing.",9900),
          ([86,87,88,89,90,91,92],"Navy Tailored Trouser Suit","Suits & Co-ords","Navy","A coordinated navy trouser suit with a clean blazer and straight-leg trousers. Its classic dark colour and refined tailoring make it suitable for work, meetings and formal events.",13900),
          ([93,94],"Mauve Satin Midi Dress","Dresses","Mauve","A fluid mauve satin midi dress with a softly defined waist and graceful skirt. The subtle sheen gives this understated style an elegant occasion finish.",10900),
          ([95,96,97],"Powder Blue Wide-Leg Set","Two-Piece Sets","Powder blue","A relaxed powder-blue two-piece with a flowing top and wide-leg trousers. The soft monochrome palette and easy drape make this set comfortable yet refined.",11900),
          ([98,99],"Navy Tailored Trouser Suit","Suits & Co-ords","Navy","A coordinated navy trouser suit with a clean blazer and straight-leg trousers. Its classic dark colour and refined tailoring make it suitable for work, meetings and formal events.",13900),
          ([100,101,102],"Powder Blue Wide-Leg Set","Two-Piece Sets","Powder blue","A relaxed powder-blue outfit with a soft top and wide-leg trousers. The airy monochrome silhouette is comfortable, polished and easy to accessorise.",11900),
          ([103,104,105,106],"Teal Blue Midi Dress","Dresses","Teal blue","A fitted teal-blue midi dress with a clean sleeveless shape and smooth, body-skimming lines. Its rich colour makes it a versatile choice for daytime and evening plans.",8900),
          ([107,108,109,110,111],"Blue Blazer and White Trouser Set","Suits & Co-ords","Blue and white","A bright blue blazer with crisp white trousers for a fresh tailored contrast. The coordinated pieces can be worn together or mixed into a workwear wardrobe.",13900),
          ([112,113],"Purple Trouser Suit","Suits & Co-ords","Purple","A coordinated purple trouser suit with a fitted jacket and matching straight-leg trousers. Its rich jewel tone brings a confident finish to workwear and occasion dressing.",13900),
          ([114,115],"Colourful Print Tunic Set","Two-Piece Sets","Pink, yellow and blue","A lively multicolour print outfit with a relaxed tunic silhouette and coordinated lower piece. Bright pink, yellow and blue accents bring a playful statement to the look.",8900),
          ([129,130,131],"Hot Pink Trouser Suit","Suits & Co-ords","Hot pink","A vibrant hot-pink trouser suit with a sharply tailored jacket and matching trousers. The confident colour turns a classic coordinated shape into a standout occasion look.",14900),
          ([134,135,136,137,138],"Purple and Pink Layered Dress Set","Two-Piece Sets","Purple and pink","A rich purple dress styled with a bright pink scarf and coordinated layered finish. The contrasting colours and flowing shape create a polished event-ready look.",10900),
          ([139,140,141,142,143,148,149,150,154,214,216,217,218,228,229,230,231,232],"Orange Ruffle Mini Dress","Dresses","Orange","A vivid orange fitted mini dress with a sculpted sleeveless bodice and playful layered ruffle hem. Its bright colour and flared finish make it a lively party style.",8900),
          ([144,145,146,147,151,153,156,157,160,161,162,163,164],"White Relaxed Tunic Dress","Dresses","White","A simple white tunic dress with an easy straight cut, relaxed sleeves and a clean hem. A versatile warm-weather style that works with flats or statement accessories.",6900),
          ([152,155,158,159],"Blue Floral Fitted Dress","Dresses","Blue and white","A fitted blue dress with a fresh white floral pattern and a feminine knee-length silhouette. The classic floral palette works for daytime celebrations and smart casual events.",8900),
          ([165,166],"Floral Coordinated Outfit","Two-Piece Sets","Multicolour","A coordinated floral outfit with a vivid all-over print and relaxed feminine silhouette. The matching look is easy to style for a weekend event or holiday.",8900),
          ([167,168,169,170],"Blush Tiered Party Dress","Kidswear","Blush pink","A little girl’s blush party dress with soft layered tulle and a decorative fitted bodice. The full skirt and delicate colour make it a lovely choice for birthdays and celebrations.",6900),
          ([171,174,176],"Mint Tulle Girls’ Party Dress","Kidswear","Mint green","A little girl’s mint party dress with a soft tulle skirt and a decorative bodice. The airy layers and fresh pastel colour make it a charming celebration outfit.",6900),
          ([172,175],"Lavender Tulle Party Dress","Kidswear","Lavender","A little girl’s lavender party dress with layered tulle, a full skirt and a decorative bodice. A pretty choice for birthdays, weddings and celebrations.",6900),
          ([177,178,179,180],"Blush Floral Girls’ Dress","Kidswear","Blush pink and floral","A light girls’ occasion dress with a soft blush base and a colourful floral print. The airy, flowing shape is made for celebrations and warm-weather events.",6200),
          ([181,182],"White Tulle Girls’ Party Dress","Kidswear","White","A white girls’ occasion dress with layered tulle and a softly full skirt. Its clean finish and playful shape make it suitable for birthdays and family celebrations.",6900),
          ([183,184,185,186],"White Floral Blouse and Skirt Set","Two-Piece Sets","White and blue","A coordinated white outfit with a delicate blue floral pattern and a softly flowing lower piece. The light print and feminine shape make it a graceful daytime look.",9900),
          ([187,188,189,190,191,192,193,194],"Green Patterned Trouser Set","Two-Piece Sets","Green and black","A matching patterned outfit with a bright green blouse and coordinated wide-leg trousers. The all-over motif and relaxed fit create a complete smart-casual look.",10900),
          ([195,196,197,198,199,200,201,202,203],"Navy Floral Maxi Dress","Dresses","Navy and multicolour","A flowing navy maxi dress with a colourful floral print and graceful full-length silhouette. Its expressive pattern gives this easy draping style an elegant occasion finish.",10900),
          ([204,205,206,207,208],"White Blouse and Black Pencil Skirt","Two-Piece Sets","White and black","A crisp white blouse paired with a black pencil skirt for a classic, polished contrast. This versatile outfit suits the office, meetings and smart daytime occasions.",9900),
          ([209,210,215],"Grey Textured Blouse","Tops & Blouses","Grey","A soft grey blouse with a fine textured finish and relaxed long sleeves. Pair it with black trousers or a simple skirt for an understated everyday look.",5200),
          ([211,212,213],"Yellow and Blue Printed Set","Two-Piece Sets","Yellow and blue","A bright coordinated look pairing a colourful printed top with a strong yellow lower piece. Its high-contrast palette brings a confident pop of colour to casual occasions.",8500),
          ([219,220,221,222,223,224,225,226,227],"White Relaxed Tunic Dress","Dresses","White","A simple white tunic dress with an easy straight cut, relaxed sleeves and a clean hem. A versatile warm-weather style that works with flats or statement accessories.",6900),
          ([233,234],"Green Mini Crossbody Bag","Bags","Green","A compact green mini bag with a slim crossbody strap and clean structured shape. The bright colour makes an easy statement with a neutral outfit.",4900),
          ([235,236],"Red Fitted Occasion Dress","Dresses","Red","A vivid red fitted dress with a smooth silhouette and clean feminine lines. The confident colour makes it an easy choice for parties, dinners and special events.",8900),
          ([237,238],"Ivory Tailored Trouser Suit","Suits & Co-ords","Ivory","A refined ivory trouser suit with a fitted blazer, defined lapels and matching straight-leg trousers. Its light neutral colour suits weddings, work events and formal occasions.",14900),
          ([239],"Black Lace-Trim Dress","Dresses","Black","A sleek black occasion dress with delicate lace trim and a fitted upper silhouette. The dark colour and textured hem give this compact style an elegant evening finish.",8900),
          ([240],"Lilac Fit-and-Flare Dress","Dresses","Lilac","A lilac fit-and-flare dress with a defined waist and softly full skirt. The clean solid colour gives this feminine day-to-evening style a polished finish.",8900),
        ]
        by_name={item["name"]:item for item in base}
        for indices,name,category,color,copy,price in runs:
            if name not in by_name:
                item={"name":name,"category":category,"color":color,"copy":copy,"price":price,"files":[]}
                base.append(item);by_name[name]=item
            item=by_name[name]
            for index in indices:
                if index<len(photo_run):
                    path=str(photo_run[index].relative_to(ROOT))
                    if path not in used:
                        item["files"].append(path);used.add(path)
        # These are store-room, portrait, or gift-detail images, not product
        # photos; keep them out of the customer catalog.
        for index in [0,1,2,3,4,5,6,7,8,9,116,117,118,119,120,121,122,123,124,125,126,127,128,132,133,241]:
            if index<len(photo_run):used.add(str(photo_run[index].relative_to(ROOT)))

    bag_folder=SOURCE/"1 Lynmari August 2026"/"Bags"
    if bag_folder.exists():
        bag_photos=sorted([p for p in bag_folder.iterdir() if p.suffix.lower() in (".jpg",".jpeg",".png",".webp")],key=natural_key)
        bag_runs=[
          ([0],"Cream Floral-Print Handbag","Bags","Cream and multicolour","A compact cream handbag with a colourful floral print, top handle and structured shape. The bright pattern makes it a playful accent for neutral outfits.",5900),
          ([1,14],"Leopard Print Top-Handle Bag","Bags","Brown and black","A compact leopard-print handbag with a structured body, top handles and dark trim. Its classic animal pattern adds a statement accent to simple everyday looks.",5900),
          ([2],"Emerald Top-Handle Bag","Bags","Emerald green","A structured emerald-green top-handle bag with a clean boxy silhouette and polished hardware. The bold colour adds a bright accent to work and occasion outfits.",6900),
          ([3],"Black Quilted Shoulder Bag","Bags","Black","A small black quilted shoulder bag with a structured silhouette and chain-style strap. Its versatile dark finish works from daytime errands to evening plans.",5900),
          ([4],"Grey Woven Crossbody Bag","Bags","Grey","A compact grey woven crossbody bag with a practical strap and softly structured shape. The neutral texture makes it a versatile everyday accessory.",4900),
          ([5,15],"Coral Structured Handbag","Bags","Coral","A bright coral handbag with a neat top handle, structured shape and polished hardware. Its compact size and vivid colour make it a cheerful occasion accessory.",5900),
          ([6],"Black Woven Evening Clutch","Bags","Black and white","A compact black-and-white woven clutch with a graphic texture and a neat rectangular shape. Carry it with eveningwear or use it to bring a crisp pattern to a simple outfit.",4900),
          ([7,17],"Taupe Everyday Shoulder Bag","Bags","Taupe","A practical taupe shoulder bag with a softly structured body and neutral finish. The understated colour makes it easy to pair with workwear and casual outfits.",5900),
          ([8],"Green Logo Crossbody Bag","Bags","Green","A small green crossbody bag with a bright finish and a slim adjustable strap. It keeps essentials close while adding a colourful accent to a casual look.",5900),
          ([9],"Gold Evening Clutch","Bags","Gold","A gold-tone evening clutch with a compact, polished silhouette and metallic finish. A simple statement accessory for weddings, dinners and celebrations.",4900),
          ([10],"Ivory Quilted Mini Bag","Bags","Ivory","A compact ivory quilted mini bag with a structured flap and subtle hardware. Its light neutral colour pairs easily with occasion dresses and tailored outfits.",5900),
          ([11],"Green Mini Crossbody Bag","Bags","Green","A compact green mini bag with a slim crossbody strap and clean structured shape. The bright colour makes an easy statement with a neutral outfit.",4900),
          ([12],"Coral Mini Shoulder Bag","Bags","Coral","A compact coral shoulder bag with a clean structured shape and vivid warm finish. A handy accent for daytime outings and special occasions.",4900),
          ([13,16],"Black Structured Handbag","Bags","Black","A classic black handbag with a structured body and clean top-handle silhouette. Its versatile finish makes it a dependable choice for work and everyday use.",6900),
        ]
        bag_names={item["name"]:item for item in base}
        for indices,name,category,color,copy,price in bag_runs:
            if name not in bag_names:
                item={"name":name,"category":category,"color":color,"copy":copy,"price":price,"files":[]}
                base.append(item);bag_names[name]=item
            for index in indices:
                if index<len(bag_photos):
                    path=str(bag_photos[index].relative_to(ROOT))
                    if path not in used: bag_names[name]["files"].append(path);used.add(path)

    # Match remaining shots to an already identified garment using a visual hash.
    # This gathers alternate camera angles from the other folders into the gallery.
    base_hashes=[]
    for item in base:
        hashes=[dhash(ROOT/f) for f in item["files"]]
        base_hashes.append([h for h in hashes if h is not None])
    leftovers=sorted([p for p in SOURCE.rglob("*") if p.suffix.lower() in (".jpg",".jpeg",".png",".webp") and str(p.relative_to(ROOT)) not in used])
    exact_to_group={}
    for i,item in enumerate(base):
        for f in item["files"]:
            exact_to_group[hashlib.md5((ROOT/f).read_bytes()).hexdigest()]=i
    unassigned=[]
    excluded_tokens=("NLC COPY","DSC_3143","DSC_3167","ChatGPT Image","Dinner Dress")
    for p in leftovers:
        if any(token.lower() in p.name.lower() for token in excluded_tokens): continue
        digest=hashlib.md5(p.read_bytes()).hexdigest()
        if digest in exact_to_group:
            base[exact_to_group[digest]]["files"].append(str(p.relative_to(ROOT)));used.add(str(p.relative_to(ROOT)));continue
        h=dhash(p)
        best=(10**6,None)
        if h is not None:
            for i,hashes in enumerate(base_hashes):
                for other in hashes:
                    dist=int(np.count_nonzero(h!=other))
                    if dist<best[0]:best=(dist,i)
        if best[1] is not None and best[0]<=9:
            base[best[1]]["files"].append(str(p.relative_to(ROOT)));used.add(str(p.relative_to(ROOT)))
        else: unassigned.append(p)

    # Make compact fallback galleries from the remaining photos. These are
    # single styles or views that did not match the hand-described look ranges.
    # WhatsApp and camera exports retain the capture sequence in their names.
    # Group adjacent residual views in small galleries rather than listing each
    # camera angle as an independent product.
    def natural_key(path):
        return tuple(int(x) if x.isdigit() else x.lower() for x in re.split(r"(\d+)",path.name))
    clusters=[]
    for folder in sorted({p.parent for p in unassigned}):
        sequence=sorted([p for p in unassigned if p.parent==folder],key=natural_key)
        for start in range(0,len(sequence),4):
            paths=sequence[start:start+4]
            clusters.append({"paths":paths,"hashes":[]})
    for i,group in enumerate(clusters,1):
        paths=group["paths"]
        sample=paths[0]
        try:
            im=Image.open(sample); ratio=im.height/max(im.width,1)
        except Exception: ratio=1.3
        color=color_from_image(sample)
        if ratio<0.9:
            category="Bags"
            title=f"{color} Statement Handbag"
            detail=f"A compact {color.lower()} fashion bag with a practical everyday shape and a clean, easy-to-style finish. Carry it with casual outfits or use it as a polished accent for an occasion look."
            price=5900
        elif ratio<1.2:
            category="Hats & Accessories"
            title=f"{color} Fashion Accessory {i:03d}"
            detail=f"A {color.lower()} fashion accessory with a distinctive finish, selected to complement dresses, tailored looks and coordinated outfits. Its versatile colour makes it easy to pair with seasonal wardrobe staples."
            price=3900
        else:
            category="Dresses"
            title=f"{color} Printed Occasion Dress {i:03d}"
            detail=f"A {color.lower()} women’s occasion style with an elongated, feminine silhouette and a distinctive finish visible in the product photographs. The versatile shape can be styled for daytime celebrations, dinner plans and special events."
            price=9900
        base.append({"name":title,"category":category,"color":color,"copy":detail,"price":price,"files":[str(x.relative_to(ROOT)) for x in paths]})

    # Consolidate repeated names across folders into one item with a combined
    # gallery, then remove exact repeated photos within each gallery.
    merged={}
    for item in base:
        key=(item["name"].casefold(),item["category"],item["color"].casefold())
        if key not in merged: merged[key]=item
        else: merged[key]["files"].extend(item["files"])
    base=list(merged.values())
    catalog_photo_hashes=set()
    for item in base:
        unique=[];seen=set()
        for f in item["files"]:
            digest=hashlib.md5((ROOT/f).read_bytes()).hexdigest()
            if digest not in seen and digest not in catalog_photo_hashes:
                seen.add(digest);catalog_photo_hashes.add(digest);unique.append(f)
        item["files"]=unique[:30]
    # Some manually grouped variants are exact copies of an earlier product's
    # photos. Once those files are assigned to their first matching product,
    # omit groups with no remaining distinct views.
    base=[item for item in base if item["files"]]
    for item in base:
        if item["category"] == "Suits & Co-ords":
            item["category"] = "Office Wear"
        elif item["category"] in ("Dresses", "Bridal & Occasion") and re.search(r"dinner|evening|gown|cocktail|formal", item["name"], re.I):
            item["category"] = "Evening & Dinner Dresses"
        item["description"]=f"{item['name']} brings {item['color'].lower()} colour and considered styling to a women's wardrobe. {item['copy']} View the product gallery for front, back and detail angles, and check the available images for the garment's finish and overall silhouette. Shop online from LynMarie Boutique in Kenya."
        item["metaTitle"]=f"{item['name']} | LynMarie Boutique Kenya"[:250]
        item["metaDescription"]=f"Shop the {item['name'].lower()} at LynMarie Boutique in Kenya. {item['copy']} View the full photo gallery and current price online."[:500]
        item["shortDescription"]=item["copy"][:250]

    print(f"Prepared {len(base)} product groups from {sum(len(x['files']) for x in base)} image files; excluded {833-sum(len(x['files']) for x in base)} non-product/duplicate files.")
    OUTPUT.write_text(json.dumps(base,ensure_ascii=False,indent=2))
    print(OUTPUT)

if __name__=="__main__":main()
