import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Clock, Users, Search, ChevronRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Venue {
  id: string;
  name: string;
  type: "auditorium" | "lab" | "ground" | "hall" | "classroom" | "library" | "hostel";
  capacity: number;
  location: string;
  block: string;
  floor: string;
  facilities: string[];
  available: boolean;
  image: string;
  directions: string;
  lat: number;
  lng: number;
}

const MUJ_CENTER = { lat: 26.8425, lng: 75.5650 };

const venues: Venue[] = [
  { id: "v1", name: "MUJ Main Gate", type: "hall", capacity: 0, location: "Main Entrance, off Ajmer–Jaipur Expressway, Dahmi Kalan", block: "Entrance", floor: "Ground", facilities: ["Security", "Reception", "Parking"], available: true, image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=250&fit=crop", directions: "Located on Jaipur–Ajmer Expressway (NH-48), Dehmi Kalan, near Bagru.", lat: 26.8438552, lng: 75.5652343 },
  { id: "v2", name: "Grand Auditorium (Dome)", type: "auditorium", capacity: 1200, location: "Dome Building, MUJ Campus", block: "Dome", floor: "Ground", facilities: ["Projector", "Sound System", "AC", "Stage", "Green Room"], available: true, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop", directions: "Iconic dome-shaped auditorium near the central academic core.", lat: 26.8415795, lng: 75.5659346 },
  { id: "v3", name: "Academic Block 2 (AB-2)", type: "classroom", capacity: 400, location: "Academic Block 2, MUJ Campus", block: "AB-2", floor: "Multi-floor", facilities: ["Classrooms", "Labs", "Projector", "AC", "WiFi"], available: true, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop", directions: "South of the Main Gate, along the central avenue.", lat: 26.8416671, lng: 75.5653596 },
  { id: "v4", name: "Grand Staircase / Amphitheatre", type: "hall", capacity: 500, location: "Central Plaza, MUJ", block: "Grand Staircase", floor: "Open", facilities: ["Open Seating", "Stage", "Lighting"], available: true, image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=250&fit=crop", directions: "Iconic stepped plaza between AB-1 and AB-2, popular for fests and gatherings.", lat: 26.8426527, lng: 75.5658476 },
  { id: "v5", name: "Central Library", type: "library", capacity: 1500, location: "Manipal University Library, MUJ", block: "Library", floor: "G+3", facilities: ["Study Halls", "Digital Resources", "AC", "Discussion Rooms"], available: true, image: "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=250&fit=crop", directions: "Adjacent to the Dome Building, central academic zone.", lat: 26.8415516, lng: 75.5653663 },
  { id: "v6", name: "MUJ Football Ground", type: "ground", capacity: 3000, location: "Manipal University Rd, Dahmi Kalan", block: "Sports", floor: "Open", facilities: ["Football Field", "Floodlights", "Pavilion"], available: true, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop", directions: "North of the academic core, along Manipal University Road.", lat: 26.8444028, lng: 75.5653509 },
  { id: "v7", name: "College Cricket Ground", type: "ground", capacity: 2000, location: "MUJ Sports Zone, Dahmi Kalan", block: "Cricket", floor: "Open", facilities: ["Cricket Pitch", "Practice Nets", "Pavilion"], available: true, image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=250&fit=crop", directions: "North-west corner of the campus, beyond the football ground.", lat: 26.8455207, lng: 75.5641764 },
  { id: "v8", name: "University Swimming Pool", type: "ground", capacity: 200, location: "MUJ Sports Complex, Dahmi Kalan", block: "Sports", floor: "Open", facilities: ["Olympic-size Pool", "Lifeguards", "Changing Rooms"], available: true, image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=250&fit=crop", directions: "South-west of the academic blocks, inside the sports zone.", lat: 26.8398025, lng: 75.5619639 },
  { id: "v9", name: "Medical Centre", type: "lab", capacity: 50, location: "Medical Centre, Manipal University", block: "Health", floor: "Ground", facilities: ["OPD", "Pharmacy", "Ambulance", "First Aid"], available: true, image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=250&fit=crop", directions: "Near the central mess area, west side of campus.", lat: 26.8412197, lng: 75.5624464 },
  { id: "v10", name: "Manipal Mess / Food Court", type: "hall", capacity: 800, location: "Manipal Mess, MUJ", block: "Mess", floor: "Ground", facilities: ["Multiple Outlets", "Seating", "WiFi"], available: true, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop", directions: "West side of campus, between hostels and academic blocks.", lat: 26.8410042, lng: 75.5616246 },
  { id: "v11", name: "Boys' Hostel Zone", type: "hostel", capacity: 3000, location: "Hostel Zone (East), MUJ", block: "BH", floor: "G+4", facilities: ["Mess", "WiFi", "Common Room", "Laundry"], available: true, image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=250&fit=crop", directions: "East side of the campus, near the VIP gate.", lat: 26.8432381, lng: 75.5678089 },
  { id: "v12", name: "Girls' Hostel Zone", type: "hostel", capacity: 2500, location: "Hostel Zone (North-East), MUJ", block: "GH", floor: "G+4", facilities: ["Mess", "WiFi", "Common Room", "Security"], available: true, image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=250&fit=crop", directions: "North-east of the academic core, separate gated entry.", lat: 26.8459523, lng: 75.5686624 },
  { id: "v13", name: "Academic Block 1 (AB-1)", type: "classroom", capacity: 500, location: "Academic Block 1, MUJ Campus", block: "AB-1", floor: "Multi-floor", facilities: ["Lecture Halls", "Seminar Rooms", "Projector", "AC", "WiFi"], available: true, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop", directions: "First building on the right after entering the main gate.", lat: 26.8420, lng: 75.5655 },
  { id: "v14", name: "Student Activity Centre (SAC)", type: "hall", capacity: 600, location: "Near Academic Blocks, MUJ", block: "SAC", floor: "Ground + 1", facilities: ["Indoor Sports", "Gym", "Music Room", "Dance Studio"], available: true, image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=250&fit=crop", directions: "Behind AB-1, connected via central walkway near the staircase plaza.", lat: 26.8418, lng: 75.5658 },
  { id: "v15", name: "Administration Block", type: "hall", capacity: 100, location: "Admin Block, MUJ Campus", block: "Admin", floor: "Ground + 1", facilities: ["Reception", "Accounts Office", "Exam Cell", "Registrar Office"], available: true, image: "https://images.unsplash.com/photo-1497366811353-68774cfa566f?w=400&h=250&fit=crop", directions: "Near the main entrance, left side of the driveway.", lat: 26.8428, lng: 75.5652 },
];

const typeColors: Record<string, string> = {
  auditorium: "bg-primary/10 text-primary border-primary/20",
  lab: "bg-accent/10 text-accent border-accent/20",
  ground: "bg-emerald-100 text-emerald-700 border-emerald-200",
  hall: "bg-violet-100 text-violet-700 border-violet-200",
  classroom: "bg-cyan-100 text-cyan-700 border-cyan-200",
  library: "bg-amber-100 text-amber-700 border-amber-200",
  hostel: "bg-rose-100 text-rose-700 border-rose-200",
};

declare global { interface Window { google: any; initMUJMap?: () => void; } }

const VenueFinder = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showDirections, setShowDirections] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const infoWindowRef = useRef<any>(null);

  const types = ["all", "auditorium", "lab", "ground", "hall", "classroom", "library", "hostel"];

  const filtered = venues.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.location.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === "all" || v.type === selectedType;
    return matchSearch && matchType;
  });

  useEffect(() => {
    if (window.google?.maps) { setMapReady(true); return; }
    window.initMUJMap = () => setMapReady(true);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&loading=async&callback=initMUJMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { window.initMUJMap = undefined; };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return;
    const g = window.google.maps;
    mapInstance.current = new g.Map(mapRef.current, { center: MUJ_CENTER, zoom: 16, mapTypeId: "hybrid", streetViewControl: false });
    infoWindowRef.current = new g.InfoWindow();

    venues.forEach(v => {
      const marker = new g.Marker({ position: { lat: v.lat, lng: v.lng }, map: mapInstance.current, title: v.name, animation: g.Animation.DROP });
      marker.addListener("click", () => {
        setSelectedVenue(v);
        infoWindowRef.current.setContent(`<div style="font-family:system-ui;max-width:220px;"><strong style="color:#b45309;">${v.name}</strong><br/><span style="font-size:12px;color:#555;">${v.location}</span><br/><a href="https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}" target="_blank" rel="noopener" style="font-size:12px;color:#0369a1;">Open in Google Maps →</a></div>`);
        infoWindowRef.current.open(mapInstance.current, marker);
      });
      markersRef.current[v.id] = marker;
    });
  }, [mapReady]);

  useEffect(() => {
    if (!selectedVenue || !mapInstance.current) return;
    mapInstance.current.panTo({ lat: selectedVenue.lat, lng: selectedVenue.lng });
    mapInstance.current.setZoom(18);
  }, [selectedVenue]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-flex items-center gap-1">← Back to Home</Link>
          <div className="mt-2">
            <h1 className="font-display text-3xl font-bold text-foreground">
              <MapPin className="w-8 h-8 inline text-primary mr-2" />MUJ Campus Venue Finder
            </h1>
            <p className="text-muted-foreground mt-1">Manipal University Jaipur — Dehmi Kalan, Jaipur. All campus locations on the map.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search venues..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map(t => (
              <Button key={t} variant={selectedType === t ? "default" : "outline"} size="sm" className="rounded-full capitalize" onClick={() => setSelectedType(t)}>
                {t === "all" ? "All Venues" : t}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-3 sticky top-4 shadow-card">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="font-display font-bold text-foreground">Live Campus Map</h3>
                <a href={`https://www.google.com/maps/search/Manipal+University+Jaipur/@${MUJ_CENTER.lat},${MUJ_CENTER.lng},17z`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div ref={mapRef} className="w-full h-[500px] rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                {!mapReady && <p className="text-muted-foreground text-sm">Loading Google Maps…</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <p className="text-sm text-muted-foreground">{filtered.length} venue(s) found</p>
            <AnimatePresence mode="popLayout">
              {filtered.map((venue, i) => (
                <motion.div key={venue.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                  className={`bg-card border rounded-2xl overflow-hidden transition-all cursor-pointer ${selectedVenue?.id === venue.id ? "border-primary shadow-warm" : "border-border shadow-card"}`}
                  onClick={() => setSelectedVenue(venue)}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-foreground">{venue.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{venue.location}</p>
                      </div>
                      <Badge className={`${typeColors[venue.type]} border text-[10px] capitalize`}>{venue.type}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {venue.capacity > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{venue.capacity}</span>}
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{venue.block}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{venue.floor}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {venue.facilities.slice(0, 4).map(f => (
                        <span key={f} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="text-primary h-7 px-2 text-xs" onClick={e => { e.stopPropagation(); setShowDirections(showDirections === venue.id ? null : venue.id); }}>
                        <Navigation className="w-3 h-3 mr-1" />{showDirections === venue.id ? "Hide" : "Directions"}
                        <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${showDirections === venue.id ? "rotate-90" : ""}`} />
                      </Button>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-primary hover:underline inline-flex items-center gap-1 ml-auto">
                        Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <AnimatePresence>
                      {showDirections === venue.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-2 bg-muted/50 rounded-xl p-3 text-xs text-foreground">
                            <p className="font-semibold text-[10px] text-muted-foreground uppercase mb-1">From Main Gate</p>
                            <p>{venue.directions}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueFinder;