export function EuropeMap() {
  return (
    <svg
      viewBox="0 0 1000 700"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <style>{`
          .country { fill: #2A9BD8; stroke: #ffffff; stroke-width: 1.2; stroke-linejoin: round; }
        `}</style>
      </defs>

      {/* Norway */}
      <path className="country" d="M480,20 L500,18 L520,22 L540,30 L535,45 L545,55 L530,65 L510,60 L490,55 L470,50 L460,38 Z" />
      <path className="country" d="M500,18 L530,15 L560,20 L580,30 L575,45 L560,55 L545,55 L535,45 L540,30 L520,22 Z" />
      <path className="country" d="M530,15 L570,10 L600,18 L615,30 L600,42 L580,45 L560,38 L560,20 Z" />

      {/* Sweden */}
      <path className="country" d="M510,60 L530,65 L545,55 L560,55 L575,65 L570,85 L555,100 L540,115 L520,120 L505,110 L500,90 L505,75 Z" />

      {/* Finland */}
      <path className="country" d="M560,55 L580,45 L600,42 L620,50 L635,65 L630,85 L615,95 L595,100 L575,95 L560,80 L555,65 Z" />

      {/* Denmark */}
      <path className="country" d="M510,110 L525,105 L530,120 L520,128 L508,120 Z" />
      <path className="country" d="M515,130 L528,125 L535,138 L525,145 L512,140 Z" />

      {/* UK */}
      <path className="country" d="M380,80 L405,72 L420,85 L415,105 L400,118 L382,115 L370,100 L372,88 Z" />
      <path className="country" d="M370,120 L390,115 L400,130 L395,148 L378,152 L362,142 L358,128 Z" />
      {/* Ireland */}
      <path className="country" d="M340,110 L360,105 L368,120 L360,135 L342,138 L330,125 Z" />

      {/* Iceland */}
      <path className="country" d="M240,55 L268,48 L285,58 L280,75 L262,82 L242,75 Z" />

      {/* Netherlands */}
      <path className="country" d="M448,145 L465,140 L472,152 L466,162 L450,162 L442,153 Z" />

      {/* Belgium */}
      <path className="country" d="M448,162 L466,162 L472,174 L460,184 L444,182 L438,170 Z" />

      {/* Luxembourg */}
      <path className="country" d="M464,182 L474,180 L478,190 L470,196 L462,190 Z" />

      {/* France */}
      <path className="country" d="M380,152 L408,145 L435,148 L448,162 L452,190 L448,210 L430,230 L408,242 L388,238 L370,220 L362,198 L368,178 Z" />

      {/* Spain */}
      <path className="country" d="M335,240 L368,225 L390,240 L398,258 L390,278 L365,295 L338,298 L315,285 L308,265 L318,248 Z" />
      <path className="country" d="M268,260 L308,252 L320,265 L315,285 L290,295 L265,285 L252,268 Z" />

      {/* Portugal */}
      <path className="country" d="M248,268 L265,260 L272,275 L268,295 L252,305 L238,295 L235,278 Z" />

      {/* Germany */}
      <path className="country" d="M465,148 L500,140 L528,148 L535,168 L525,188 L505,200 L480,205 L458,198 L450,178 L450,162 L466,162 Z" />

      {/* Switzerland */}
      <path className="country" d="M468,202 L488,200 L505,205 L508,218 L494,225 L475,222 L464,212 Z" />

      {/* Austria */}
      <path className="country" d="M505,200 L532,195 L558,200 L562,215 L545,225 L520,228 L505,220 L505,208 Z" />

      {/* Czech Republic */}
      <path className="country" d="M525,175 L555,170 L572,178 L568,192 L548,198 L525,195 L515,185 Z" />

      {/* Poland */}
      <path className="country" d="M535,148 L575,140 L610,145 L622,162 L615,180 L590,192 L562,192 L548,180 L535,168 Z" />

      {/* Slovakia */}
      <path className="country" d="M558,195 L588,190 L605,198 L600,210 L575,215 L558,208 Z" />

      {/* Hungary */}
      <path className="country" d="M558,210 L595,205 L618,212 L622,228 L600,240 L572,242 L554,232 L548,218 Z" />

      {/* Slovenia */}
      <path className="country" d="M520,228 L540,225 L545,235 L535,242 L520,240 Z" />

      {/* Croatia */}
      <path className="country" d="M534,242 L555,238 L568,245 L575,258 L562,268 L545,270 L530,262 L525,248 Z" />

      {/* Bosnia */}
      <path className="country" d="M545,268 L560,262 L572,268 L575,282 L560,290 L545,285 Z" />

      {/* Serbia */}
      <path className="country" d="M568,242 L592,238 L605,248 L605,265 L592,275 L572,275 L560,265 L560,248 Z" />

      {/* Montenegro */}
      <path className="country" d="M558,282 L572,278 L578,288 L568,295 L555,290 Z" />

      {/* Albania */}
      <path className="country" d="M562,295 L575,290 L580,305 L572,315 L558,312 L552,300 Z" />

      {/* North Macedonia */}
      <path className="country" d="M575,285 L595,280 L602,292 L592,302 L575,298 Z" />

      {/* Kosovo */}
      <path className="country" d="M578,270 L592,268 L598,278 L585,285 L572,280 Z" />

      {/* Romania */}
      <path className="country" d="M590,205 L625,200 L648,212 L652,232 L640,252 L618,262 L595,258 L580,245 L580,225 Z" />

      {/* Moldova */}
      <path className="country" d="M648,218 L662,215 L668,228 L662,240 L648,238 L642,225 Z" />

      {/* Ukraine */}
      <path className="country" d="M622,160 L668,152 L705,158 L728,172 L730,195 L715,215 L688,225 L665,228 L645,225 L628,215 L618,195 L618,175 Z" />

      {/* Belarus */}
      <path className="country" d="M612,132 L648,125 L675,132 L682,148 L668,162 L645,168 L618,165 L608,150 Z" />

      {/* Lithuania */}
      <path className="country" d="M612,120 L638,115 L648,125 L645,135 L625,140 L610,132 Z" />

      {/* Latvia */}
      <path className="country" d="M615,105 L642,100 L658,108 L655,122 L638,128 L615,122 Z" />

      {/* Estonia */}
      <path className="country" d="M618,88 L645,85 L658,95 L655,108 L638,112 L615,108 Z" />

      {/* Italy */}
      <path className="country" d="M470,225 L492,222 L508,228 L512,248 L505,268 L495,285 L480,298 L462,302 L448,290 L440,272 L448,252 L455,235 Z" />
      <path className="country" d="M490,298 L505,292 L512,308 L505,322 L492,325 L480,312 Z" />
      <path className="country" d="M480,325 L492,320 L498,338 L490,350 L475,348 L468,332 Z" />
      {/* Sicily */}
      <path className="country" d="M458,358 L480,352 L492,362 L488,378 L468,382 L450,372 Z" />
      {/* Sardinia */}
      <path className="country" d="M432,325 L448,318 L455,332 L448,348 L432,348 L422,335 Z" />

      {/* Greece */}
      <path className="country" d="M582,298 L605,292 L618,305 L615,322 L600,330 L580,328 L568,315 Z" />
      <path className="country" d="M590,328 L605,325 L610,340 L602,352 L588,348 L582,335 Z" />
      {/* Crete */}
      <path className="country" d="M582,368 L610,362 L622,372 L615,382 L592,385 L578,375 Z" />

      {/* Turkey */}
      <path className="country" d="M620,295 L665,285 L700,292 L720,308 L715,328 L695,338 L665,335 L642,322 L625,308 Z" />
      <path className="country" d="M700,285 L740,278 L765,288 L768,308 L750,320 L720,315 L700,300 Z" />

      {/* Bulgaria */}
      <path className="country" d="M598,258 L635,252 L652,265 L650,282 L630,292 L605,290 L592,278 Z" />

      {/* North sea / Baltic filler */}
      <path className="country" d="M538,100 L558,95 L572,105 L568,120 L550,125 L535,115 Z" />

      {/* Georgia (country on map) */}
      <path className="country" d="M725,270 L755,262 L775,272 L775,285 L758,292 L730,288 Z" />

      {/* Armenia (country on map) */}
      <path className="country" d="M750,295 L768,288 L782,298 L780,312 L762,318 L748,308 Z" />

      {/* Azerbaijan (country on map) */}
      <path className="country" d="M772,288 L795,282 L810,292 L808,310 L790,318 L772,310 Z" />
    </svg>
  );
}
