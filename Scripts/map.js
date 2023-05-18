

let map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let marker = L.marker([51.5, -.09]).addTo(map);

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

let polygon = L.Polyline.fromEncoded("ipqaHvcuiV[Vt@AQFGJCIE@I\\INOPKDWYNSKQGCK[DJk@TIUo@ISOA]IIM?ONUEEC?OI?QMMBIMa@Jc@Qc@A_@@e@Pg@Ta@^KBUXi@Vk@l@QV_@z@Y`@i@pAW^]\\S^El@ILi@?CZM\\EXw@jB_@l@qAzC_@TMBCNEAKLFf@eA~BS`@[z@WR]GIIOWSm@mB{Bs@iAGQ@CCFEKQKEGCOIAU[q@uAE[[aACOQM[zBKZUXs@tAg@NWGs@?kCFcC?eAQcAAw@Cs@MyB@i@LW@cAGkAOM?[Na@KMPo@Ac@E_@K_@AOH_BFmB@o@Ck@He@GGKYC{AHGHYAJCAKEFQ@?BEGQEIHCOIC?Mc@FM]EC_@LO??KMNk@PQSKHyK`@{B?OIUJYIwAHdIW[C_AFMGw@Ks@AYMK?@GCGUB?PKFKOCQDKAI]@WNKXQVMHW[o@EaO|@yBEe@BaAEaB`@oA|@eDvAKJGLK?YLuBjA_IxAe@RcALcAZYE[Jg@?w@FuDn@{B`Ba@^kBhAcA~@]p@_@hAG^sAnFe@fAm@dAcAzAk@n@uAZwCFgGC_EMKGEMAQDsCNgBRqAAo@FSJyA@q@HeANgAz@}LTqBT}CLg@Ac@FK@m@AGBIJo@HQ?KHICSBIt@kEh@gAFUHKHWl@sALI\\i@H?FOJg@@UIy@Bo@EqADmBAoCBg@CoAJ}@Ak@M_@HmCEm@Ge@IQ_@i@YOu@WaAm@[Ie@WWWs@UWWkB}@iBeAMKq@Uc@Wa@GIIM[mAyAqAwBWYYo@iBkCo@k@aAiAo@g@o@w@uAoAq@eA]y@i@k@_@w@KIGMo@mCA{@YsBAg@Me@UcB_@{COc@Kw@M{BKy@?_AEUDg@CyBBcBN_B@c@P_@FWBe@Ny@Tu@Bi@\\}AGSHg@Zs@DUDmAToATq@TuCLs@CHAOF]L[@[MSYJyA@IGMBMAOGq@AWMONIE[F}@Ac@Dm@Eg@OEBe@?GBk@Cu@JQJKCKMu@?IEYCKHIEUFUCIPKMEKk@GcA@SJc@FYUu@JgACm@DYGw@A]Qi@Hy@GKGkALe@Pe@AGFWA[Km@?EBINAT?t@Sb@I`@G|A@PIx@B^CXKR_AOq@Hs@CQBa@QUBGEUF]EUJ}@B}AK}@HqAE}FBuDGcD@")
    .addTo(map);

map.fitBounds(polygon.getBounds());

map.on("click", onMapClick);