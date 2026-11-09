import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "./api";
import { useAuth } from "./context/AuthContext";

const fallbackImages = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1000",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1000"
];
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
function Header() {
  const { user, logout } = useAuth();
  return <header className="header"><Link className="brand" to="/">⌂ StayEase</Link><nav><NavLink to="/">Explore</NavLink>{user && <><NavLink to="/host">Host</NavLink><NavLink to="/trips">My trips</NavLink></>}</nav><div className="header-right">{user ? <><span className="welcome">Hi, {user.name.split(" ")[0]}</span><button className="outline small" onClick={logout}>Log out</button></> : <Link className="outline small" to="/login">Log in</Link>}<Link className="avatar" to={user ? "/host" : "/login"}>☰</Link></div></header>;
}
function Footer() { return <footer>© {new Date().getFullYear()} StayEase · Find a place that feels like yours.</footer>; }
function Layout() { return <><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/register" element={<AuthPage mode="register"/>}/><Route path="/listing/:id" element={<ListingPage/>}/><Route path="/host" element={<HostPage/>}/><Route path="/trips" element={<TripsPage/>}/><Route path="*" element={<Home/>}/></Routes><Footer/></>; }

function Home() {
  const [searchParams] = useSearchParams();
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [category, setCategory] = useState("All stays");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const categories = ["All stays", "Amazing views", "Cabins", "Beachfront", "Countryside", "Design"];
  useEffect(() => {
    setLoading(true);
    api.get("/listings", { params: { location, category } })
      .then(({data}) => { setListings(data.listings); setError(""); })
      .catch(() => setError("Could not load stays. Check that the backend and MongoDB are running."))
      .finally(() => setLoading(false));
  }, [location, category]);
  return <main className="container">
    <section className="hero"><div><p className="eyebrow">YOUR NEXT GETAWAY STARTS HERE</p><h1>Find a stay<br/><em>worth remembering.</em></h1><p className="hero-copy">Discover unique homes, thoughtful spaces and places to slow down.</p></div><div className="search-panel"><label>Where</label><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Search destinations"/><span className="search-hint">Try Hyderabad, Goa, Bengaluru…</span></div></section>
    <div className="category-row">{categories.map(c=><button key={c} className={category===c?"category active":"category"} onClick={()=>setCategory(c)}>{c==="All stays"?"⌂":c==="Cabins"?"⌂":c==="Beachfront"?"♧":"✧"}<span>{c}</span></button>)}</div>
    <div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>Explore stays</h2></div><span className="muted">{listings.length} places to discover</span></div>
    {loading ? <p className="notice">Finding lovely places…</p> : error ? <p className="notice error">{error}</p> : listings.length===0 ? <div className="empty"><h3>No stays found yet</h3><p>Try another destination, or sign in and add the first property.</p><Link className="primary" to="/host">Become a host</Link></div> :
      <div className="grid">{listings.map((item,i)=><ListingCard key={item._id} item={item} index={i}/>)}</div>}
  </main>;
}
function ListingCard({item,index}) {
  return <Link className="listing-card" to={`/listing/${item._id}`}><div className="image-wrap"><img src={item.image || fallbackImages[index%4]} onError={e=>e.currentTarget.src=fallbackImages[index%4]} alt={item.title}/><span className="image-tag">{item.category || "Stay"}</span><span className="heart">♡</span></div><div className="card-meta"><strong>{item.location}</strong><span>★ 4.9</span></div><p className="card-title">{item.title}</p><p className="muted">Hosted by {item.host?.name || "StayEase host"}</p><p className="price"><strong>{money(item.price)}</strong> <span>/ night</span></p></Link>;
}
function AuthPage({mode}) {
  const isRegister=mode==="register";
  const {login,user}=useAuth(); const navigate=useNavigate();
  const [form,setForm]=useState({name:"",email:"",password:""}); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>{if(user) navigate("/host");},[user,navigate]);
  const submit=async e=>{e.preventDefault();setBusy(true);setError("");try{await login(form,isRegister?"register":"login");navigate("/");}catch(err){setError(err.response?.data?.message||"Something went wrong");}finally{setBusy(false);}};
  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}><p className="eyebrow">WELCOME TO STAYEASE</p><h1>{isRegister?"Create your account":"Welcome back"}</h1><p className="muted">{isRegister?"Join the community and find your next stay.":"Log in to manage your stays and bookings."}</p>{isRegister&&<label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></label>{error&&<p className="error">{error}</p>}<button className="primary full" disabled={busy}>{busy?"Please wait…":isRegister?"Create account":"Log in"}</button><p className="auth-switch">{isRegister?"Already have an account?":"New to StayEase?"} <Link to={isRegister?"/login":"/register"}>{isRegister?"Log in":"Sign up"}</Link></p></form></main>;
}
function ListingPage() {
  const {id}=useParams(); const {user}=useAuth(); const navigate=useNavigate();
  const [listing,setListing]=useState(null); const [error,setError]=useState("");
  const [dates,setDates]=useState({checkIn:"",checkOut:"",guests:1}); const [message,setMessage]=useState("");
  useEffect(()=>{api.get(`/listings/${id}`).then(({data})=>setListing(data.listing)).catch(e=>setError(e.response?.data?.message||"Could not load property"));},[id]);
  const nights=dates.checkIn&&dates.checkOut?Math.max(0,Math.ceil((new Date(dates.checkOut)-new Date(dates.checkIn))/86400000)):0;
  const book=async e=>{e.preventDefault();setMessage("");if(!user){navigate("/login");return;}try{await api.post("/bookings",{listingId:id,...dates});setMessage("Your booking is confirmed! Find it in My trips.");}catch(e){setMessage(e.response?.data?.message||"Booking failed");}};
  if(error)return <main className="container notice error">{error}</main>;
  if(!listing)return <main className="container notice">Loading property…</main>;
  return <main className="container detail-page"><Link to="/" className="back-link">← Back to stays</Link><div className="detail-title"><div><h1>{listing.title}</h1><p className="muted">⌖ {listing.location} · Hosted by {listing.host?.name}</p></div><span className="rating">★ 4.9 · Guest favourite</span></div><img className="detail-image" src={listing.image} alt={listing.title}/><div className="detail-layout"><section><p className="eyebrow">{listing.category}</p><h2>A place to feel at home</h2><p className="description">{listing.description}</p><div className="feature-list"><span>✦ {listing.maxGuests} guests maximum</span><span>✦ Comfortable, thoughtfully prepared stay</span><span>✦ Great location</span></div></section><form className="booking-card" onSubmit={book}><h2>{money(listing.price)} <small>/ night</small></h2><div className="date-grid"><label>CHECK-IN<input required type="date" min={new Date().toISOString().slice(0,10)} value={dates.checkIn} onChange={e=>setDates({...dates,checkIn:e.target.value})}/></label><label>CHECK-OUT<input required type="date" min={dates.checkIn||new Date().toISOString().slice(0,10)} value={dates.checkOut} onChange={e=>setDates({...dates,checkOut:e.target.value})}/></label></div><label>GUESTS<input type="number" min="1" max={listing.maxGuests} value={dates.guests} onChange={e=>setDates({...dates,guests:Number(e.target.value)})}/></label>{nights>0&&<p className="total-line">{nights} nights · Total <strong>{money(nights*listing.price)}</strong></p>}<button className="primary full">Reserve</button>{message&&<p className={message.includes("confirmed")?"success":"error"}>{message}</p>}<p className="muted tiny">You won't be charged in this demo project.</p></form></div></main>;
}

function HostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    category: "Amazing views",
    price: "",
    maxGuests: 2,
    image: ""
  });

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  // Load host properties
  const load = () =>
    api.get("/listings").then(({ data }) =>
      setItems(
        data.listings.filter(
          x =>
            x.host?._id === user?.id ||
            x.host?._id === user?._id
        )
      )
    );

  // Load guest bookings
  const loadBookings = async () => {
    const { data } = await api.get("/bookings/host");
    setBookings(data.bookings);
  };

  // Load dashboard data
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    load().catch(() =>
      setError("Could not load your listings")
    );

    loadBookings().catch(() =>
      setError("Could not load guest bookings")
    );
  }, [user]);

  // Create or update property
  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      let image = form.image;

      if (file) {
        const fd = new FormData();
        fd.append("image", file);

        const up = await api.post("/uploads", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        image = up.data.imageUrl;
      }

      const payload = {
        ...form,
        image,
        price: Number(form.price),
        maxGuests: Number(form.maxGuests)
      };

      if (!image) {
        throw new Error("Add an image URL or upload a photo");
      }

      if (editing) {
        await api.put(`/listings/${editing}`, payload);
      } else {
        await api.post("/listings", payload);
      }

      setForm({
        title: "",
        location: "",
        description: "",
        category: "Amazing views",
        price: "",
        maxGuests: 2,
        image: ""
      });

      setFile(null);
      setEditing(null);

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
        e.message ||
        "Could not save listing"
      );
    } finally {
      setBusy(false);
    }
  };

  // Edit property
  const edit = item => {
    setEditing(item._id);

    setForm({
      title: item.title,
      location: item.location,
      description: item.description,
      category: item.category,
      price: item.price,
      maxGuests: item.maxGuests,
      image: item.image
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete property
  const remove = async id => {
    if (!confirm("Delete this listing?")) return;

    try {
      await api.delete(`/listings/${id}`);
      await load();
      await loadBookings();
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Could not delete listing"
      );
    }
  };

  return (
    <main className="container host-page">

      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR SPACE, YOUR STORY</p>
          <h1>Host dashboard</h1>
          <p className="muted">
            Welcome, {user?.name}. Share a place worth discovering.
          </p>
        </div>
      </div>

      <div className="host-layout">

        {/* Property Form */}
        <form className="form-card" onSubmit={submit}>

          <h2>{editing ? "Edit your stay" : "List a new stay"}</h2>

          <label>
            Property title
            <input
              required
              value={form.title}
              onChange={e =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="e.g. Sunny apartment with a view"
            />
          </label>

          <label>
            Location
            <input
              required
              value={form.location}
              onChange={e =>
                setForm({ ...form, location: e.target.value })
              }
              placeholder="City, area"
            />
          </label>

          <label>
            Description
            <textarea
              required
              rows="4"
              value={form.description}
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Tell guests what makes this place special"
            />
          </label>

          <div className="two-col">

            <label>
              Price per night (₹)
              <input
                required
                type="number"
                min="1"
                value={form.price}
                onChange={e =>
                  setForm({ ...form, price: e.target.value })
                }
              />
            </label>

            <label>
              Max guests
              <input
                required
                type="number"
                min="1"
                value={form.maxGuests}
                onChange={e =>
                  setForm({ ...form, maxGuests: e.target.value })
                }
              />
            </label>

          </div>

          <label>
            Category
            <select
              value={form.category}
              onChange={e =>
                setForm({ ...form, category: e.target.value })
              }
            >
              {[
                "Amazing views",
                "Cabins",
                "Beachfront",
                "Countryside",
                "Design"
              ].map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            Image URL (optional if uploading)
            <input
              value={form.image}
              onChange={e =>
                setForm({ ...form, image: e.target.value })
              }
              placeholder="https://…"
            />
          </label>

          <label>
            Or upload an image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={e =>
                setFile(e.target.files?.[0] || null)
              }
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="primary full" disabled={busy}>
            {busy
              ? "Saving…"
              : editing
              ? "Update property"
              : "Publish property"}
          </button>

          {editing && (
            <button
              type="button"
              className="outline full"
              onClick={() => {
                setEditing(null);
                setForm({
                  title: "",
                  location: "",
                  description: "",
                  category: "Amazing views",
                  price: "",
                  maxGuests: 2,
                  image: ""
                });
              }}
            >
              Cancel edit
            </button>
          )}

        </form>

        {/* Host Properties */}
        <section className="host-list">

          <h2>
            Your properties <span className="count">{items.length}</span>
          </h2>

          {items.length === 0 ? (
            <div className="empty">
              <h3>Your hosting journey starts here</h3>
              <p>Your published properties will appear here.</p>
            </div>
          ) : (
            items.map(x => (
              <div className="host-item" key={x._id}>

                <img src={x.image} alt="" />

                <div className="host-item-info">
                  <strong>{x.title}</strong>
                  <span>{x.location}</span>
                  <b>{money(x.price)} / night</b>
                </div>

                <div className="host-actions">
                  <button
                    className="outline small"
                    onClick={() => edit(x)}
                  >
                    Edit
                  </button>

                  <button
                    className="danger small"
                    onClick={() => remove(x._id)}
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))
          )}

        </section>

      </div>

      {/* Guest Bookings Section */}
      <section className="host-list" style={{ marginTop: "40px" }}>

        <h2>
          Guest Bookings{" "}
          <span className="count">{bookings.length}</span>
        </h2>

        {bookings.length === 0 ? (
          <div className="empty">
            <h3>No guest bookings yet</h3>
            <p>When guests reserve your properties, they will appear here.</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div className="host-item" key={booking._id}>

              <img
                src={booking.listing?.image}
                alt="Property"
              />

              <div className="host-item-info">

                <strong>
                  {booking.listing?.title || "Property"}
                </strong>

                <span>
                  Guest: {booking.guest?.name || "Guest"}
                </span>

                <span>
                  Email: {booking.guest?.email || "Not available"}
                </span>

                <span>
                  Check-in:{" "}
                  {new Date(booking.checkIn).toLocaleDateString("en-IN")}
                </span>

                <span>
                  Check-out:{" "}
                  {new Date(booking.checkOut).toLocaleDateString("en-IN")}
                </span>

                <span>
                  Guests: {booking.guests}
                </span>

                <b>
                  Total: {money(booking.totalPrice)}
                </b>

                <span>
                  Status: {booking.status}
                </span>

              </div>

            </div>
          ))
        )}

      </section>

    </main>
  );
}


function TripsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  // Load bookings
  const load = async () => {
    const { data } = await api.get("/bookings/mine");
    setBookings(data.bookings || []);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    load()
      .catch(() => setError("Could not load bookings"))
      .finally(() => setLoading(false));
  }, [user]);

  // Cancel booking
  const cancel = async id => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    setCancelling(id);
    setError("");

    try {
      await api.patch(`/bookings/${id}/cancel`);
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Could not cancel booking"
      );
    } finally {
      setCancelling(null);
    }
  };

  return (
    <main className="container trips-page">

      <p className="eyebrow">YOUR TRAVEL JOURNAL</p>

      <h1>My trips</h1>

      <p className="muted">
        All your upcoming and past getaways in one place.
      </p>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="empty">
          <h2>Loading your trips...</h2>
        </div>
      ) : bookings.length === 0 ? (

        <div className="empty">
          <h2>No trips booked yet</h2>
          <p>Your next memorable stay is waiting.</p>
          <Link className="primary" to="/">
            Explore stays
          </Link>
        </div>

      ) : (

        <div className="trip-list">

          {bookings.map(b => (

            <div className="trip-card" key={b._id}>

              <img
                src={b.listing?.image || fallbackImages[0]}
                alt="Property"
              />

              <div className="trip-info">

                <span
                  className={
                    b.status === "confirmed"
                      ? "status"
                      : "status cancelled"
                  }
                >
                  {b.status === "confirmed"
                    ? "Confirmed"
                    : "Cancelled"}
                </span>

                <h3>
                  {b.listing?.title || "Property"}
                </h3>

                <p>{b.listing?.location}</p>

                <p>
                  Check-in:{" "}
                  {new Date(b.checkIn).toLocaleDateString("en-IN")}
                </p>

                <p>
                  Check-out:{" "}
                  {new Date(b.checkOut).toLocaleDateString("en-IN")}
                </p>

                <p>Guests: {b.guests}</p>

                <strong>{money(b.totalPrice)}</strong>

              </div>

              {b.status === "confirmed" && (
                <button
                  className="outline small"
                  disabled={cancelling === b._id}
                  onClick={() => cancel(b._id)}
                >
                  {cancelling === b._id
                    ? "Cancelling..."
                    : "Cancel booking"}
                </button>
              )}

            </div>

          ))}

        </div>

      )}

    </main>
  );

}

function App() {
  return <Layout />;
}

export default App;
